const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { NewsStore, categories, today, fail } = require('./news-store.cjs');
const git = require('./publish-git.cjs');
function createApi(root, port) {
  const store = new NewsStore(root), token = crypto.randomBytes(32).toString('hex');
  const send = (res, status, body) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); res.end(JSON.stringify(body)); };
  async function read(req) {
    const chunks = []; let size = 0;
    for await (const chunk of req) { size += chunk.length; if (size > 8 * 1024 * 1024) fail('File is too large. Choose an image smaller than 5 MB.', 413); chunks.push(chunk); }
    try { return JSON.parse(Buffer.concat(chunks).toString() || '{}'); } catch { fail('The request could not be read. Please try again.'); }
  }
  return async function api(req, res, pathname) {
    try {
      const origin = `http://${req.headers.host}`;
      if (![`localhost:${port}`, `127.0.0.1:${port}`].includes(req.headers.host) || (req.headers.origin && req.headers.origin !== origin) || req.headers['sec-fetch-site'] === 'cross-site') fail('Only this local workspace may access the news manager.', 403);
      if (req.method === 'GET') {
        if (pathname === '/api/session') return send(res, 200, { token, categories, today: today(), records: store.list(), git: git.status(root) });
        if (pathname === '/api/export') {
          res.setHeader('Content-Disposition', 'attachment; filename="news-drafts-backup.json"');
          return send(res, 200, { schemaVersion: 1, items: store.state.records.filter(record => !record.trashedAt).map(record => ({ ...record.draft, published: false })) });
        }
        fail('Not found.', 404);
      }
      if (req.headers['x-news-token'] !== token) fail('Your session expired. Reload the manager.', 403);
      if (!['POST', 'PUT'].includes(req.method)) fail('Method not allowed.', 405);
      const body = await read(req);
      if (pathname === '/api/articles' && req.method === 'POST') return send(res, 201, { record: store.create(body) });
      const match = pathname.match(/^\/api\/articles\/([^/]+)(?:\/([a-z]+))?$/);
      if (match) return send(res, 200, { record: store.change(decodeURIComponent(match[1]), body.revision, req.method === 'PUT' ? 'save' : match[2], body.draft || body) });
      if (pathname === '/api/import') return send(res, 200, { count: store.import(body), records: store.list() });
      if (pathname === '/api/sync') return send(res, 200, { message: git.sync(root) });
      if (pathname === '/api/images') {
        const buffer = Buffer.from(String(body.data || ''), 'base64');
        if (!buffer.length || buffer.length > 5 * 1024 * 1024) fail('Choose an image smaller than 5 MB.');
        let ext;
        if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ext = 'png';
        else if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) ext = 'jpg';
        else if (/^GIF8[79]a/.test(buffer.subarray(0, 6).toString())) ext = 'gif';
        else if (buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') ext = 'webp';
        else fail('Upload a PNG, JPG, GIF, or WebP image. SVG files are not supported.');
        const filename = `${crypto.randomUUID()}.${ext}`; fs.mkdirSync(path.join(root, 'news-images'), { recursive: true });
        fs.writeFileSync(path.join(root, 'news-images', filename), buffer);
        return send(res, 201, { image: `news-images/${filename}` });
      }
      fail('Not found.', 404);
    } catch (error) { send(res, error.status || 500, { error: error.message || 'The request failed.' }); }
  };
}
module.exports = { createApi };
