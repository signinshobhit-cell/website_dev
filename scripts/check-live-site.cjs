const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
async function request(url) {
  let last;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, {signal: AbortSignal.timeout(30000)});
      if (!response.ok) throw Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (error) { last = error; }
  }
  throw Error(`${new URL(url).hostname}${new URL(url).pathname}: ${last.message}`);
}
async function check() {
  const sitemap = await request('https://www.yuvglobal.com/sitemap.xml');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  assert.ok(urls.length > 20, 'Sitemap unexpectedly empty');
  assert.ok(urls.every(url => url.startsWith('https://www.yuvglobal.com/')), 'Unexpected sitemap origin');
  for (let i = 0; i < urls.length; i += 5) {
    await Promise.all(urls.slice(i, i + 5).map(async url => {
      const html = await request(url);
      assert.ok(html.includes('Yuvglobal'), `Brand missing on ${url}`);
      assert.match(html, /rel=["']canonical["']/, `Canonical missing on ${url}`);
    }));
  }
  const robots = await request('https://www.yuvglobal.com/robots.txt');
  assert.ok(robots.includes('https://www.yuvglobal.com/sitemap.xml'));
  const endpoint = fs.readFileSync(path.join(root, 'courier-config.js'), 'utf8').match(/https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec/)[0];
  const options = JSON.parse(await request(endpoint + '?action=options'));
  assert.ok(options.countries?.export?.length > 0, 'Courier country service unavailable');
  const readyDate = new Date().toLocaleDateString('en-CA', {timeZone: 'Asia/Kolkata'});
  const shipment = {direction:'export', country:'UAE', readyDate, handling:'general', packages:[{pieces:1,weight:1,length:10,width:10,height:10}]};
  const result = JSON.parse(await request(endpoint + '?action=quote&shipment=' + encodeURIComponent(JSON.stringify(shipment))));
  assert.ok(!result.error && result.quotes?.some(q => Number.isFinite(q.amount) && q.amount > 0), 'Courier calculator failed');
  assert.doesNotMatch(JSON.stringify(result), /"(?:markup|purchaseCost|supplierCost|prices)"/, 'Private rate fields exposed');
  console.log(`PASS: ${urls.length} public pages, sitemap, robots and read-only courier calculation. No enquiry submitted.`);
}
if (require.main === module) check().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = {check};
