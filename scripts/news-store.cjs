const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const categories = { dgft: 'DGFT & FTP', customs: 'Customs & ICEGATE', incentives: 'Export Incentives', gst: 'GST & Refunds', certification: 'Certifications', international: 'International Trade', commodity: 'Commodity Markets' };
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const slugify = value => String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90) || 'trade-update';
function fail(message, status = 400) { const error = new Error(message); error.status = status; throw error; }
function atomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const serialized = JSON.stringify(value, null, 2) + '\n';
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === serialized) return;
  const temp = file + '.tmp';
  fs.writeFileSync(temp, serialized);
  fs.renameSync(temp, file);
}
function clean(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Each news item must be an object.');
  const text = (key, max) => String(input[key] ?? '').trim().slice(0, max);
  const lines = value => (Array.isArray(value) ? value : String(value || '').split(/\n\s*\n/)).map(value => String(value).trim()).filter(Boolean);
  const category = categories[input.category] ? input.category : categories[input.category_key] ? input.category_key : 'dgft';
  const date = text('date', 10);
  if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date)) fail('Enter a valid publication date.');
  const sourceUrl = String(input.sourceUrl || input.source_url || '').trim().slice(0, 2000);
  if (sourceUrl) { try { if (!['http:', 'https:'].includes(new URL(sourceUrl).protocol)) throw new Error(); } catch { fail('Source link must begin with https:// or http://.'); } }
  const image = text('image', 2000);
  if (image && !/^news-images\/[a-zA-Z0-9_.-]+\.(png|jpe?g|webp|gif)$/i.test(image) && !/^https:\/\//i.test(image)) fail('Choose an uploaded image or an HTTPS image link.');
  return { title: text('title', 160), category, categoryLabel: categories[category], date, summary: text('summary', 600), source: text('source', 300), sourceUrl, image, content: lines(input.content).slice(0, 100).map(value => value.slice(0, 10000)), takeaways: (Array.isArray(input.takeaways) ? input.takeaways : String(input.takeaways || '').split('\n')).map(value => String(value).trim()).filter(Boolean).slice(0, 3).map(value => value.slice(0, 300)) };
}
class NewsStore {
  constructor(root) {
    this.root = root; this.file = path.join(root, '.local', 'news-workspace.json');
    if (fs.existsSync(this.file)) {
      this.state = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      if (this.state.schemaVersion !== 1 || !Array.isArray(this.state.records)) fail('The saved workspace is invalid. Restore a backup before continuing.', 500);
    } else {
      const source = path.join(root, 'data', 'news.json');
      const payload = fs.existsSync(source) ? JSON.parse(fs.readFileSync(source, 'utf8')) : { items: [] };
      const items = Array.isArray(payload) ? payload : payload.items || payload.news || [];
      this.state = { schemaVersion: 1, records: items.map(item => {
        const draft = clean(item);
        return { id: String(item.id || crypto.randomUUID()), slug: item.slug || slugify(item.title), draft, live: item.published === true ? structuredClone(draft) : null, firstPublishedAt: item.published === true ? new Date().toISOString() : null, liveUpdatedAt: item.updatedAt || new Date().toISOString(), revision: 1, updatedAt: new Date().toISOString(), trashedAt: null, history: [] };
      }) };
      atomic(this.file, this.state);
    }
    this.exportPublic(); // Recover public output from the authoritative workspace after interruption.
  }
  list() { return this.state.records.map(record => ({ ...record, history: record.history.map(({ draft, ...entry }) => entry), hasChanges: Boolean(record.live && JSON.stringify(record.live) !== JSON.stringify(record.draft)) })); }
  uniqueSlug(title) { const base = slugify(title); let slug = base, n = 2; while (this.state.records.some(record => record.slug === slug)) slug = `${base}-${n++}`; return slug; }
  exportPublic() {
    const items = this.state.records.filter(record => record.live && !record.trashedAt && !record.archivedAt).map(record => ({ ...record.live, id: record.id, slug: record.slug, type: 'news', published: true, updatedAt: record.liveUpdatedAt || record.updatedAt })).sort((a, b) => b.date.localeCompare(a.date));
    atomic(path.join(this.root, 'data', 'news.json'), { schemaVersion: 1, lastUpdated: today(), items });
    atomic(path.join(this.root, 'news.json'), { news: items.map(item => ({ ...item, category_key: item.category, category_label: item.categoryLabel, source_url: item.sourceUrl })) });
  }
  commit(next) {
    const backups = path.join(this.root, '.local', 'backups'); fs.mkdirSync(backups, { recursive: true });
    if (fs.existsSync(this.file)) fs.copyFileSync(this.file, path.join(backups, `${Date.now()}-${crypto.randomUUID()}.json`));
    atomic(this.file, next); this.state = next; this.exportPublic();
    const files = fs.readdirSync(backups).filter(name => name.endsWith('.json')).sort();
    for (const name of files.slice(0, -50)) fs.unlinkSync(path.join(backups, name));
  }
  create(input = {}) {
    const draft = clean({ date: today(), ...input });
    const record = { id: crypto.randomUUID(), slug: this.uniqueSlug(draft.title || 'draft'), draft, live: null, revision: 1, updatedAt: new Date().toISOString(), trashedAt: null, history: [] };
    const next = structuredClone(this.state); next.records.unshift(record); this.commit(next); return this.list().find(item => item.id === record.id);
  }
  change(id, revision, action, input) {
    const next = structuredClone(this.state), record = next.records.find(item => item.id === id);
    if (!record) fail('This article no longer exists.', 404);
    if (record.revision !== revision) fail('This article changed in another window. Reload the workspace before editing again; your current text is still in the editor.', 409);
    if (action === 'delete') {
      next.records = next.records.filter(item => item.id !== id);
      this.commit(next);
      return { id, deleted: true };
    }
    if (record.trashedAt && !['restore'].includes(action)) fail('Restore this article from Trash first.');
    if (record.archivedAt && !['unarchive', 'trash'].includes(action)) fail('Restore this archived article before editing it.');
    record.history.unshift({ revision: record.revision, savedAt: record.updatedAt, draft: record.draft }); record.history = record.history.slice(0, 20);
    if (action === 'save') record.draft = clean(input);
    else if (action === 'publish') {
      const draft = record.draft;
      if (!draft.title || !draft.summary || !draft.content.length || !draft.date) fail('Add a headline, summary, date, and article content before publishing.');
      if (draft.date > today()) fail('Future publication dates are not supported. Save this as a draft until that date.');
      if (!record.firstPublishedAt && record.slug.startsWith('draft')) record.slug = this.uniqueSlug(draft.title);
      record.firstPublishedAt ||= new Date().toISOString();
      record.live = structuredClone(draft);
      record.liveUpdatedAt = new Date().toISOString();
    } else if (action === 'unpublish') record.live = null;
    else if (action === 'archive') { if (!record.live) fail('Only published articles can be archived.'); record.archivedAt = new Date().toISOString(); }
    else if (action === 'unarchive') { if (!record.archivedAt || !record.live) fail('This article is not archived.'); record.archivedAt = null; }
    else if (action === 'trash') { record.trashedAt = new Date().toISOString(); record.archivedAt = null; record.live = null; }
    else if (action === 'restore') record.trashedAt = null;
    else if (action === 'discard') { if (!record.live) fail('There is no published version to restore.'); record.draft = structuredClone(record.live); }
    else if (action === 'revert') {
      const previous = record.history.find(item => item.revision === input.revision);
      if (!previous) fail('That saved revision is no longer available.'); record.draft = structuredClone(previous.draft);
    } else fail('Unknown article action.');
    record.revision++; record.updatedAt = new Date().toISOString(); this.commit(next);
    return this.list().find(item => item.id === id);
  }
  import(payload) {
    const items = Array.isArray(payload) ? payload : payload.items || payload.news;
    if (!Array.isArray(items) || !items.length || items.length > 100) fail('Import a JSON file with 1–100 news items.');
    const drafts = items.map(clean); // Validate all entries before writing any of them.
    const original = structuredClone(this.state);
    const next = structuredClone(this.state);
    for (const draft of drafts) {
      let slug = slugify(draft.title), n = 2; const base = slug;
      while (next.records.some(record => record.slug === slug)) slug = `${base}-${n++}`;
      next.records.unshift({ id: crypto.randomUUID(), slug, draft, live: null, revision: 1, updatedAt: new Date().toISOString(), trashedAt: null, history: [] });
    }
    this.commit(next); return next.records.length - original.records.length;
  }
}
module.exports = { NewsStore, categories, today, clean, fail };
