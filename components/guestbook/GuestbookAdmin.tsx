"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUpRight,
  Eye,
  EyeOff,
  LogOut,
  Pin,
  Search,
  ShieldCheck,
  Trash2,
  MessageSquare,
  X,
} from "lucide-react";
import {
  api,
  fullTime,
  RequestError,
  trapDialogTab,
} from "@/lib/guestbook/client";
import type { Message, MessagePage, Stats } from "@/lib/guestbook/types";

type AdminPage = MessagePage & { stats: Stats };
export default function GuestbookAdmin() {
  const [session, setSession] = useState<"checking" | "anonymous" | "admin">(
    "checking",
  );
  const [email, setEmail] = useState("");
  const [rows, setRows] = useState<Message[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [selected, setSelected] = useState<Message | null>(null);
  const [mode, setMode] = useState<"reply" | "delete">("reply");
  const [reply, setReply] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const generation = useRef(0);
  const busyRef = useRef(false);
  const load = useCallback(
    async (next?: string) => {
      const request = ++generation.current;
      const params = new URLSearchParams({ search: query });
      if (status) params.set("status", status);
      if (next) params.set("cursor", next);
      setBusy(true);
      setError("");
      try {
        const data = await api<AdminPage>(`/api/admin/guestbook?${params}`);
        if (request !== generation.current) return;
        setRows((previous) =>
          next
            ? [
                ...new Map(
                  [...previous, ...data.messages].map((row) => [row.id, row]),
                ).values(),
              ]
            : data.messages,
        );
        setStats(data.stats);
        setCursor(data.nextCursor);
      } catch (error) {
        if (request !== generation.current) return;
        setError(error instanceof Error ? error.message : "加载失败");
        if (
          error instanceof RequestError &&
          (error.status === 401 || error.status === 403)
        ) {
          setSession("anonymous");
          setRows([]);
          setStats(null);
        }
      } finally {
        if (request === generation.current) setBusy(false);
      }
    },
    [query, status],
  );
  useEffect(() => {
    void api<{ email: string }>("/api/admin/session")
      .then((user) => {
        setEmail(user.email);
        setSession("admin");
      })
      .catch((error) => {
        setSession("anonymous");
        if (error instanceof RequestError && error.status !== 401)
          setError(error.message);
      });
  }, []);
  useEffect(() => {
    if (session === "admin") void load();
  }, [session, load]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(timer);
  }, [toast]);
  async function mutate(row: Message, patch?: unknown) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      await api(`/api/admin/guestbook/${row.id}`, {
        method: patch ? "PATCH" : "DELETE",
        ...(patch ? { body: JSON.stringify(patch) } : {}),
      });
      dialog.current?.close();
      setSelected(null);
      setToast(patch ? "留言已更新" : "留言已删除");
      await load();
    } catch (error) {
      const text = error instanceof Error ? error.message : "操作失败";
      setError(text);
      setToast(text);
      if (error instanceof RequestError && [401, 403].includes(error.status)) {
        dialog.current?.close();
        setSession("anonymous");
        setRows([]);
        setStats(null);
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  return (
    <main id="main" className="gb-admin">
      <header className="gb-admin-nav">
        <Link href="/" className="brand">
          YS<span>.</span>
        </Link>
        <span className="micro">/ VISITOR WALL / CONTROL ROOM</span>
        <Link href="/#guestbook" className="text-button">
          <ArrowLeft size={13} /> 返回网站
        </Link>
      </header>
      {session !== "admin" ? (
        <div className="gb-login panel">
          <ShieldCheck size={29} />
          <span className="eyebrow">PRIVATE WORKSPACE</span>
          <h1>欢迎回来。</h1>
          <p>登录你的管理员账户，照料每一次真实的相遇。</p>
          {session === "checking" ? (
            <p role="status">正在验证会话…</p>
          ) : (
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                if (busyRef.current) return;
                busyRef.current = true;
                setBusy(true);
                setError("");
                const form = new FormData(event.currentTarget);
                try {
                  const user = await api<{ email: string }>(
                    "/api/admin/session",
                    {
                      method: "POST",
                      body: JSON.stringify({
                        email: form.get("email"),
                        password: form.get("password"),
                      }),
                    },
                  );
                  setEmail(user.email);
                  setSession("admin");
                } catch (error) {
                  setError(error instanceof Error ? error.message : "登录失败");
                } finally {
                  busyRef.current = false;
                  setBusy(false);
                }
              }}
            >
              <label htmlFor="admin-email">邮箱</label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="username"
                required
              />
              <label htmlFor="admin-password">密码</label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
              <button className="button button-light" disabled={busy}>
                {busy ? "正在登录…" : "进入管理工作台"}
                <ArrowUpRight size={15} />
              </button>
            </form>
          )}
          {error && (
            <p className="gb-admin-error" role="alert">
              {error}
            </p>
          )}
          <span className="gb-quiet">SUPABASE AUTH · 仅限已授权账户</span>
        </div>
      ) : (
        <div className="gb-admin-body">
          <div className="gb-admin-heading">
            <div>
              <span className="eyebrow">COMMUNITY / OVERVIEW</span>
              <h1>
                每一次相遇，<span>值得回应。</span>
              </h1>
              <p>Visitor Wall · 留言管理工作台</p>
            </div>
            <button
              className="button button-outline"
              disabled={busy}
              onClick={async () => {
                try {
                  await api("/api/admin/session", { method: "DELETE" });
                  setSession("anonymous");
                  setRows([]);
                  setStats(null);
                  setError("");
                } catch (error) {
                  setToast(error instanceof Error ? error.message : "退出失败");
                }
              }}
            >
              <LogOut size={14} /> 退出登录
            </button>
          </div>
          <div className="gb-admin-stats">
            {[
              ["全部留言", stats?.total],
              ["今日留言", stats?.today],
              ["近 7 天", stats?.week],
              ["累计点赞", stats?.likes],
            ].map(([label, value]) => (
              <div className="panel" key={label}>
                <span>{label}</span>
                <strong className="mono">{value ?? "—"}</strong>
                <small>DATABASE / UTC+8</small>
              </div>
            ))}
          </div>
          <div className="gb-trend panel">
            <div>
              <span className="micro">MESSAGE GROWTH</span>
              <h2>最近七天的足迹</h2>
              <p>包含可见与隐藏留言 · 北京时间</p>
            </div>
            <div
              className="gb-bars"
              role="img"
              aria-label={
                stats?.trend
                  .map((day) => `${day.day}：${day.count} 条`)
                  .join("；") || "正在加载趋势"
              }
            >
              {stats?.trend.map((day) => (
                <div key={day.day}>
                  <span>{day.count}</span>
                  <i
                    style={{
                      height: `${Math.max(2, (day.count / Math.max(1, ...stats.trend.map((item) => item.count))) * 84)}px`,
                    }}
                  />
                  <small>{day.day.slice(5).replace("-", ".")}</small>
                </div>
              ))}
            </div>
          </div>
          <div className="gb-admin-toolbar">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setQuery(search.trim());
              }}
            >
              <Search size={16} />
              <input
                aria-label="搜索留言或昵称"
                placeholder="搜索昵称、留言内容…"
                value={search}
                maxLength={100}
                onChange={(event) => setSearch(event.target.value)}
              />
              <button type="submit" className="text-button">
                搜索
              </button>
            </form>
            <select
              aria-label="筛选留言状态"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">全部状态</option>
              <option value="visible">公开可见</option>
              <option value="hidden">已隐藏</option>
            </select>
            <button
              className="button button-outline"
              disabled={busy}
              onClick={() => void load()}
            >
              刷新
            </button>
          </div>
          {error && (
            <p role="alert" className="gb-admin-error">
              {error}
            </p>
          )}
          <div className="gb-admin-list" aria-busy={busy}>
            {rows.map((row) => (
              <article key={row.id} className="panel gb-admin-row">
                <header>
                  <strong>{row.nickname}</strong>
                  <span
                    className={`tag ${row.status === "visible" ? "tag-green" : ""}`}
                  >
                    {row.status === "visible" ? "公开可见" : "已隐藏"}
                  </span>
                  {row.is_pinned && <Pin size={13} />}
                  <time dateTime={row.created_at}>
                    {fullTime(row.created_at)}
                  </time>
                </header>
                <p>{row.content}</p>
                {row.reply_content && (
                  <div className="gb-owner">
                    <span className="micro">YESEN / 站长回复</span>
                    <p>{row.reply_content}</p>
                  </div>
                )}
                <footer>
                  <span className="gb-quiet">{row.likes_count} 次点赞</span>
                  <div>
                    <button
                      disabled={busy}
                      onClick={() =>
                        void mutate(row, {
                          action: "pin",
                          is_pinned: !row.is_pinned,
                        })
                      }
                    >
                      <Pin size={14} />
                      {row.is_pinned ? "取消置顶" : "置顶"}
                    </button>
                    <button
                      disabled={busy}
                      onClick={() =>
                        void mutate(row, {
                          action: "visibility",
                          status:
                            row.status === "visible" ? "hidden" : "visible",
                        })
                      }
                    >
                      {row.status === "visible" ? (
                        <EyeOff size={14} />
                      ) : (
                        <Eye size={14} />
                      )}{" "}
                      {row.status === "visible" ? "隐藏" : "恢复"}
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => {
                        setSelected(row);
                        setReply(row.reply_content || "");
                        setMode("reply");
                        dialog.current?.showModal();
                      }}
                    >
                      <MessageSquare size={14} />
                      回复
                    </button>
                    <button
                      disabled={busy}
                      className="gb-danger"
                      onClick={() => {
                        setSelected(row);
                        setMode("delete");
                        dialog.current?.showModal();
                      }}
                    >
                      <Trash2 size={14} />
                      删除
                    </button>
                  </div>
                </footer>
              </article>
            ))}
          </div>
          {!busy && rows.length === 0 && !error && (
            <div className="gb-empty panel">
              <span className="micro">A QUIET MOMENT.</span>
              <p>
                {query || status
                  ? "没有匹配的留言。"
                  : "第一段对话，还在路上。"}
              </p>
            </div>
          )}
          {cursor && (
            <button
              className="button button-outline gb-load"
              disabled={busy}
              onClick={() => void load(cursor)}
            >
              加载更多 <ArrowDown size={14} />
            </button>
          )}
          <div className="gb-admin-footer">
            <span>已验证身份：{email}</span>
            <span className="micro">SERVER AUTHORIZATION · RLS ENABLED</span>
          </div>
        </div>
      )}
      <dialog
        ref={dialog}
        onKeyDown={trapDialogTab}
        className="gb-admin-dialog"
        aria-labelledby="gb-admin-dialog-title"
      >
        <div>
          <button
            className="icon-button gb-close"
            aria-label="关闭"
            onClick={() => dialog.current?.close()}
          >
            <X size={19} />
          </button>
          <span className="eyebrow">
            {mode === "reply" ? "OWNER REPLY" : "DELETE MESSAGE"}
          </span>
          <h2 id="gb-admin-dialog-title">
            {mode === "reply"
              ? `回复 ${selected?.nickname || ""}`
              : "永久删除这条留言？"}
          </h2>
          {mode === "reply" ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (selected)
                  void mutate(selected, {
                    action: "reply",
                    content: reply.trim() || null,
                  });
              }}
            >
              <label htmlFor="owner-reply">你的回复</label>
              <textarea
                id="owner-reply"
                value={reply}
                maxLength={600}
                rows={5}
                onChange={(event) => setReply(event.target.value)}
              />
              <p className="gb-quiet">
                {reply.length} / 600 · 清空并保存可移除回复。
              </p>
              <button className="button button-light" disabled={busy}>
                保存回复
              </button>
            </form>
          ) : (
            <>
              <p>删除后无法恢复。你也可以关闭此窗口，选择隐藏留言。</p>
              <button
                disabled={busy}
                className="button button-outline gb-danger"
                onClick={() => selected && void mutate(selected)}
              >
                确认删除
              </button>
            </>
          )}
        </div>
      </dialog>
      <div className="gb-toast" role="status" aria-live="polite">
        {toast && <span>{toast}</span>}
      </div>
    </main>
  );
}
