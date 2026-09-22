const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.QA_BASE_URL || 'http://localhost:3012';

// Test the real Supabase client subscription against an isolated Phoenix wire fixture.
// No messages are written to the public guestbook or any remote database.
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => {
      window.dataEvents = []; window.packetAnimations = [];
      window.addEventListener('digital-network:event', e => window.dataEvents.push(e.detail));
      const original = Element.prototype.animate;
      Element.prototype.animate = function (...args) {
        if (this.className === 'data-event-packet' || this.className === 'data-edge-packet') window.packetAnimations.push(this.className);
        return original.apply(this, args);
      };
    });
    await page.route('**/api/guestbook**', route => {
      assert.equal(route.request().method(), 'GET');
      const stats = route.request().url().includes('/stats');
      route.fulfill({ json: { success: true, data: stats ? { total: 0, today: 0, likes: 0, week: 0, trend: [] } : { messages: [], nextCursor: null } } });
    });
    let send;
    await page.routeWebSocket(/\/realtime\/v1\/websocket/, ws => {
      ws.onMessage(raw => {
        const [join, ref, topic, event, payload] = JSON.parse(raw.toString());
        const reply = response => ws.send(JSON.stringify([join, ref, topic, 'phx_reply', { status: 'ok', response }]));
        if (event === 'phx_join') {
          reply({ postgres_changes: payload.config.postgres_changes.map((p, i) => ({ ...p, id: i + 1 })) });
          send = (name, data) => ws.send(JSON.stringify([join, null, topic, name, data]));
        } else if (event === 'presence') {
          reply({});
          send('presence_state', { initial: { metas: [{ phx_ref: 'one', online: true }] } });
        } else if (event === 'heartbeat') reply({});
      });
    });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.querySelector('.gb-live')?.textContent.includes('LIVE'));
    await page.locator('.gb-system').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    assert(send, 'Supabase public configuration is required to exercise the subscription');
    const stamp = new Date().toISOString();
    const record = { id: '22222222-2222-4222-8222-222222222222', nickname: '隔离测试访客', content: '此消息仅存在于测试浏览器。', status: 'visible', is_pinned: false, likes_count: 0, created_at: stamp, updated_at: stamp, reply_content: null, replied_at: null };
    const columns = Object.keys(record).map(name => ({ name, type: name === 'likes_count' ? 'int4' : name === 'is_pinned' ? 'bool' : 'text' }));
    const change = (type, row) => send('postgres_changes', { ids: [type === 'INSERT' ? 1 : 2], data: { schema: 'public', table: 'guestbook_messages', type, commit_timestamp: stamp, record: row, old_record: {}, columns, errors: null } });
    change('INSERT', record);
    await page.locator(`[data-message-id="${record.id}"]`).waitFor();
    await page.waitForFunction(() => window.packetAnimations.length > 0);
    assert.equal(await page.evaluate(() => window.dataEvents.filter(e => e.type === 'message').length), 1);
    change('INSERT', record);
    change('UPDATE', { ...record, likes_count: 1, updated_at: new Date(Date.now() + 1000).toISOString() });
    await page.waitForTimeout(200);
    assert.equal(await page.evaluate(() => window.dataEvents.filter(e => e.type === 'message').length), 1, 'Duplicate INSERT or like UPDATE emitted another packet');
    send('presence_diff', { joins: { second: { metas: [{ phx_ref: 'two', online: true }] } }, leaves: {} });
    await page.waitForFunction(() => document.querySelectorAll('.presence-nodes i').length === 2);
    assert.equal(await page.evaluate(() => window.dataEvents.filter(e => e.type === 'presence').length), 1);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const before = await page.evaluate(() => window.packetAnimations.length);
    change('INSERT', { ...record, id: '33333333-3333-4333-8333-333333333333' });
    await page.locator('[data-message-id="33333333-3333-4333-8333-333333333333"]').waitFor();
    await page.waitForTimeout(100);
    assert.equal(await page.evaluate(() => window.packetAnimations.length), before, 'Reduced motion emitted a packet');
    assert.deepEqual(errors, []);
    console.log('PASS: Supabase wire INSERT → React card → data packet; duplicate/UPDATE suppression; Presence join; reduced-motion keeps data updates without animation.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
