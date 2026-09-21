import { z } from "zod";
import { adminSupabase } from "@/lib/supabase/admin";
import {
  ApiError,
  body,
  handle,
  ok,
  requireAdmin,
  sameOrigin,
} from "@/lib/guestbook/server";
import { editSchema } from "@/lib/guestbook/validation";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: Context) {
  return handle(async () => {
    sameOrigin(request);
    await requireAdmin();
    const id = z
      .string()
      .uuid()
      .parse((await context.params).id);
    const input = editSchema.parse(await body(request, 8192));
    const patch =
      input.action === "pin"
        ? { is_pinned: input.is_pinned }
        : input.action === "visibility"
          ? { status: input.status }
          : {
              reply_content: input.content,
              replied_at: input.content ? new Date().toISOString() : null,
            };
    const { data, error } = await adminSupabase()
      .from("guestbook_messages")
      .update(patch)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new ApiError(404, "留言不存在。");
    return ok(data, "已更新");
  });
}
export async function DELETE(request: Request, context: Context) {
  return handle(async () => {
    sameOrigin(request);
    await requireAdmin();
    const id = z
      .string()
      .uuid()
      .parse((await context.params).id);
    const { error } = await adminSupabase()
      .from("guestbook_messages")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return ok(null, "已删除");
  });
}
