import { adminSupabase } from "@/lib/supabase/admin";
import { handle, ok } from "@/lib/guestbook/server";
export const dynamic = "force-dynamic";
export async function GET() {
  return handle(async () => {
    const { data, error } = await adminSupabase().rpc("guestbook_stats");
    if (error) throw error;
    return ok(data);
  });
}
