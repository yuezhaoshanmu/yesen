import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { submissionSchema, editSchema } from "../lib/guestbook/validation";
import { mergeMessages } from "../lib/guestbook/client";
import type { Message } from "../lib/guestbook/types";

test("server validation trims Unicode and rejects empty, oversized, HTML, controls and privileged fields", () => {
  const valid = {
    nickname: "  叶子  ",
    content: " 很酷 👋 ",
    requestId: randomUUID(),
  };
  assert.equal(submissionSchema.parse(valid).nickname, "叶子");
  for (const content of [
    "",
    "   ",
    "字".repeat(301),
    "<script>alert(1)</script>",
    "<iframe src=x>",
    "javascript:alert(1)",
    "<img src=x onerror=alert(1)>",
    "\u0000",
  ]) {
    assert.equal(
      submissionSchema.safeParse({ ...valid, content }).success,
      false,
      content,
    );
  }
  assert.equal(
    submissionSchema.safeParse({ ...valid, content: "👋".repeat(300) }).success,
    true,
  );
  assert.equal(
    submissionSchema.safeParse({ ...valid, nickname: "叶".repeat(21) }).success,
    false,
  );
  assert.equal(
    submissionSchema.safeParse({ ...valid, status: "visible", is_pinned: true })
      .success,
    false,
  );
  assert.equal(
    submissionSchema.safeParse({
      ...valid,
      content: "Robert'); DROP TABLE messages;--",
    }).success,
    true,
    "SQL-looking text is safe through parameters",
  );
  assert.equal(
    editSchema.safeParse({ action: "reply", content: "<script>" }).success,
    false,
  );
  assert.equal(
    editSchema.safeParse({ action: "pin", is_pinned: true, status: "visible" })
      .success,
    false,
  );
});

test("realtime merge deduplicates, respects pin/date/ID sorting and rejects stale replies", () => {
  const row: Message = {
    id: randomUUID(),
    nickname: "访客",
    content: "你好",
    status: "visible",
    created_at: "2026-09-21T00:00:00Z",
    updated_at: "2026-09-21T00:00:00Z",
    is_pinned: false,
    likes_count: 0,
    reply_content: null,
    replied_at: null,
  };
  const newer = { ...row, likes_count: 1, updated_at: "2026-09-21T00:01:00Z" };
  assert.equal(mergeMessages([newer], [row, row]).length, 1);
  assert.equal(mergeMessages([newer], [row])[0].likes_count, 1);
  const microsecondUpdate = {
    ...row,
    updated_at: "2026-09-21T00:00:00.000123+00:00",
    likes_count: 2,
  };
  assert.equal(
    mergeMessages(
      [microsecondUpdate],
      [{ ...row, updated_at: "2026-09-21T00:00:00Z" }],
    )[0].likes_count,
    2,
  );
  const pinned = {
    ...row,
    id: randomUUID(),
    is_pinned: true,
    created_at: "2026-09-20T00:00:00Z",
  };
  assert.equal(mergeMessages([newer], [pinned])[0].id, pinned.id);
  assert.equal(
    mergeMessages([row], [{ ...newer, status: "hidden" }]).length,
    0,
  );
});

test("real PostgreSQL migration, least privilege, RPCs, ordering, statistics and withdrawal events", async (t) => {
  const db = new PGlite();
  await db.exec(
    "create role anon; create role authenticated; create role service_role bypassrls; grant usage on schema public to anon, authenticated, service_role;",
  );
  await db.exec(
    await readFile(
      new URL(
        "../supabase/migrations/202609210001_guestbook.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  const rpc = async <T = Record<string, unknown>>(
    sql: string,
    args: unknown[] = [],
  ) => (await db.query<T>(sql, args)).rows;
  const request = randomUUID();
  const submit = async (id: string, visitor = "v1", network = "n1") =>
    (
      await rpc<{
        result: {
          message: Message;
          replayed?: boolean;
          limited?: boolean;
          conflict?: boolean;
        };
      }>("select public.guestbook_submit($1,$2,$3,$4,$5) as result", [
        "叶子",
        "普通文字 SQL ' ; --",
        visitor,
        network,
        id,
      ])
    )[0].result;
  try {
    await t.test(
      "migration enables RLS everywhere and no anonymous write/function privileges exist",
      async () => {
        const tables = await rpc<{ relrowsecurity: boolean }>(
          "select relrowsecurity from pg_class where relname like 'guestbook_%' and relkind='r'",
        );
        assert.equal(tables.length, 5);
        assert(tables.every((row) => row.relrowsecurity));
        for (const role of ["anon", "authenticated"]) {
          const perms = await rpc<{ write: boolean; execute: boolean }>(
            "select has_table_privilege($1,'public.guestbook_messages','INSERT,UPDATE,DELETE') as write, has_function_privilege($1,'public.guestbook_like(uuid,text)','EXECUTE') as execute",
            [role],
          );
          assert.equal(perms[0].write, false);
          assert.equal(perms[0].execute, false);
          const exposed = await rpc<{ name: string }>(
            "select proname as name from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'guestbook_%' and has_function_privilege($1,p.oid,'EXECUTE')",
            [role],
          );
          assert.equal(exposed.length, 0);
        }
      },
    );
    await db.exec("set role service_role");
    const first = await submit(request);
    await t.test(
      "submission retries are idempotent and conflicting clients cannot replay another response",
      async () => {
        const retry = await submit(request);
        assert.equal(retry.message.id, first.message.id);
        assert.equal(retry.replayed, true);
        const conflict = await submit(request, "other");
        assert.equal(conflict.conflict, true);
        assert.equal(
          (
            await rpc<{ count: number }>(
              "select count(*)::int as count from public.guestbook_messages",
            )
          )[0].count,
          1,
        );
      },
    );
    await t.test(
      "network and visitor rate buckets enforce 3/60 across requests",
      async () => {
        assert(!(await submit(randomUUID())).limited);
        assert(!(await submit(randomUUID())).limited);
        assert.equal(
          (await submit(randomUUID(), "new-cookie")).limited,
          true,
          "changing cookie does not bypass IP bucket",
        );
        assert.equal(
          (await submit(randomUUID(), "v1", "new-network")).limited,
          true,
          "changing network does not bypass visitor bucket",
        );
      },
    );
    await t.test(
      "unique likes and atomic increment produce the exact count",
      async () => {
        const results = await Promise.all(
          Array.from({ length: 20 }, (_, i) =>
            rpc("select public.guestbook_like($1,$2)", [
              first.message.id,
              `like-${i % 10}`,
            ]),
          ),
        );
        assert.equal(results.length, 20);
        assert.equal(
          (
            await rpc<{ likes_count: number }>(
              "select likes_count from public.guestbook_messages where id=$1",
              [first.message.id],
            )
          )[0].likes_count,
          10,
        );
      },
    );
    await t.test(
      "hide emits a content-free tombstone; public RLS excludes hidden rows",
      async () => {
        await db.query(
          "update public.guestbook_messages set status='hidden',reply_content='仅管理员可见',replied_at=now() where id=$1",
          [first.message.id],
        );
        const events = await rpc<{ message_id: string }>(
          "select * from public.guestbook_events",
        );
        assert.equal(events[0].message_id, first.message.id);
        assert.deepEqual(Object.keys(events[0]).sort(), [
          "created_at",
          "id",
          "message_id",
        ]);
        await db.exec("reset role; set role anon");
        assert.equal(
          (
            await rpc("select * from public.guestbook_messages where id=$1", [
              first.message.id,
            ])
          ).length,
          0,
        );
        await assert.rejects(
          db.query(
            "update public.guestbook_messages set is_pinned=true where id=$1",
            [first.message.id],
          ),
        );
        await assert.rejects(
          db.query("delete from public.guestbook_messages where id=$1", [
            first.message.id,
          ]),
        );
        await assert.rejects(
          db.query("select public.guestbook_like($1,$2)", [
            first.message.id,
            "attack",
          ]),
        );
        await assert.rejects(db.query("select * from public.guestbook_likes"));
        await db.exec("reset role; set role service_role");
        const like = await rpc<{ result: unknown }>(
          "select public.guestbook_like($1,$2) as result",
          [first.message.id, "late-like"],
        );
        assert.equal(like[0].result, null);
      },
    );
    await t.test(
      "reply, restore and pin are persisted; UPDATE advances version",
      async () => {
        const result = await rpc<Message>(
          "update public.guestbook_messages set status='visible',is_pinned=true,reply_content='谢谢你的鼓励',replied_at=now() where id=$1 returning *",
          [first.message.id],
        );
        assert.equal(result[0].reply_content, "谢谢你的鼓励");
        assert(
          new Date(result[0].updated_at).getTime() >
            new Date(first.message.updated_at).getTime(),
        );
      },
    );
    await t.test(
      "keyset pagination is complete for equal timestamps, pin groups, and literal searches",
      async () => {
        await db.query(
          "insert into public.guestbook_messages(nickname,content,created_at,is_pinned) select '访客 ' || n, 'hello literal % _', '2026-09-01T00:00:00Z', n % 4 = 0 from generate_series(1,45) n",
        );
        const seen = new Set<string>();
        let cursor: Message | undefined;
        while (true) {
          const page = await rpc<Message>(
            "select * from public.guestbook_page(false,'',null,$1,$2,$3)",
            [
              cursor?.is_pinned ?? null,
              cursor?.created_at ?? null,
              cursor?.id ?? null,
            ],
          );
          for (const row of page.slice(0, 20)) {
            assert(!seen.has(row.id));
            seen.add(row.id);
          }
          if (page.length <= 20) break;
          cursor = page[19];
        }
        assert.equal(seen.size, 48);
        const search = await rpc<Message>(
          "select * from public.guestbook_page(true,'literal % _')",
        );
        assert.equal(search.length, 21);
        assert.equal(
          (
            await rpc("select * from public.guestbook_page(true,$1)", [
              "' OR 1=1 --",
            ])
          ).length,
          0,
        );
      },
    );
    await t.test(
      "statistics aggregate at database and distinguish public/admin scope",
      async () => {
        await db.query(
          "update public.guestbook_messages set status='hidden' where id=$1",
          [first.message.id],
        );
        const pub = (
          await rpc<{
            value: { total: number; likes: number; trend: unknown[] };
          }>("select public.guestbook_stats(false) as value")
        )[0].value;
        const admin = (
          await rpc<{ value: { total: number; likes: number } }>(
            "select public.guestbook_stats(true) as value",
          )
        )[0].value;
        assert.equal(admin.total - pub.total, 1);
        assert.equal(admin.likes - pub.likes, 10);
        assert.equal(pub.trend.length, 7);
      },
    );
    await t.test(
      "delete cascades private data and produces withdrawal events for visible rows",
      async () => {
        await db.query(
          "update public.guestbook_messages set status='visible' where id=$1",
          [first.message.id],
        );
        const count = (
          await rpc<{ n: number }>(
            "select count(*)::int as n from public.guestbook_events",
          )
        )[0].n;
        await db.query("delete from public.guestbook_messages where id=$1", [
          first.message.id,
        ]);
        assert.equal(
          (
            await rpc<{ n: number }>(
              "select count(*)::int as n from public.guestbook_events",
            )
          )[0].n,
          count + 1,
        );
        assert.equal(
          (
            await rpc(
              "select * from public.guestbook_likes where message_id=$1",
              [first.message.id],
            )
          ).length,
          0,
        );
        await db.exec("select public.guestbook_cleanup()");
      },
    );
  } finally {
    await db.close();
  }
});
