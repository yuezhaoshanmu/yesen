import type { ApiResult, Message } from "./types";
import type { KeyboardEvent } from "react";
export function trapDialogTab(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== "Tab") return;
  const nodes = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>(
      'button:not(:disabled),a[href],input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[tabindex="0"]',
    ),
  );
  const first = nodes[0],
    last = nodes[nodes.length - 1];
  if (!first) {
    event.preventDefault();
    return;
  }
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
export class RequestError extends Error {
  constructor(
    message: string,
    public status: number,
    public retryAfter = 0,
  ) {
    super(message);
  }
}
export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new RequestError("网络异常，请检查连接后重试。", 0);
  }
  let result: ApiResult<T>;
  try {
    result = await response.json();
  } catch {
    throw new RequestError("服务暂时不可用，请稍后重试。", response.status);
  }
  if (!response.ok || !result.success)
    throw new RequestError(
      result.message,
      response.status,
      Number(response.headers.get("Retry-After")) || 0,
    );
  return result.data;
}
// PostgREST and Realtime can serialize the same timestamp with different fractions
// and UTC suffixes. Compare normalized UTC microseconds, not raw wire strings.
function timestampKey(value: string) {
  const fraction = value.match(/\.(\d+)/)?.[1] || "";
  return (
    new Date(value).toISOString().slice(0, 19) +
    "." +
    fraction.padEnd(6, "0").slice(0, 6)
  );
}
export function mergeMessages(previous: Message[], incoming: Message[]) {
  const map = new Map(previous.map((row) => [row.id, row]));
  for (const row of incoming) {
    const current = map.get(row.id);
    if (
      !current ||
      timestampKey(row.updated_at) >= timestampKey(current.updated_at)
    ) {
      if (row.status === "visible") map.set(row.id, row);
      else map.delete(row.id);
    }
  }
  return [...map.values()].sort(
    (a, b) =>
      Number(b.is_pinned) - Number(a.is_pinned) ||
      timestampKey(b.created_at).localeCompare(timestampKey(a.created_at)) ||
      b.id.localeCompare(a.id),
  );
}
export function relativeTime(value: string, now: number) {
  const elapsed = Math.max(0, now - new Date(value).getTime());
  if (elapsed < 60000) return "刚刚";
  if (elapsed < 3600000) return `${Math.floor(elapsed / 60000)} 分钟前`;
  if (elapsed < 86400000) return `${Math.floor(elapsed / 3600000)} 小时前`;
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(value))
    .replaceAll("/", ".");
}
export function fullTime(value: string) {
  return (
    new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value)) + " (UTC+8)"
  );
}
