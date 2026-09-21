// Opt-in: uses REAL Supabase and browsers. Never mocks HTTP or WebSocket events.
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import nextEnv from "@next/env";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
nextEnv.loadEnvConfig(process.cwd());
const env = process.env;
const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_ADMIN_USER_IDS",
  "GUESTBOOK_TEST_ADMIN_EMAIL",
  "GUESTBOOK_TEST_ADMIN_PASSWORD",
];
if (
  required.some((key) => !env[key]) ||
  env.GUESTBOOK_E2E_ALLOW_WRITES !== "1"
) {
  console.log(
    "SKIPPED: real two-browser test requires Supabase configuration, test administrator credentials and GUESTBOOK_E2E_ALLOW_WRITES=1. No real Realtime verification has been performed.",
  );
  process.exit(0);
}
const base = env.GUESTBOOK_TEST_URL || "http://localhost:3000";
const db = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const browser = await chromium.launch({ headless: true, channel: "msedge" });
let messageId;
try {
  const ca = await browser.newContext();
  const cb = await browser.newContext();
  const cm = await browser.newContext();
  const a = await ca.newPage();
  const b = await cb.newPage();
  const admin = await cm.newPage();
  await Promise.all([
    a.goto(base + "/#guestbook"),
    b.goto(base + "/#guestbook"),
    admin.goto(base + "/admin/guestbook"),
  ]);
  for (const page of [a, b])
    await page.waitForFunction(
      () => document.querySelector(".gb-live")?.textContent === "LIVE",
      null,
      { timeout: 30000 },
    );
  const nickname = `联调-${randomUUID().slice(0, 8)}`;
  await a.getByLabel("你的名字", { exact: true }).fill(nickname);
  await a
    .getByLabel("想说些什么？", { exact: true })
    .fill("真实双客户端联调测试，完成后自动清理。");
  const posted = a.waitForResponse(
    (response) =>
      response.url() === base + "/api/guestbook" &&
      response.request().method() === "POST",
  );
  await a.getByRole("button", { name: /SEND MESSAGE/ }).click();
  const response = await posted;
  assert.equal(response.status(), 200);
  const payload = await response.json();
  messageId = payload.data.message.id;
  const card = (page) => page.locator(`[data-message-id="${messageId}"]`);
  await card(b).waitFor({ timeout: 10000 });
  await card(a).waitFor({ timeout: 10000 });
  await card(b).getByRole("button", { name: /赞/ }).click();
  await a.waitForFunction(
    (id) =>
      document.querySelector(`[data-message-id="${id}"] .gb-like span`)
        ?.textContent === "1",
    messageId,
    { timeout: 10000 },
  );
  await admin
    .getByLabel("邮箱", { exact: true })
    .fill(env.GUESTBOOK_TEST_ADMIN_EMAIL);
  await admin
    .getByLabel("密码", { exact: true })
    .fill(env.GUESTBOOK_TEST_ADMIN_PASSWORD);
  await admin.getByRole("button", { name: "进入管理工作台" }).click();
  await admin.locator(".gb-admin-body").waitFor();
  const adminRow = () =>
    admin.locator(".gb-admin-row").filter({ hasText: nickname });
  await adminRow().getByRole("button", { name: "回复", exact: true }).click();
  await admin
    .getByLabel("你的回复")
    .fill("已收到，这是跨客户端的真实站长回复。");
  await admin.getByRole("button", { name: "保存回复" }).click();
  for (const page of [a, b])
    await card(page)
      .getByText("已收到，这是跨客户端的真实站长回复。", { exact: true })
      .waitFor({ timeout: 10000 });
  await adminRow().getByRole("button", { name: "隐藏", exact: true }).click();
  for (const page of [a, b])
    await card(page).waitFor({ state: "detached", timeout: 10000 });
  await adminRow().getByRole("button", { name: "恢复", exact: true }).click();
  for (const page of [a, b]) await card(page).waitFor({ timeout: 10000 });
  await adminRow().getByRole("button", { name: "置顶", exact: true }).click();
  await card(a).getByText("PINNED").waitFor({ timeout: 10000 });
  await adminRow().getByRole("button", { name: "删除", exact: true }).click();
  await admin.getByRole("button", { name: "确认删除" }).click();
  for (const page of [a, b])
    await card(page).waitFor({ state: "detached", timeout: 10000 });
  console.log(
    "PASSED REAL SUPABASE: A → B insert, B → A like, authenticated owner reply, hide, restore, pin, delete, without page reload.",
  );
} finally {
  if (messageId) {
    const { error } = await db
      .from("guestbook_messages")
      .delete()
      .eq("id", messageId);
    if (error)
      console.error(
        "Test message cleanup failed; remove it in the admin dashboard.",
      );
  }
  await browser.close();
}
