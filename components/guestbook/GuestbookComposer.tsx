"use client";
import { useRef, useState } from "react";
import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";
import Spotlight from "@/components/Spotlight";
import { api, RequestError } from "@/lib/guestbook/client";
import { submissionSchema } from "@/lib/guestbook/validation";
import type { Message } from "@/lib/guestbook/types";

export default function GuestbookComposer({
  ready,
  now,
  notify,
  onAccepted,
}: {
  ready: boolean;
  now: number;
  notify: (text: string) => void;
  onAccepted: (message: Message | null) => void;
}) {
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [until, setUntil] = useState(0);
  const pending = useRef(false);
  const request = useRef<{ fingerprint: string; id: string } | null>(null);
  const cooldown = Math.max(0, Math.ceil((until - now) / 1000));
  return (
    <Spotlight className="gb-composer panel">
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (pending.current || cooldown || !ready) return;
          const form = event.currentTarget;
          const fingerprint = JSON.stringify([nickname.trim(), content.trim()]);
          if (!request.current || request.current.fingerprint !== fingerprint)
            request.current = { fingerprint, id: crypto.randomUUID() };
          const parsed = submissionSchema.safeParse({
            nickname,
            content,
            requestId: request.current.id,
          });
          if (!parsed.success) {
            notify(parsed.error.issues[0].message);
            return;
          }
          pending.current = true;
          setBusy(true);
          setSent(false);
          try {
            const result = await api<{ message: Message | null }>(
              "/api/guestbook",
              { method: "POST", body: JSON.stringify(parsed.data) },
            );
            setContent("");
            setSent(true);
            request.current = null;
            setUntil(Date.now() + 20000);
            notify("留言发送成功");
            onAccepted(result.message);
            const textarea = form.querySelector("textarea");
            if (textarea) textarea.style.height = "";
          } catch (error) {
            notify(
              error instanceof Error ? error.message : "发送失败，请稍后重试。",
            );
            if (error instanceof RequestError && error.retryAfter)
              setUntil(Date.now() + error.retryAfter * 1000);
          } finally {
            pending.current = false;
            setBusy(false);
          }
        }}
      >
        <div className="gb-composer-heading">
          <span className="micro">A NOTE, A CONNECTION.</span>
          <span className="gb-quiet">无需登录 · 真诚交流</span>
        </div>
        <label htmlFor="gb-nickname">你的名字</label>
        <input
          id="gb-nickname"
          name="nickname"
          value={nickname}
          onChange={(event) =>
            setNickname([...event.target.value].slice(0, 20).join(""))
          }
          placeholder="让这次相遇，有一个名字"
          autoComplete="nickname"
          required
          disabled={busy}
        />
        <label htmlFor="gb-content" className="sr-only">
          想说些什么？
        </label>
        <textarea
          id="gb-content"
          name="content"
          value={content}
          rows={4}
          placeholder="想说些什么？"
          required
          disabled={busy}
          onChange={(event) => {
            setContent([...event.target.value].slice(0, 300).join(""));
            setSent(false);
            event.target.style.height = "auto";
            event.target.style.height = `${event.target.scrollHeight}px`;
          }}
        />
        <div className="gb-composer-bottom">
          <span className="mono gb-quiet">
            {[...content].length} <span>/ 300</span>
          </span>
          <button
            className="button button-light gb-send"
            disabled={!ready || busy || cooldown > 0}
            type="submit"
            onPointerMove={(event) => {
              if (
                event.pointerType === "mouse" &&
                !matchMedia("(prefers-reduced-motion: reduce)").matches
              ) {
                const rect = event.currentTarget.getBoundingClientRect();
                event.currentTarget.style.transform = `translate(${(event.clientX - rect.x - rect.width / 2) * 0.07}px, ${(event.clientY - rect.y - rect.height / 2) * 0.12}px)`;
              }
            }}
            onPointerLeave={(event) =>
              (event.currentTarget.style.transform = "")
            }
          >
            {busy ? (
              <>
                <LoaderCircle className="gb-spin" size={15} /> SENDING
              </>
            ) : cooldown ? (
              `${cooldown}s 后可再次发送`
            ) : sent ? (
              <>
                <Check size={15} /> SENT
              </>
            ) : (
              <>
                SEND MESSAGE <ArrowUpRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </Spotlight>
  );
}
