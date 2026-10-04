const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { NewsStore, today } = require('../scripts/news-store.cjs');
const { build } = require('../scripts/build-site.cjs');
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'flexlyf-store-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return { root, store: new NewsStore(root) };
}
const article = { title: 'Export documentation update', date: today(), category: 'dgft', summary: 'A short summary for exporters.', content: ['Prepare documents before submitting the shipment.'], takeaways: ['Check the official source.'] };
const publicItems = root => JSON.parse(fs.readFileSync(path.join(root, 'data/news.json'), 'utf8')).items;
test('drafts survive restart, remain private, and publication reaches the public file', t => {
  const { root, store } = fixture(t);
  let record = store.create(article);
  assert.equal(publicItems(root).length, 0);
  assert.equal(new NewsStore(root).list()[0].draft.title, article.title);
  record = store.change(record.id, record.revision, 'publish');
  assert.equal(publicItems(root)[0].title, article.title);
  assert.equal(record.live.title, article.title);
});
test('editing a published article changes only its draft until republished, keeping its URL', t => {
  const { root, store } = fixture(t);
  let record = store.create(article); record = store.change(record.id, record.revision, 'publish');
  const slug = record.slug, before = fs.readFileSync(path.join(root, 'data/news.json'), 'utf8');
  record = store.change(record.id, record.revision, 'save', { ...article, title: 'Revised headline' });
  assert.equal(record.hasChanges, true); assert.equal(fs.readFileSync(path.join(root, 'data/news.json'), 'utf8'), before);
  record = store.change(record.id, record.revision, 'publish');
  assert.equal(publicItems(root)[0].title, 'Revised headline'); assert.equal(record.slug, slug);
});
test('concurrent editors cannot overwrite a newer revision', t => {
  const { store } = fixture(t); const record = store.create(article);
  store.change(record.id, record.revision, 'save', { ...article, title: 'Saved first' });
  assert.throws(() => store.change(record.id, record.revision, 'save', { ...article, title: 'Stale edit' }), error => error.status === 409);
  assert.equal(store.list()[0].draft.title, 'Saved first');
});

test('archive hides public news while preserving snapshots, draft changes, history and URL', t => {
  const { root, store } = fixture(t);
  let record = store.create(article); record = store.change(record.id, record.revision, 'publish');
  const slug = record.slug;
  record = store.change(record.id, record.revision, 'save', { ...article, title: 'Private revision' });
  record = store.change(record.id, record.revision, 'archive');
  assert.ok(record.archivedAt); assert.equal(publicItems(root).length, 0);
  assert.equal(record.live.title, article.title); assert.equal(record.draft.title, 'Private revision');
  const restarted = new NewsStore(root);
  assert.ok(restarted.list()[0].archivedAt);
  assert.throws(() => restarted.change(record.id, record.revision, 'publish'), /Restore this archived/);
  record = restarted.change(record.id, record.revision, 'unarchive');
  assert.equal(record.archivedAt, null); assert.equal(record.slug, slug);
  assert.equal(publicItems(root)[0].title, article.title); assert.equal(record.draft.title, 'Private revision');
  assert.ok(record.history.length > 0);
});

test('permanent delete removes published, archived and trashed records and rejects stale revisions', t => {
  const { root, store } = fixture(t);
  for (const state of ['published', 'archived', 'trashed']) {
    let record = store.create(article); record = store.change(record.id, record.revision, 'publish');
    if (state === 'archived') record = store.change(record.id, record.revision, 'archive');
    if (state === 'trashed') record = store.change(record.id, record.revision, 'trash');
    assert.throws(() => store.change(record.id, record.revision - 1, 'delete'), error => error.status === 409);
    assert.deepEqual(store.change(record.id, record.revision, 'delete'), { id: record.id, deleted: true });
    assert.equal(store.list().some(item => item.id === record.id), false);
    assert.equal(new NewsStore(root).list().some(item => item.id === record.id), false);
    assert.throws(() => store.change(record.id, record.revision, 'delete'), error => error.status === 404);
  }
  assert.equal(publicItems(root).length, 0);
  const draft = store.create(article);
  assert.throws(() => store.change(draft.id, draft.revision, 'archive'), /Only published/);
});
test('unpublish, trash and restore retain editable content without silently publishing', t => {
  const { root, store } = fixture(t); let record = store.create(article);
  record = store.change(record.id, record.revision, 'publish');
  record = store.change(record.id, record.revision, 'unpublish'); assert.equal(publicItems(root).length, 0);
  record = store.change(record.id, record.revision, 'trash'); assert.ok(record.trashedAt);
  record = store.change(record.id, record.revision, 'restore'); assert.equal(record.trashedAt, null); assert.equal(record.live, null); assert.equal(record.draft.title, article.title);
});
test('published edits can be discarded or recovered from saved history', t => {
  const { store } = fixture(t); let record = store.create(article); record = store.change(record.id, record.revision, 'publish');
  record = store.change(record.id, record.revision, 'save', { ...article, title: 'Revision two' });
  const savedRevision = record.revision;
  record = store.change(record.id, record.revision, 'discard'); assert.equal(record.draft.title, article.title);
  record = store.change(record.id, record.revision, 'revert', { revision: savedRevision });
  assert.equal(record.draft.title, 'Revision two'); assert.equal(record.live.title, article.title);
});
test('incomplete articles and future dates cannot be published; invalid imports do not partially write', t => {
  const { root, store } = fixture(t); const record = store.create();
  assert.throws(() => store.change(record.id, record.revision, 'publish'), /headline/);
  const future = store.create({ ...article, date: '2099-01-01' }); assert.throws(() => store.change(future.id, future.revision, 'publish'), /Future/);
  const count = store.list().length;
  assert.throws(() => store.import({ items: [article, { ...article, sourceUrl: 'javascript:alert(1)' }] }), /Source link/);
  assert.equal(store.list().length, count); assert.equal(publicItems(root).length, 0);
});
test('import creates distinct private drafts and preserves published entries', t => {
  const { root, store } = fixture(t); let record = store.create(article); store.change(record.id, record.revision, 'publish');
  store.import({ items: [{ ...article, published: true }, { ...article, published: true }] });
  assert.equal(store.list().length, 3); assert.equal(new Set(store.list().map(item => item.slug)).size, 3); assert.equal(publicItems(root).length, 1);
});
test('invalid saved workspace fails visibly rather than erasing the publication', t => {
  const { root, store } = fixture(t); let record = store.create(article); store.change(record.id, record.revision, 'publish');
  fs.writeFileSync(store.file, '{invalid'); assert.throws(() => new NewsStore(root)); assert.equal(publicItems(root).length, 1);
});
test('public build excludes the editor, drafts, backups and unused image uploads', t => {
  const { root, store } = fixture(t);
  fs.mkdirSync(path.join(root, 'news-images'), { recursive: true });
  fs.writeFileSync(path.join(root, 'index.html'), '<h1>Public</h1>');
  fs.writeFileSync(path.join(root, 'news-manager.html'), 'Private editor');
  fs.mkdirSync(path.join(root, 'junk_')); fs.writeFileSync(path.join(root, 'junk_', 'obsolete.html'), 'Unused old editor');
  fs.writeFileSync(path.join(root, 'manager.js'), 'Private script');
  fs.writeFileSync(path.join(root, 'news-images', 'published.png'), 'image');
  fs.writeFileSync(path.join(root, 'news-images', 'draft.png'), 'private image');
  let record = store.create({ ...article, image: 'news-images/published.png' }); store.change(record.id, record.revision, 'publish');
  store.create({ ...article, title: 'Private headline', image: 'news-images/draft.png' });
  const output = build(root);
  assert.ok(fs.existsSync(path.join(output, 'index.html'))); assert.ok(fs.existsSync(path.join(output, 'news-images/published.png')));
  for (const file of ['news-manager.html', 'manager.js', '.local', 'local-admin', 'junk_', 'news-images/draft.png']) assert.equal(fs.existsSync(path.join(output, file)), false);
  assert.equal(fs.readFileSync(path.join(output, 'data/news.json'), 'utf8').includes('Private headline'), false);
});
