import assert from "node:assert/strict";
const base = process.env.GUESTBOOK_TEST_URL || "http://localhost:3000";
const id = "11111111-1111-4111-8111-111111111111";
const post = (body, headers = {}) =>
  fetch(`${base}/api/guestbook`, {
    method: "POST",
    headers: { Origin: base, "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
let checked = 0;
async function expect(response, status) {
  assert.equal(response.status, status, await response.clone().text());
  const body = await response.json();
  assert.equal(body.success, false);
  assert.equal(body.data, null);
  checked++;
}
await expect(await post({ nickname: "", content: "你好", requestId: id }), 400);
await expect(
  await post({
    nickname: "访客",
    content: "<script>alert(1)</script>",
    requestId: id,
  }),
  400,
);
await expect(
  await post({ nickname: "访客", content: "x".repeat(301), requestId: id }),
  400,
);
await expect(
  await post({
    nickname: "访客",
    content: "你好",
    requestId: id,
    is_pinned: true,
  }),
  400,
);
await expect(await post("x".repeat(5000)), 413);
await expect(await post("{"), 400);
await expect(await post("{}", { "Content-Type": "text/plain" }), 415);
await expect(await post({}, { Origin: "https://untrusted.invalid" }), 403);
const session = await fetch(`${base}/api/admin/session`);
assert([401, 503].includes(session.status));
checked++;
for (const [method, path] of [
  ["GET", "/api/admin/guestbook"],
  ["PATCH", `/api/admin/guestbook/${id}`],
  ["DELETE", `/api/admin/guestbook/${id}`],
]) {
  const response = await fetch(base + path, {
    method,
    headers: { Origin: base, "Content-Type": "application/json" },
    ...(method === "PATCH"
      ? { body: JSON.stringify({ action: "pin", is_pinned: true }) }
      : {}),
  });
  assert([401, 503].includes(response.status));
  checked++;
}
const home = await fetch(base);
assert.equal(home.status, 200);
assert((await home.text()).includes("VISITOR WALL"));
checked++;
console.log(
  `Passed ${checked} HTTP checks: payload limits, validation, origin, unauthenticated management, portfolio availability.`,
);
