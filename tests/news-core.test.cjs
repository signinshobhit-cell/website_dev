const { test } = require('node:test');
const assert = require('node:assert/strict');
const { normalize, select, dateOnly, isRecent } = require('../news-core.js');
const fixture = Array.from({ length: 22 }, (_, i) => ({
  id: String(i + 1), slug: `update-${i + 1}`, title: `Trade update ${i + 1}`,
  published: true, date: `2026-09-${String(i + 1).padStart(2, '0')}`,
  category: i % 2 ? 'customs' : 'dgft', summary: 'Export procedures', content: ['New licensing requirements']
}));
test('all published records remain reachable over nine-item pages in descending order', () => {
  const items = normalize({ items: [...fixture, { published: false, title: 'Private draft' }] });
  const pages = [1, 2, 3].map(page => select(items, { page }));
  assert.deepEqual(pages.map(page => page.items.length), [9, 9, 4]);
  assert.equal(pages[0].items[0].id, '22');
  assert.equal(pages[2].items.at(-1).id, '1');
  assert.equal(new Set(pages.flatMap(page => page.items.map(item => item.id))).size, 22);
});
test('date bounds are inclusive and combine with keyword and category filters', () => {
  const result = select(normalize(fixture), { from: '2026-09-02', to: '2026-09-06', q: 'EXPORT licensing', category: 'customs' });
  assert.deepEqual(result.items.map(item => item.id), ['6', '4', '2']);
});
test('undated and invalid dates sort last and do not match date ranges', () => {
  const items = normalize([...fixture, { published: true, id: 'undated', content: '' }, { published: true, id: 'invalid', date: '2026-02-30', content: '' }]);
  assert.deepEqual(items.slice(-2).map(item => item.id), ['undated', 'invalid']);
  assert.equal(select(items, { from: '2026-01-01', page: 3 }).total, 22);
  assert.equal(dateOnly('2026-02-30'), '');
});
test('out-of-range pages clamp and empty results remain usable', () => {
  assert.equal(select(normalize(fixture), { page: 500 }).page, 3);
  assert.equal(select(normalize(fixture), { page: -2 }).page, 1);
  const empty = select(normalize(fixture), { q: 'nonexistent', page: 3 });
  assert.equal(empty.total, 0); assert.equal(empty.page, 1);
});
test('legacy field names and full timestamps are supported without exposing drafts', () => {
  const items = normalize({ news: [{ published: true, category_key: 'dgft', source_url: 'https://example.com', content: 'Details', publishedAt: '2026-10-04T10:00:00Z' }, { title: 'Unapproved' }] });
  assert.equal(items.length, 1); assert.equal(items[0].date, '2026-10-04');
  assert.equal(items[0].category, 'dgft'); assert.deepEqual(items[0].content, ['Details']);
});
test('New covers today and six preceding calendar days, excluding future and undated news', () => {
  assert.equal(isRecent('2026-10-04', '2026-10-04'), true);
  assert.equal(isRecent('2026-09-28', '2026-10-04'), true);
  assert.equal(isRecent('2026-09-27', '2026-10-04'), false);
  assert.equal(isRecent('2026-10-05', '2026-10-04'), false);
  assert.equal(isRecent('', '2026-10-04'), false);
});
test('homepage selects only the top six published updates in descending order', () => {
  const latest = normalize([...fixture, { published: false, date: '2026-10-04' }]).slice(0, 6);
  assert.deepEqual(latest.map(item => item.id), ['22', '21', '20', '19', '18', '17']);
});
