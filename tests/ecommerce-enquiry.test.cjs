const test = require('node:test');
const assert = require('node:assert/strict');
const { prepareEnquiry, filterChannels } = require('../ecommerce-export.js');
const { channels, countryLabels } = require('../marketplace-channels.js');
const fs = require('node:fs'), path = require('node:path');
const base = { product: 'Home textiles, 40 SKUs', stage: 'Already selling online in India', channel: 'Walmart US', market: 'United States' };
test('marketplace enquiry preserves the selected service and encodes a reviewable WhatsApp draft', () => {
  const result = prepareEnquiry(base);
  const url = new URL(result.url);
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, '/919220819906');
  assert.equal(url.searchParams.get('text'), result.message);
  for (const value of Object.values(base)) assert.ok(result.message.includes(value));
});
test('undecided sellers can request channel selection, while incomplete input produces no draft', () => {
  const undecided = prepareEnquiry({ ...base, channel: '', market: '' });
  assert.match(undecided.message, /Help me choose/);
  assert.match(undecided.message, /To discuss/);
  for (const input of [{...base,product:' '},{...base,product:'a'.repeat(301)},{...base,channel:'unlisted'},{...base,stage:'unlisted'},{...base,market:'a'.repeat(101)}]) {
    assert.ok(prepareEnquiry(input).error);
    assert.equal(prepareEnquiry(input).url, undefined);
  }
});
test('every core channel is selectable in the public enquiry form', () => {
  const html = fs.readFileSync(path.join(__dirname, '../ecommerce-export.html'), 'utf8');
  const select = html.match(/<select id="ec-channel"[^>]*>([\s\S]*?)<\/select>/)[1];
  const options = [...select.matchAll(/<option[^>]*>([^<]*)<\/option>/g)].map(match => match[1]);
  for (const channel of channels) assert.ok(options.includes(channel.name), channel.name);
  assert.equal(new Set(channels.map(channel=>channel.name)).size,channels.length);
  assert.equal((html.match(/data-pick-channel=/g)||[]).length,channels.length);
});
test('several selected channels reach one enquiry without duplicates or unknown names', () => {
  const draft = prepareEnquiry({...base, channel:'noon', channels:['Amazon Global Selling','noon','Etsy']});
  assert.match(draft.message,/Channels: Amazon Global Selling, noon, Etsy/);
  assert.ok(prepareEnquiry({...base,channels:['unknown channel']}).error);
  assert.ok(prepareEnquiry({...base,channels:'not an array'}).error);
});
test('region, category, route and search combine without promising eligibility', () => {
  const gulf = filterChannels(channels,{region:'middle-east',category:'home',route:'india'}).map(channel=>channel.name);
  assert.deepEqual(gulf,['Amazon Global Selling','noon']);
  const africa = filterChannels(channels,{region:'africa',category:'home'}).map(channel=>channel.name);
  assert.ok(africa.includes('Jumia'));
  assert.ok(africa.includes('Shopify')); // worldwide storefronts remain discoverable.
  assert.ok(!africa.includes('Walmart US'));
  assert.deepEqual(filterChannels(channels,{region:'africa',route:'india'}),[]);
  assert.deepEqual(filterChannels(channels,{search:'NOON'}).map(channel=>channel.name),['noon']);
});
test('country discovery narrows the catalogue and combines with product filters', () => {
  const germany = filterChannels(channels,{country:'DE',category:'fashion'}).map(item=>item.name);
  assert.ok(germany.includes('Zalando'));
  assert.ok(germany.includes('OTTO Market'));
  assert.ok(!germany.includes('Coupang'));
  const korea = filterChannels(channels,{country:'KR',category:'electronics'}).map(item=>item.name);
  assert.ok(korea.includes('Coupang'));
  assert.ok(korea.includes('WooCommerce'));
  assert.ok(!korea.includes('JD Worldwide'));
  for(const channel of channels) for(const code of channel.countryCodes) assert.ok(code==='*'||countryLabels[code],channel.name+': '+code);
});
