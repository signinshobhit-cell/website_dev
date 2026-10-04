// Isolated browser test data; never replaces the website's news.json.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json' };
const seed = JSON.parse(fs.readFileSync(path.join(root, 'data/news.json'), 'utf8')).items[0];
const items = Array.from({ length: 22 }, (_, i) => ({ ...seed, id: `test-${i + 1}`, slug: `test-${i + 1}`, title: `Test trade update ${i + 1}`, date: `2026-09-${String(i + 1).padStart(2, '0')}`, category: i % 2 ? 'customs' : 'dgft', categoryLabel: i % 2 ? 'Customs' : 'DGFT & FTP', content: ['Synthetic test content for pagination and date filtering.'] }));
items.push({ ...seed, title: 'Unpublished test draft', published: false });
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/data/news.json') {
    if (fs.existsSync(path.join(__dirname, '.preview-failure'))) { res.writeHead(503).end(); return; }
    // Homepage fixtures are relative to today's India date to exercise New badges.
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const responseItems = (req.headers.referer || '').includes('index.html') ? items.map((item, i) => ({ ...item, date: new Date(Date.parse(today) - i * 86400000).toISOString().slice(0, 10) })) : items;
    res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ items: responseItems })); return;
  }
  const file = path.resolve(root, '.' + url.pathname);
  if (path.relative(root, file).startsWith('..')) { res.writeHead(403).end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }).end(data);
  });
}).listen(3001, '127.0.0.1', () => console.log('Synthetic news test preview: http://localhost:3001/trade-intelligence.html'));
