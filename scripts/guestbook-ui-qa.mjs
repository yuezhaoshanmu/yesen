import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
const base = process.env.GUESTBOOK_TEST_URL || "http://localhost:3000";
await mkdir("qa/guestbook", { recursive: true });
const browser = await chromium.launch({ headless: true, channel: "msedge" });
const issues = [];
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => issues.push(error.message));
  await page.goto(base + "/#guestbook");
  await page.locator("#guestbook .gb-error").waitFor();
  await page
    .locator("#guestbook")
    .screenshot({
      path: "qa/guestbook/desktop-offline.png",
      animations: "disabled",
    });
  assert(await page.getByRole("button", { name: /SEND MESSAGE/ }).isDisabled());
  assert.equal(await page.locator(".gb-live").textContent(), "OFFLINE");
  await page.getByRole("button", { name: "HOW IT WORKS" }).click();
  await page.locator(".gb-architecture").waitFor({ state: "visible" });
  await page.keyboard.press("Shift+Tab");
  assert(
    await page
      .locator(".gb-architecture")
      .evaluate((el) => el.contains(document.activeElement)),
  );
  await page
    .locator(".gb-architecture")
    .screenshot({ path: "qa/guestbook/architecture.png" });
  await page.keyboard.press("Escape");
  assert(
    await page
      .getByRole("button", { name: "HOW IT WORKS" })
      .evaluate((el) => el === document.activeElement),
  );
  const axe = await new AxeBuilder({ page }).include("#guestbook").analyze();
  assert.deepEqual(
    axe.violations.map((v) => ({
      id: v.id,
      description: v.description,
      nodes: v.nodes.map((n) => n.target),
    })),
    [],
  );
  for (const width of [360, 390, 820]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator("#guestbook").scrollIntoViewIfNeeded();
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `overflow at ${width}`,
    );
    await page
      .locator("#guestbook")
      .screenshot({
        path: `qa/guestbook/offline-${width}.png`,
        animations: "disabled",
      });
  }
  await page.goto(base + "/admin/guestbook");
  await page.getByRole("button", { name: "进入管理工作台" }).waitFor();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: "qa/guestbook/admin-login.png" });
  const loginAxe = await new AxeBuilder({ page }).analyze();
  assert.deepEqual(
    loginAxe.violations.map((v) => v.id),
    [],
  );
  await page.setViewportSize({ width: 360, height: 850 });
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  // Isolated visual fixtures below exercise populated layouts and plain-text rendering.
  // They exist only in the test's intercepted responses, never in application code/database.
  const fixtures = [
    {
      id: "11111111-1111-4111-8111-111111111111",
      nickname: "视觉测试访客",
      content: "每一份努力都有迹可循。祝你继续探索，保持热爱。",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: "visible",
      is_pinned: true,
      likes_count: 12,
      reply_content: "谢谢你的鼓励，也祝你在自己的道路上持续前行。",
      replied_at: new Date().toISOString(),
    },
    {
      id: "22222222-2222-4222-8222-222222222222",
      nickname: "另一个浏览器",
      content: "留言卡片的排版测试。\n换行也会保留。",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date().toISOString(),
      status: "visible",
      is_pinned: false,
      likes_count: 3,
      reply_content: null,
      replied_at: null,
    },
    {
      id: "33333333-3333-4333-8333-333333333333",
      nickname: "纯文本测试",
      content: "<img src=x onerror=alert(1)>",
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date().toISOString(),
      status: "visible",
      is_pinned: false,
      likes_count: 0,
      reply_content: null,
      replied_at: null,
    },
  ];
  const statistics = {
    total: 3,
    today: 3,
    likes: 15,
    week: 3,
    trend: Array.from({ length: 7 }, (_, n) => ({
      day: `2026-09-${15 + n}`,
      count: n === 6 ? 3 : 0,
    })),
  };
  await page.route("**/api/guestbook**", async (route) => {
    const url = new URL(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "UI FIXTURE ONLY",
        data: url.pathname.endsWith("/stats")
          ? statistics
          : { messages: fixtures, nextCursor: null },
      }),
    });
  });
  await page.goto(base + "/#guestbook");
  await page.locator("[data-message-id]").first().waitFor();
  assert.equal(
    await page.locator(".gb-message img").count(),
    0,
    "Untrusted text must not become HTML",
  );
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page
    .locator("#guestbook")
    .screenshot({
      path: "qa/guestbook/fixture-populated-desktop.png",
      animations: "disabled",
    });
  const populatedAxe = await new AxeBuilder({ page })
    .include("#guestbook")
    .analyze();
  assert.deepEqual(
    populatedAxe.violations.map((v) => v.id),
    [],
  );
  await page.setViewportSize({ width: 360, height: 850 });
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page
    .locator("#guestbook")
    .screenshot({
      path: "qa/guestbook/fixture-populated-mobile.png",
      animations: "disabled",
    });
  await page.route("**/api/admin/session", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "UI FIXTURE ONLY",
        data: { email: "visual-test@example.invalid" },
      }),
    }),
  );
  await page.route("**/api/admin/guestbook**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "UI FIXTURE ONLY",
        data: { messages: fixtures, nextCursor: null, stats: statistics },
      }),
    }),
  );
  await page.goto(base + "/admin/guestbook");
  await page.locator(".gb-admin-row").first().waitFor();
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.screenshot({
    path: "qa/guestbook/fixture-admin-desktop.png",
    fullPage: true,
  });
  const adminAxe = await new AxeBuilder({ page }).analyze();
  assert.deepEqual(
    adminAxe.violations.map((v) => v.id),
    [],
  );
  await page
    .locator(".gb-admin-row")
    .first()
    .getByRole("button", { name: "回复", exact: true })
    .click();
  await page.keyboard.press("Shift+Tab");
  assert(
    await page
      .locator(".gb-admin-dialog")
      .evaluate((el) => el.contains(document.activeElement)),
  );
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 360, height: 850 });
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.screenshot({
    path: "qa/guestbook/fixture-admin-mobile.png",
    fullPage: true,
  });
  assert.deepEqual(issues, []);
  console.log(
    "Passed offline UI, 360/390/820/1440 responsive layouts, dialog focus, login, populated UI fixtures, plain-text rendering, axe accessibility and browser error checks. No Realtime claims.",
  );
} finally {
  await browser.close();
}
