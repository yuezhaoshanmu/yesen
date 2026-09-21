"use client";
import { useRef } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  X,
  ShieldCheck,
  Database,
  Radio,
  Globe,
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
          <div className="gb-flow">
            <div>
              <Globe size={20} />
              <strong>Browser</strong>
              <small>写下留言 · 无需登录</small>
            </div>
            <ArrowDown size={17} />
            <div>
              <ShieldCheck size={20} />
              <strong>Next.js · Server API</strong>
              <small>输入验证 / 限流 / 权限校验</small>
            </div>
            <ArrowDown size={17} />
            <div>
              <Database size={20} />
              <strong>Supabase PostgreSQL</strong>
              <small>持久化存储 / RLS 最小权限</small>
            </div>
            <ArrowDown size={17} />
            <div>
              <Radio size={20} />
              <strong>Realtime → All Clients</strong>
              <small>留言、点赞与回复，即时同步</small>
            </div>
          </div>
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
