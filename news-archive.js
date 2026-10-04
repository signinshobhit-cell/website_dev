/* Public news archive. Publishing is handled separately. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const { esc, safeUrl, formatDate, brief } = NewsView;
  document.addEventListener('DOMContentLoaded', () => {
    const grid = $('tradeNewsGrid'), pager = $('newsPagination');
    const search = $('tradeSearch'), category = $('tradeCategory'), from = $('tradeDateFrom'), to = $('tradeDateTo');
    let items = [], page = 1;
    function readUrl() {
      const params = new URLSearchParams(location.search);
      search.value = params.get('q') || '';
      category.value = Array.from(category.options).some(option => option.value === params.get('category')) ? params.get('category') : 'all';
      from.value = NewsCore.dateOnly(params.get('from')); to.value = NewsCore.dateOnly(params.get('to'));
      page = Math.max(1, Math.floor(Number(params.get('page')) || 1));
    }
    function syncUrl() {
      const url = new URL(location.href);
      const values = { q: search.value.trim(), category: category.value === 'all' ? '' : category.value, from: from.value, to: to.value, page: page === 1 ? '' : String(page) };
      Object.entries(values).forEach(([key, value]) => value ? url.searchParams.set(key, value) : url.searchParams.delete(key));
      history.replaceState(null, '', url);
    }
    function clear() { search.value = ''; category.value = 'all'; from.value = ''; to.value = ''; page = 1; render(); search.focus(); }
    function render() {
      const invalid = Boolean(from.value && to.value && from.value > to.value);
      $('newsFilterError').hidden = !invalid;
      $('newsFilterError').textContent = invalid ? 'The end date must be on or after the start date.' : '';
      [from, to].forEach(input => input.setAttribute('aria-invalid', String(invalid)));
      if (invalid) { pager.hidden = true; grid.innerHTML = ''; $('tradeResultsCount').textContent = 'Choose a valid date range'; syncUrl(); return; }
      const result = NewsCore.select(items, { q: search.value, category: category.value, from: from.value, to: to.value, page });
      page = result.page; syncUrl();
      $('tradeResultsCount').textContent = result.total ? `${result.start + 1}–${result.start + result.items.length} of ${result.total} updates` : '0 updates';
      if (!result.total) {
        grid.innerHTML = '<div class="trade-news-empty"><h3>No updates found</h3><p>Try another keyword, category, or date range.</p><button class="news-button news-empty-action" type="button" id="newsEmptyClear">Clear filters</button></div>';
        $('newsEmptyClear').addEventListener('click', clear);
      } else {
        grid.innerHTML = result.items.map(item => {
          const image = safeUrl(item.image);
          return `<article class="trade-news-card${image ? ' has-image' : ''}" data-slug="${esc(item.slug)}">
            ${image ? `<img class="trade-news-card-image" src="${esc(image)}" alt="" loading="lazy">` : ''}
            <div class="trade-news-card-top"><span class="trade-news-category">${esc(item.categoryLabel || 'Trade Update')}</span><span class="trade-news-date">${formatDate(item.date)}</span></div>
            <div class="trade-news-card-body"><h3>${esc(item.title)}</h3><p>${esc(brief(item.summary, 45))}</p><div class="trade-news-source">${esc(item.source || 'Flexlyf Trade Desk')}</div>
            <a href="trade-article.html?slug=${encodeURIComponent(item.slug)}" class="trade-news-link" aria-haspopup="dialog" aria-label="Read update: ${esc(item.title)}">Read update <span aria-hidden="true">→</span></a></div></article>`;
        }).join('');
      }
      pager.hidden = !result.total;
      const numbers = Array.from(new Set([1, result.pages, page - 1, page, page + 1])).filter(n => n >= 1 && n <= result.pages).sort((a, b) => a - b);
      let previous = 0;
      const buttons = numbers.map(n => {
        const gap = previous && n - previous > 1 ? '<span aria-hidden="true">…</span>' : ''; previous = n;
        return `${gap}<button type="button" class="news-button" data-page="${n}" aria-label="Page ${n}" ${n === page ? 'aria-current="page"' : ''}>${n}</button>`;
      }).join('');
      pager.innerHTML = `<span class="news-page-summary">Page ${page} of ${result.pages} · Newest first</span><div class="news-page-buttons"><button type="button" class="news-button" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''}>Previous</button>${buttons}<button type="button" class="news-button" data-page="${page + 1}" ${page === result.pages ? 'disabled' : ''}>Next</button></div>`;
    }
    NewsView.bind(grid, () => items);
    pager.addEventListener('click', event => {
      const button = event.target.closest('button[data-page]');
      if (!button || button.disabled) return;
      page = Number(button.dataset.page); render(); grid.scrollIntoView({ block: 'start' });
      const first = grid.querySelector('a'); if (first) first.focus({ preventScroll: true });
    });
    [search, category, from, to].forEach(input => input.addEventListener(input === search ? 'input' : 'change', () => { page = 1; render(); }));
    $('tradeClear').addEventListener('click', clear);
    window.addEventListener('popstate', () => { readUrl(); render(); });
    async function load() {
      grid.setAttribute('aria-busy', 'true');
      try {
        const response = await fetch('./data/news.json', { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        items = NewsCore.normalize(await response.json()); readUrl(); render();
      } catch (error) {
        grid.innerHTML = '<div class="trade-news-empty"><h3>News could not be loaded</h3><p>Please try again in a moment.</p><button type="button" class="news-button" id="newsRetry">Try again</button></div>';
        $('tradeResultsCount').textContent = 'Updates unavailable'; pager.hidden = true;
        $('newsRetry').addEventListener('click', load); console.error('News archive:', error);
      } finally { grid.setAttribute('aria-busy', 'false'); }
    }
    load();
  });
})();
