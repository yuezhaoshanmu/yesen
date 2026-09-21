import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { adminSupabase } from "@/lib/supabase/admin";
import { authSupabase } from "@/lib/supabase/server";
import { cursorSchema } from "./validation";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public retryAfter?: number,
  ) {
    super(message);
  }
}
export function ok(data: unknown, message = "成功") {
  return NextResponse.json(
    { success: true, message, data },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function handle(run: () => Promise<Response>) {
  try {
    return await run();
  } catch (error) {
    const known = error instanceof ApiError;
    const validation = error instanceof z.ZodError;
    const status = known ? error.status : validation ? 400 : 503;
    return NextResponse.json(
      {
        success: false,
        message: known
          ? error.message
          : validation
            ? error.issues[0]?.message || "输入不正确。"
            : "留言服务暂时无法连接，请稍后重试。",
        data: null,
      },
      {
        status,
        headers: {
          "Cache-Control": "no-store",
          ...(known && error.retryAfter
            ? { "Retry-After": String(error.retryAfter) }
            : {}),
        },
      },
    );
  }
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const url = new URL(request.url);
  // Next may bind to 0.0.0.0 internally; Host is the browser's actual origin host.
  const expected =
    process.env.APP_ORIGIN ||
    `${url.protocol}//${request.headers.get("host") || url.host}`;
  if (
    !origin ||
    origin !== expected ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    throw new ApiError(403, "请求来源不受信任。");
}
export async function body(request: Request, limit = 4096): Promise<unknown> {
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    throw new ApiError(415, "请使用 JSON 请求。");
  if (Number(request.headers.get("content-length")) > limit)
    throw new ApiError(413, "请求内容过长。");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "请求为空。");
  const parts: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > limit) {
      await reader.cancel();
      throw new ApiError(413, "请求内容过长。");
    }
    parts.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(parts).toString("utf8"));
  } catch {
    throw new ApiError(400, "请求格式不正确。");
  }
}
function secret() {
  const value = process.env.GUESTBOOK_HASH_SECRET;
  if (!value || value.length < 32) throw new Error("SERVICE_UNAVAILABLE");
  return value;
}
function hash(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}
export async function visitor() {
  const jar = await cookies();
  const raw = jar.get("gb_visitor")?.value || "";
  const [id, signature] = raw.split(".");
  if (
    z.string().uuid().safeParse(id).success &&
    /^[a-f0-9]{64}$/.test(signature || "") &&
    timingSafeEqual(Buffer.from(hash(id)), Buffer.from(signature))
  )
    return hash(`visitor:${id}`);
  const fresh = randomUUID();
  jar.set("gb_visitor", `${fresh}.${hash(fresh)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 31536000,
  });
  return hash(`visitor:${fresh}`);
}
export function networkKey(request: Request) {
  // Trust only a header that the deployment proxy overwrites. Never trust arbitrary X-Forwarded-For.
  const header = process.env.GUESTBOOK_TRUSTED_IP_HEADER;
  const ip = header ? request.headers.get(header)?.trim() : null;
  if (header && (!ip || !isIP(ip)))
    throw new ApiError(503, "留言服务暂时无法连接。");
  return hash(`network:${ip || "shared-safe-fallback"}`);
}
export async function rateLimit(key: string, limit: number, seconds = 60) {
  const { data, error } = await adminSupabase().rpc("guestbook_take_rate", {
    p_key: key,
    p_limit: limit,
    p_seconds: seconds,
  });
  if (error) throw error;
  if (!data) throw new ApiError(429, "操作太快了，请稍后再试。", seconds);
}
export async function requireAdmin() {
  const supabase = await authSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new ApiError(401, "请先登录。");
  const allowed = (process.env.SUPABASE_ADMIN_USER_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!allowed.includes(user.id))
    throw new ApiError(403, "此账户没有管理权限。");
  return user;
}
export function decodeCursor(value: string | null) {
  if (!value) return null;
  if (value.length > 512) throw new ApiError(400, "分页参数无效。");
  try {
    return cursorSchema.parse(
      JSON.parse(Buffer.from(value, "base64url").toString("utf8")),
    );
  } catch {
    throw new ApiError(400, "分页参数无效。");
  }
}
export function encodeCursor(row: {
  is_pinned: boolean;
  created_at: string;
  id: string;
}) {
  return Buffer.from(
    JSON.stringify({
      pinned: row.is_pinned,
      created: row.created_at,
      id: row.id,
    }),
  ).toString("base64url");
}
