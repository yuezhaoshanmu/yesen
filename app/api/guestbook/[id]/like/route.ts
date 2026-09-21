import { z } from "zod";
import { adminSupabase } from "@/lib/supabase/admin";
import {
  ApiError,
  handle,
  networkKey,
  ok,
  rateLimit,
  sameOrigin,
  visitor,
} from "@/lib/guestbook/server";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    sameOrigin(request);
    const id = z
      .string()
      .uuid()
      .parse((await context.params).id);
    await rateLimit(`like:${networkKey(request)}`, 30);
    const { data, error } = await adminSupabase().rpc("guestbook_like", {
      p_message: id,
      p_visitor: await visitor(),
    });
    if (error) throw error;
    if (!data) throw new ApiError(404, "这条留言已不可见。");
    return ok(data, data.already_liked ? "你已经赞过这条留言" : "点赞成功");
  });
}
