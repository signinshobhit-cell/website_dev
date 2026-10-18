const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

test('Yuvglobal public branding preserves contact details and deployed quote compatibility', () => {
  assert.equal(fs.readFileSync(path.join(root, 'CNAME'), 'utf8').trim(), 'www.yuvglobal.com');
  for (const name of fs.readdirSync(root).filter(name => name.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(root, name), 'utf8');
    // The legal operator can appear in service identity text as well as the footer.
    assert.doesNotMatch(html.replaceAll('Flexlyf Commerce Private Limited', ''), /Flexlyf Commerce|Flex<tspan[^>]*>LyF/);
    if (html.includes('All rights reserved.')) assert.ok(html.includes('Flexlyf Commerce Private Limited. All rights reserved.'), `Legal footer missing on ${name}`);
    if (html.includes('rel="canonical"')) assert.match(html, /https:\/\/www\.yuvglobal\.com\//);
    if (html.includes('mailto:')) assert.match(html, /mailto:shobhit@flexlyf\.com/);
  }
  assert.match(fs.readFileSync(path.join(root, 'courier-transport.js'), 'utf8'), /flexlyfCourier_/);
  assert.match(fs.readFileSync(path.join(root, 'integrations/courier/Endpoint.gs'), 'utf8'), /flexlyfCourier_/);
  assert.match(fs.readFileSync(path.join(root, 'logo.svg'), 'utf8'), /Yuv/);
});
