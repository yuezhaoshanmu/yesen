import { z } from "zod";
import { adminSupabase } from "@/lib/supabase/admin";
import {
  ApiError,
  body,
  decodeCursor,
  encodeCursor,
  handle,
  networkKey,
  ok,
  sameOrigin,
  visitor,
} from "@/lib/guestbook/server";
import { submissionSchema } from "@/lib/guestbook/validation";
import type { Message } from "@/lib/guestbook/types";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  return handle(async () => {
    const params = new URL(request.url).searchParams;
    const db = adminSupabase();
    await visitor(); // Establish signed identity before concurrent writes or retries.
    if (params.has("ids")) {
      const ids = z
        .array(z.string().uuid())
        .min(1)
        .max(200)
        .parse(params.get("ids")!.split(","));
      const { data, error } = await db
        .from("guestbook_messages")
        .select("*")
        .eq("status", "visible")
        .in("id", ids);
      if (error) throw error;
      return ok({ messages: data });
    }
    const cursor = decodeCursor(params.get("cursor"));
    const { data, error } = await db.rpc("guestbook_page", {
      p_pinned: cursor?.pinned,
      p_created: cursor?.created,
      p_id: cursor?.id,
    });
    if (error) throw error;
    const rows = data as Message[];
    const messages = rows.slice(0, 20);
    return ok({
      messages,
      nextCursor: rows.length > 20 ? encodeCursor(messages[19]) : null,
    });
  });
}
export async function POST(request: Request) {
  return handle(async () => {
    sameOrigin(request);
    const input = submissionSchema.parse(await body(request));
    const { data, error } = await adminSupabase().rpc("guestbook_submit", {
      p_nickname: input.nickname,
      p_content: input.content,
      p_request: input.requestId,
      p_visitor: await visitor(),
      p_network: networkKey(request),
    });
    if (error) throw error;
    if (data.limited)
      throw new ApiError(429, "每分钟最多发送 3 条留言，请稍后再试。", 60);
    if (data.conflict) throw new ApiError(409, "请求标识已使用，请重新提交。");
    return ok(data, "留言发送成功");
  });
}
