const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createApi } = require('../scripts/news-api.cjs');
async function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'flexlyf-api-test-'));
  let api;
  const server = http.createServer((req, res) => api(req, res, new URL(req.url, 'http://localhost').pathname));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port; api = createApi(root, port);
  t.after(async () => { await new Promise(resolve => server.close(resolve)); fs.rmSync(root, { recursive: true, force: true }); });
  const base = `http://127.0.0.1:${port}`, session = await (await fetch(base + '/api/session')).json();
  const post = (url, body, headers = {}) => fetch(base + url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-News-Token': session.token, ...headers }, body: JSON.stringify(body) });
  return { root, base, post, session };
}
test('API rejects missing session token and requests from another site', async t => {
  const { post } = await fixture(t);
  assert.equal((await post('/api/articles', {}, { 'X-News-Token': '' })).status, 403);
  assert.equal((await post('/api/articles', {}, { Origin: 'https://unrelated.example' })).status, 403);
});
test('API creates, saves, publishes and exports a draft backup', async t => {
  const { base, post } = await fixture(t);
  const created = await (await post('/api/articles', { title: 'API article' })).json();
  const saved = await (await fetch(base + `/api/articles/${created.record.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-News-Token': (await (await fetch(base + '/api/session')).json()).token }, body: JSON.stringify({ revision: created.record.revision, draft: { ...created.record.draft, summary: 'A clear summary', content: ['Article text'] } }) })).json();
  const published = await (await post(`/api/articles/${created.record.id}/publish`, { revision: saved.record.revision })).json();
  assert.equal(published.record.live.title, 'API article');
  const backup = await (await fetch(base + '/api/export')).json(); assert.equal(backup.items[0].published, false);
});
test('image upload accepts PNG and rejects executable or unsupported content', async t => {
  const { post, root } = await fixture(t);
  assert.equal((await post('/api/images', { data: Buffer.from('<svg onload="alert(1)"></svg>').toString('base64') })).status, 400);
  const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jkKsAAAAASUVORK5CYII=';
  const response = await post('/api/images', { data: png }); assert.equal(response.status, 201);
  const result = await response.json(); assert.ok(fs.existsSync(path.join(root, result.image))); assert.match(result.image, /^news-images\/.+\.png$/);
});
