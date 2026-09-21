"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, MessageSquare, Radio } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import { browserSupabase } from "@/lib/supabase/client";
import { api, mergeMessages } from "@/lib/guestbook/client";
import type { Message, MessagePage, Stats } from "@/lib/guestbook/types";
import GuestbookComposer from "./GuestbookComposer";
import GuestbookMessage from "./GuestbookMessage";
import SystemArchitecture from "./SystemArchitecture";

type Connection = "connecting" | "live" | "reconnecting" | "offline";
export default function Guestbook() {
  const [messages, setMessages] = useState<Message[]>([]);
  const rows = useRef<Message[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [database, setDatabase] = useState(false);
  const [connection, setConnection] = useState<Connection>("connecting");
  const [online, setOnline] = useState<number | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  const [toast, setToast] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [liked, setLiked] = useState<string[]>([]);
  const [liking, setLiking] = useState<string[]>([]);
  const likesPending = useRef(new Set<string>());
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackTimers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const notify = useCallback((text: string) => {
    setToast(text);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setToast(""), 4500);
  }, []);
  const update = useCallback((incoming: Message[]) => {
    setMessages((previous) => {
      const result = mergeMessages(previous, incoming);
      rows.current = result;
      return result;
    });
  }, []);
  const remove = useCallback((id: string) => {
    setMessages((previous) => {
      const result = previous.filter((row) => row.id !== id);
      rows.current = result;
      return result;
    });
  }, []);
  const refreshStats = useCallback(async () => {
    try {
      setStats(await api<Stats>("/api/guestbook/stats"));
      setDatabase(true);
    } catch {
      setDatabase(false);
    }
  }, []);
  const reconcile = useCallback(
    async (initial = false) => {
      try {
        const page = await api<MessagePage>("/api/guestbook");
        update(page.messages);
        if (initial) setCursor(page.nextCursor);
        // Check loaded IDs in bounded batches after a disconnect, without downloading the entire table.
        const ids = rows.current.map((row) => row.id);
        for (let offset = 0; offset < ids.length; offset += 100) {
          const chunk = ids.slice(offset, offset + 100);
          const current = await api<{ messages: Message[] }>(
            `/api/guestbook?ids=${chunk.join(",")}`,
          );
          const visible = new Set(current.messages.map((row) => row.id));
          chunk.filter((id) => !visible.has(id)).forEach(remove);
          update(current.messages);
        }
        setDatabase(true);
        await refreshStats();
      } catch {
        setDatabase(false);
      } finally {
        setLoading(false);
      }
    },
    [update, remove, refreshStats],
  );

  useEffect(() => {
    let disposed = false;
    let statsTimer: ReturnType<typeof setTimeout> | undefined;
    try {
      const saved = JSON.parse(
        localStorage.getItem("liked_message_ids") || "[]",
      );
      if (Array.isArray(saved))
        setLiked(saved.filter((id) => typeof id === "string").slice(-2000));
    } catch {
      /* Storage is optional. */
    }
    const tick = setInterval(() => setNow(Date.now()), 1000);
    void reconcile(true);
    const supabase = browserSupabase();
    const statsSoon = () => {
      if (statsTimer) clearTimeout(statsTimer);
      statsTimer = setTimeout(() => void refreshStats(), 400);
    };
    const receive = (row: Message) => {
      if (disposed) return;
      update([row]);
      statsSoon();
    };
    const presenceKey = crypto.randomUUID();
    const channel = supabase
      ?.channel("visitor-wall", { config: { presence: { key: presenceKey } } })
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "guestbook_messages" },
        (payload) => receive(payload.new as Message),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "guestbook_messages" },
        (payload) => receive(payload.new as Message),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "guestbook_events" },
        (payload) => {
          remove(payload.new.message_id as string);
          statsSoon();
        },
      )
      .on("presence", { event: "sync" }, () => {
        if (!disposed && channel)
          setOnline(Object.keys(channel.presenceState()).length);
      })
      .subscribe(async (status) => {
        if (disposed) return;
        if (status === "SUBSCRIBED") {
          const tracked = await channel?.track({ online: true });
          if (disposed) return;
          setConnection(tracked === "ok" ? "live" : "reconnecting");
          void reconcile();
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          setConnection("reconnecting");
          setOnline(null);
        }
      });
    if (!supabase) setConnection("offline");
    const resume = () => {
      if (document.visibilityState === "visible") void reconcile();
    };
    const untrack = () => {
      void channel?.untrack();
    };
    const pageShow = () => {
      void channel?.track({ online: true });
      void reconcile();
    };
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("online", resume);
    window.addEventListener("pagehide", untrack);
    window.addEventListener("pageshow", pageShow);
    // Low-frequency reconciliation repairs missed events and refreshes the UTC+8 day boundary.
    const repair = setInterval(() => {
      if (document.visibilityState === "visible") void reconcile();
    }, 60000);
    const timers = fallbackTimers.current;
    return () => {
      disposed = true;
      clearInterval(tick);
      clearInterval(repair);
      if (statsTimer) clearTimeout(statsTimer);
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
      timers.forEach(clearTimeout);
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("online", resume);
      window.removeEventListener("pagehide", untrack);
      window.removeEventListener("pageshow", pageShow);
      if (channel) void supabase?.removeChannel(channel);
    };
  }, [reconcile, refreshStats, remove, update]);

  const stateLabel =
    connection === "live"
      ? "LIVE"
      : connection === "connecting"
        ? "CONNECTING"
        : connection === "reconnecting"
          ? "RECONNECTING"
          : "OFFLINE";
  return (
    <section id="guestbook" className="section section-anchor gb-section">
      <div className="container">
        <div className="gb-heading">
          <SectionHeading
            index="11"
            eyebrow="VISITOR WALL"
            title={
              <>
                留下你的<span className="serif-accent">足迹。</span>
              </>
            }
            description="这个网站记录我的学习与实践，也希望记录每一次真实的相遇。"
          />
          <span
            className={`gb-live micro ${connection === "live" ? "is-live" : ""}`}
          >
            <i />
            {stateLabel}
          </span>
        </div>
        <div className="gb-layout">
          <div className="gb-left">
            <div className="gb-intro">
              <Radio size={16} />
              <p>
                你留下的一句话，会在另一块屏幕上实时出现。
                <span>留言由实时数据库同步，无需刷新页面。</span>
              </p>
            </div>
            <GuestbookComposer
              ready={database}
              now={now}
              notify={notify}
              onAccepted={(message) => {
                // Normal path is the INSERT subscription. A targeted fallback repairs a missed event only.
                if (!message) return;
                const timer = setTimeout(async () => {
                  fallbackTimers.current.delete(timer);
                  if (rows.current.some((row) => row.id === message.id)) return;
                  try {
                    const result = await api<{ messages: Message[] }>(
                      `/api/guestbook?ids=${message.id}`,
                    );
                    update(result.messages);
                    void refreshStats();
                  } catch {
                    notify("留言已保存，实时连接正在恢复。");
                  }
                }, 4000);
                fallbackTimers.current.add(timer);
              }}
            />
            <div className="gb-system panel">
              <div className="gb-system-top">
                <span className="micro">LIVE SYSTEM</span>
                <span className="gb-quiet micro">STATUS / 01</span>
              </div>
              <dl>
                <div>
                  <dt>Database</dt>
                  <dd className={database ? "gb-connected" : ""}>
                    <i />
                    {database
                      ? "Connected"
                      : loading
                        ? "Connecting"
                        : "Unavailable"}
                  </dd>
                </div>
                <div>
                  <dt>Realtime</dt>
                  <dd className={connection === "live" ? "gb-connected" : ""}>
                    <i />
                    {connection === "live"
                      ? "Active"
                      : stateLabel.toLowerCase()}
                  </dd>
                </div>
              </dl>
              <div className="gb-metrics">
                <div>
                  <strong key={`online-${online}`} className="mono">
                    {online ?? "—"}
                  </strong>
                  <span>当前在线</span>
                </div>
                <div>
                  <strong key={`total-${stats?.total}`} className="mono">
                    {stats?.total ?? "—"}
                  </strong>
                  <span>累计留言</span>
                </div>
                <div>
                  <strong key={`today-${stats?.today}`} className="mono">
                    {stats?.today ?? "—"}
                  </strong>
                  <span>今日留言</span>
                </div>
              </div>
              <div className="gb-system-bottom">
                <span>每一次相遇，都有回响。</span>
                <span className="mono">{stats?.likes ?? "—"} LIKES</span>
              </div>
            </div>
            <div className="gb-under">
              <span className="micro">REALTIME · SUPABASE</span>
              <SystemArchitecture />
            </div>
          </div>
          <div className="gb-right">
            <div className="gb-list-heading">
              <span className="micro">TRACES & CONNECTIONS</span>
              <span className="gb-quiet">
                最新相遇 <ArrowDown size={12} />
              </span>
            </div>
            {!database && !loading && (
              <div className="gb-error" role="status">
                <span>留言服务暂时无法连接。</span>
                <button
                  className="text-button"
                  onClick={() => void reconcile(true)}
                >
                  重新连接 <ArrowUpRight size={14} />
                </button>
              </div>
            )}
            {loading && (
              <div className="gb-empty">
                <div className="gb-loading-line" />
                <span className="micro">CONNECTING THE DOTS…</span>
              </div>
            )}
            {!loading && database && messages.length === 0 && (
              <div className="gb-empty panel">
                <MessageSquare size={29} />
                <span className="micro">BE THE FIRST.</span>
                <h3>成为第一个留下足迹的人。</h3>
                <p>一句问候，也是一段连接的开始。</p>
              </div>
            )}
            <div className="gb-list" role="region" aria-label="访客留言">
              {messages.map((message) => (
                <GuestbookMessage
                  key={message.id}
                  message={message}
                  now={now}
                  liked={liked.includes(message.id)}
                  busy={liking.includes(message.id)}
                  like={async () => {
                    if (likesPending.current.has(message.id)) return;
                    likesPending.current.add(message.id);
                    setLiking((previous) => [...previous, message.id]);
                    try {
                      const result = await api<{
                        likes_count: number;
                        already_liked: boolean;
                      }>(`/api/guestbook/${message.id}/like`, {
                        method: "POST",
                      });
                      setLiked((previous) => {
                        const next = [
                          ...new Set([...previous, message.id]),
                        ].slice(-2000);
                        try {
                          localStorage.setItem(
                            "liked_message_ids",
                            JSON.stringify(next),
                          );
                        } catch {}
                        return next;
                      });
                      setMessages((previous) => {
                        const next = previous.map((row) =>
                          row.id === message.id
                            ? {
                                ...row,
                                likes_count: Math.max(
                                  row.likes_count,
                                  result.likes_count,
                                ),
                              }
                            : row,
                        );
                        rows.current = next;
                        return next;
                      });
                      notify(
                        result.already_liked
                          ? "你已经赞过这条留言"
                          : "点赞成功",
                      );
                      void refreshStats();
                    } catch (error) {
                      notify(
                        error instanceof Error ? error.message : "点赞失败",
                      );
                    } finally {
                      likesPending.current.delete(message.id);
                      setLiking((previous) =>
                        previous.filter((id) => id !== message.id),
                      );
                    }
                  }}
                />
              ))}
            </div>
            {cursor && (
              <button
                className="gb-load button button-outline"
                disabled={more}
                onClick={async () => {
                  if (more) return;
                  setMore(true);
                  try {
                    const page = await api<MessagePage>(
                      `/api/guestbook?cursor=${encodeURIComponent(cursor)}`,
                    );
                    update(page.messages);
                    setCursor(page.nextCursor);
                  } catch (error) {
                    notify(error instanceof Error ? error.message : "加载失败");
                  } finally {
                    setMore(false);
                  }
                }}
              >
                {more ? "正在加载…" : "加载更多足迹"}
                <ArrowDown size={14} />
              </button>
            )}
          </div>
        </div>
        <div
          className="gb-toast"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {toast && <span key={toast}>{toast}</span>}
        </div>
      </div>
    </section>
  );
}
