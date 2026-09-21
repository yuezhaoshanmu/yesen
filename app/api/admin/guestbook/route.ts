import { z } from "zod";
import { adminSupabase } from "@/lib/supabase/admin";
import {
  decodeCursor,
  encodeCursor,
  handle,
  ok,
  requireAdmin,
} from "@/lib/guestbook/server";
import type { Message } from "@/lib/guestbook/types";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  return handle(async () => {
    await requireAdmin();
    const params = new URL(request.url).searchParams;
    const cursor = decodeCursor(params.get("cursor"));
    const search = z
      .string()
      .max(100)
      .parse(params.get("search") || "");
    const status = z
      .enum(["visible", "hidden"])
      .nullable()
      .parse(params.get("status"));
    const db = adminSupabase();
    const [page, stats] = await Promise.all([
      db.rpc("guestbook_page", {
        p_admin: true,
        p_search: search,
        p_status: status,
        p_pinned: cursor?.pinned,
        p_created: cursor?.created,
        p_id: cursor?.id,
      }),
      db.rpc("guestbook_stats", { p_admin: true }),
    ]);
    if (page.error || stats.error) throw page.error || stats.error;
    const rows = page.data as Message[];
    const messages = rows.slice(0, 20);
    return ok({
      messages,
      stats: stats.data,
      nextCursor: rows.length > 20 ? encodeCursor(messages[19]) : null,
    });
  });
}
