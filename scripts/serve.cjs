const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const port = Number(process.env.PORT || 3000);
const api = require('./news-api.cjs').createApi(root, port);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end('Bad request'); return; }
  if (pathname.startsWith('/api/')) { api(req, res, pathname); return; }
  const adminFiles = { '/news-manager.html': '/local-admin/manager.html', '/manager.css': '/local-admin/manager.css', '/manager.js': '/local-admin/manager.js' };
  const file = path.resolve(root, '.' + (adminFiles[pathname] || (pathname === '/' ? '/index.html' : pathname)));
  const relative = path.relative(root, file);
  if (pathname.startsWith('/local-admin/') || relative.startsWith('..') || path.isAbsolute(relative) || relative.split(/[\\/]/).some(part => part.startsWith('.')) || /\.(php|cjs)$/i.test(file)) {
    res.writeHead(403).end('Unavailable in the static preview'); return;
  }
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end('Method not allowed'); return; }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
});
server.on('error', error => { console.error(error.message); process.exit(1); });
server.listen(port, '127.0.0.1', () => console.log(`Flexlyf preview: http://localhost:${port}`));
