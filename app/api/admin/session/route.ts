import { authSupabase } from "@/lib/supabase/server";
import {
  ApiError,
  body,
  handle,
  networkKey,
  ok,
  rateLimit,
  requireAdmin,
  sameOrigin,
} from "@/lib/guestbook/server";
import { loginSchema } from "@/lib/guestbook/validation";
export const dynamic = "force-dynamic";
export async function GET() {
  return handle(async () => {
    const user = await requireAdmin();
    return ok({ email: user.email });
  });
}
export async function POST(request: Request) {
  return handle(async () => {
    sameOrigin(request);
    const input = loginSchema.parse(await body(request));
    await rateLimit(`login:${networkKey(request)}`, 5, 300);
    const auth = await authSupabase();
    const { error } = await auth.auth.signInWithPassword(input);
    if (error) throw new ApiError(401, "邮箱或密码不正确。");
    try {
      const user = await requireAdmin();
      return ok({ email: user.email });
    } catch (error) {
      await auth.auth.signOut();
      throw error;
    }
  });
}
export async function DELETE(request: Request) {
  return handle(async () => {
    sameOrigin(request);
    const auth = await authSupabase();
    await auth.auth.signOut();
    return ok(null, "已退出");
  });
}
