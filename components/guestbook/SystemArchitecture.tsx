"use client";
import SystemDataFlow from "@/components/effects/SystemDataFlow";
import { useRef } from "react";
import {
  ArrowUpRight,
  X,
} from "lucide-react";
import { trapDialogTab } from "@/lib/guestbook/client";

export default function SystemArchitecture() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={trigger}
        className="text-button"
        onClick={() => dialog.current?.showModal()}
      >
        HOW IT WORKS <ArrowUpRight size={14} />
      </button>
      <dialog
        className="gb-architecture"
        ref={dialog}
        aria-labelledby="gb-architecture-title"
        onKeyDown={trapDialogTab}
        onClose={() => trigger.current?.focus()}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="gb-architecture-content">
          <button
            className="icon-button gb-close"
            aria-label="关闭架构说明"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
          <span className="eyebrow">SYSTEM ARCHITECTURE</span>
          <h2 id="gb-architecture-title">
            Behind This Page<span>.</span>
          </h2>
          <p>你写下一句话。另一块屏幕，同时收到。</p>
          <SystemDataFlow architecture />
          <div className="gb-architecture-tags">
            {[
              "PostgreSQL",
              "Realtime",
              "RLS",
              "Server Validation",
              "API",
              "Rate Limiting",
            ].map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <p className="gb-architecture-note">
            在线状态使用
            Presence。公开留言只展示可见内容；管理操作均在服务端验证身份。
          </p>
        </div>
      </dialog>
    </>
  );
}
