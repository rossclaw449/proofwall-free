const test = require('node:test'); const assert = require('node:assert'); const http = require('http');
const os = require('os'); const path = require('path'); const fs = require('fs');
const { createApp, FREE_LIMIT } = require('../src/app');
async function boot(opts = {}) {
  const dataFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'pwf-')), 'db.json');
  const app = createApp({ dataFile, adminPassword: 'pw', ...opts });
  const srv = http.createServer(app.handler); await new Promise(r => srv.listen(0, r));
  return { base: `http://127.0.0.1:${srv.address().port}`, close: () => srv.close() };
}
const auth = { authorization: 'Basic ' + Buffer.from('admin:pw').toString('base64'), 'content-type': 'application/json' };
const post = (base, b) => fetch(base + '/api/testimonials', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) });
const sample = i => ({ name: 'Sample ' + i, text: 'Sample testimonial text number ' + i, rating: 5 });

test('free limit is 15', () => assert.equal(FREE_LIMIT, 15));
test('submit, approve, wall shows approved only with badge', async () => {
  const { base, close } = await boot();
  const r = await post(base, sample(1)); assert.equal(r.status, 201); const { id } = await r.json();
  let w = await (await fetch(base + '/api/wall')).json(); assert.equal(w.items.length, 0); assert.equal(w.branding, true);
  await fetch(base + '/api/admin/testimonials/' + id, { method: 'POST', headers: auth, body: JSON.stringify({ status: 'approved' }) });
  w = await (await fetch(base + '/api/wall')).json(); assert.equal(w.items.length, 1); assert.equal(w.branding, true);
  close();
});
test('admin requires auth', async () => {
  const { base, close } = await boot();
  assert.equal((await fetch(base + '/api/admin/testimonials')).status, 401);
  const j = await (await fetch(base + '/api/admin/testimonials', { headers: auth })).json(); assert.equal(j.edition, 'free');
  close();
});
test('blocks submissions past the limit; rejecting frees a slot', async () => {
  const { base, close } = await boot({ limit: 3 });
  const ids = [];
  for (let i = 0; i < 3; i++) { const r = await post(base, sample(i)); assert.equal(r.status, 201); ids.push((await r.json()).id); }
  assert.equal((await post(base, sample(9))).status, 403);
  await fetch(base + '/api/admin/testimonials/' + ids[0], { method: 'POST', headers: auth, body: JSON.stringify({ status: 'rejected' }) });
  assert.equal((await post(base, sample(10))).status, 201);
  close();
});
test('validation and honeypot', async () => {
  const { base, close } = await boot();
  assert.equal((await post(base, { name: '', text: 'long enough text', rating: 5 })).status, 400);
  assert.equal((await post(base, { name: 'x', text: 'short', rating: 5 })).status, 400);
  assert.equal((await post(base, { ...sample(1), website: 'spam' })).status, 200);
  close();
});
test('no license or private key material ships', () => {
  const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.name === 'node_modules' || e.name === '.git' ? [] : e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
  for (const f of walk(path.join(__dirname, '..'))) {
    assert.ok(!/\.pem$/.test(f), f);
    assert.ok(!fs.readFileSync(f, 'utf8').includes('BEGIN ' + 'PRIVATE KEY'), f);
  }
});
