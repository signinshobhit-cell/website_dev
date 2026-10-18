const test = require('node:test');
const assert = require('node:assert/strict');
const { calculate, messageFor } = require('../scrip-sale.js');
const rates = require('../scrip-rates.js');
const fs = require('node:fs');
const path = require('node:path');
const now = Date.parse('2026-10-18T12:00:00+05:30');
const quote = (amount, scheme = 'rodtep', config = rates) => calculate({ amount, scheme, port: ' innsa1 ' }, config, now);

test('both schemes apply owner-approved single-scrip slabs with unambiguous boundaries', () => {
  for (const scheme of ['rodtep', 'rosctl']) {
    for (const [amount, percent] of [[0.01,75],[999.99,75],[1000,85],[9999.99,85],[10000,90],[99999.99,90],[100000,95],[499999.99,95],[500000,99],[5000000,99]]) {
      const result = quote(amount, scheme);
      assert.equal(result.available, true, `${scheme} ${amount}`);
      assert.equal(result.percent, percent);
      assert.equal(result.port, 'INNSA1');
    }
  }
  assert.equal(quote(5000000.01).available, false);
});
test('payout uses percentage of face value and rounds only to paise', () => {
  assert.equal(quote('1,50,000').payout, 142500);
  assert.equal(quote('5,00,000').payout, 495000);
  assert.equal(quote('999.99').payout, 749.99);
  assert.equal(quote('999.99').discount, 250);
  assert.equal(quote('150,000').payout, 142500);
});
test('invalid input never produces a price or a sale message', () => {
  for (const amount of ['',0,-1,'1e5','NaN','1,5,000','1.234','₹1000','<script>',1000000001]) assert.ok(quote(amount).error, String(amount));
  assert.ok(calculate({amount:1000, scheme:'other', port:'INNSA1'}, rates, now).error);
  for (const port of ['', 'ABC123', 'INNSA', 'INNSA123', '<img>']) assert.equal(calculate({amount:1000,scheme:'rodtep',port},rates,now).field, 'scrip-port');
});
test('missing, invalid or expired rate configuration fails closed', () => {
  assert.equal(quote(1000,'rodtep',{}).available, false);
  for (const patch of [{validUntil:'2026-10-17T00:00:00Z'},{validUntil:'invalid'},{updatedAt:'invalid'},{updatedAt:'2027-01-01T00:00:00Z'},{schemes:{rodtep:{enabled:false}}},{slabs:[{min:0,max:100000,percent:101}]}]) assert.equal(quote(1000,'rodtep',{...rates,...patch}).available,false);
});
test('WhatsApp enquiry carries exact input and indicative result; larger values request a manual quote', () => {
  const message = messageFor(quote(100000));
  assert.match(message,/RoDTEP/); assert.match(message,/INNSA1/); assert.match(message,/95%/); assert.match(message,/95,000/);
  const manual = messageFor(quote(5000001));
  assert.match(manual,/confirm your current buying rate/);
  assert.doesNotMatch(manual,/Estimated payout/);
});
test('public rate table and worked example agree with the unchanged calculator', () => {
  const html = fs.readFileSync(path.join(__dirname, '../rodtep-exchange.html'), 'utf8');
  const rows = [...html.matchAll(/<tr data-scrip-slab="(\d)"><th scope="row">([^<]+)<\/th><td>(\d+)%<\/td><td>₹(\d+)<\/td><\/tr>/g)];
  assert.equal(rows.length, rates.slabs.length);
  rows.forEach((row, index) => {
    assert.equal(Number(row[1]), index);
    assert.equal(Number(row[3]), rates.slabs[index].percent);
    assert.equal(Number(row[4]), rates.slabs[index].percent);
  });
  const example = quote(150000);
  assert.equal(example.payout, 142500);
  assert.match(html, /class="scrip-example-payout">₹1,42,500/);
  assert.match(html, /<dd>₹7,500<\/dd>/);
});
