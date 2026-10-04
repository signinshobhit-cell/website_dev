// Pure archive operations, shared by the browser and the local checks.
(function (root) {
  'use strict';
  const PAGE_SIZE = 9;
  function dateOnly(value) {
    const date = String(value || '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return '';
    const timestamp = Date.parse(date + 'T00:00:00Z');
    return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === date ? date : '';
  }
  function normalize(payload) {
    const items = Array.isArray(payload) ? payload : payload.items || payload.news;
    if (!Array.isArray(items)) throw new Error('News data must contain an items array.');
    return items.filter(item => item && item.published === true).map(item => ({
      ...item,
      category: item.category || item.category_key || '',
      categoryLabel: item.categoryLabel || item.category_label || '',
      sourceUrl: item.sourceUrl || item.source_url || '',
      content: Array.isArray(item.content) ? item.content : [item.content || ''],
      date: dateOnly(item.publishedAt) || dateOnly(item.date),
      sortTime: dateOnly(item.publishedAt) ? Date.parse(item.publishedAt) : dateOnly(item.date) ? Date.parse(dateOnly(item.date) + 'T00:00:00Z') : 0
    })).sort((a, b) => b.sortTime - a.sortTime);
  }
  function select(items, filters) {
    const words = String(filters.q || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    const filtered = items.filter(item => {
      const text = [item.title, item.summary, item.source, item.categoryLabel, ...item.content].join(' ').toLowerCase();
      return words.every(word => text.includes(word)) &&
        (!filters.category || filters.category === 'all' || item.category === filters.category) &&
        (!filters.from || (item.date && item.date >= filters.from)) &&
        (!filters.to || (item.date && item.date <= filters.to));
    });
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const page = Math.min(pages, Math.max(1, Math.floor(Number(filters.page) || 1)));
    const start = (page - 1) * PAGE_SIZE;
    return { items: filtered.slice(start, start + PAGE_SIZE), total: filtered.length, pages, page, start };
  }
  function isRecent(value, today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())) {
    const date = dateOnly(value), current = dateOnly(today);
    if (!date || !current) return false;
    const days = (Date.parse(current) - Date.parse(date)) / 86400000;
    return days >= 0 && days < 7;
  }
  const api = { PAGE_SIZE, dateOnly, normalize, select, isRecent };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.NewsCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
