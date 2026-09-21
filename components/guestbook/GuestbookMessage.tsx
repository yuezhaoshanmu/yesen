"use client";
import { Heart, Pin, BadgeCheck } from "lucide-react";
import Spotlight from "@/components/Spotlight";
import type { Message } from "@/lib/guestbook/types";
import { fullTime, relativeTime } from "@/lib/guestbook/client";

export default function GuestbookMessage({
  message,
  now,
  liked,
  busy,
  like,
}: {
  message: Message;
  now: number;
  liked: boolean;
  busy: boolean;
  like: () => void;
}) {
  const hash = [...message.nickname].reduce(
    (h, c) => (h * 31 + c.codePointAt(0)!) >>> 0,
    0,
  );
  const hue = 145 + (hash % 65);
  return (
    <Spotlight
      className={`gb-message panel ${message.is_pinned ? "gb-pinned" : ""}`}
    >
      <article data-message-id={message.id}>
        <header>
          <div
            className="gb-avatar"
            style={{
              background: `linear-gradient(135deg,hsl(${hue} 30% 28%),hsl(${hue + 30} 28% 13%))`,
            }}
            aria-hidden="true"
          >
            {[...message.nickname][0]?.toUpperCase()}
          </div>
          <div className="gb-person">
            <h3>{message.nickname}</h3>
            <time
              dateTime={message.created_at}
              title={fullTime(message.created_at)}
            >
              {relativeTime(message.created_at, now)}
            </time>
          </div>
          {message.is_pinned && (
            <span className="gb-pin micro">
              <Pin size={11} /> PINNED
            </span>
          )}
        </header>
        <p className="gb-message-content">{message.content}</p>
        {message.reply_content && (
          <div className="gb-owner">
            <div>
              <span className="micro">YESEN</span>
              <BadgeCheck size={13} />
              <span className="gb-quiet">站长回复 · AUTHOR</span>
            </div>
            <p>{message.reply_content}</p>
            {message.replied_at && (
              <time
                dateTime={message.replied_at}
                title={fullTime(message.replied_at)}
              >
                {relativeTime(message.replied_at, now)}
              </time>
            )}
          </div>
        )}
        <footer>
          <span className="gb-quiet micro">A TRACE LEFT HERE</span>
          <button
            className={`gb-like ${liked ? "is-liked" : ""}`}
            aria-label={`赞 ${message.nickname} 的留言，${message.likes_count} 次点赞`}
            aria-pressed={liked}
            disabled={liked || busy}
            onClick={like}
          >
            <Heart size={14} fill={liked ? "currentColor" : "none"} />
            <span key={message.likes_count}>{message.likes_count}</span>
          </button>
        </footer>
      </article>
    </Spotlight>
  );
}
