// Shared popup behavior for archive cards and the homepage carousel.
(function () {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  function safeUrl(value) {
    try { const url = new URL(String(value || ''), location.href); return value && ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
  }
  function formatDate(value) {
    return value ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value + 'T00:00:00Z')) : 'Undated';
  }
  function brief(value, limit) {
    const words = String(value || '').trim().split(/\s+/);
    return words.length > limit ? words.slice(0, limit).join(' ') + '…' : words.join(' ');
  }
  let dialog, opener;
  function init() {
    if (dialog) return;
    dialog = document.getElementById('newsDialog');
    if (!dialog) {
      dialog = document.createElement('dialog'); dialog.id = 'newsDialog'; dialog.className = 'news-dialog';
      dialog.setAttribute('aria-labelledby', 'newsDialogTitle');
      dialog.innerHTML = '<div class="news-dialog-inner"><div class="news-dialog-top"><span class="eyebrow">NEWS IN BRIEF</span><button class="news-button news-dialog-close" id="newsDialogClose" type="button" autofocus>Close <span aria-hidden="true">×</span></button></div><div id="newsDialogContent"></div></div>';
      document.body.appendChild(dialog);
    }
    document.getElementById('newsDialogClose').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => { document.documentElement.classList.remove('news-modal-open'); if (opener?.isConnected) opener.focus(); });
  }
  function open(item, trigger, options = {}) {
    init(); opener = trigger;
    const source = safeUrl(item.sourceUrl);
    const takeaways = (Array.isArray(item.takeaways) ? item.takeaways : item.content).filter(Boolean).filter(text => text !== item.summary).slice(0, 3);
    document.getElementById('newsDialogContent').innerHTML = `<div class="news-dialog-meta">${esc(item.categoryLabel || 'Trade Update')} · ${formatDate(item.date)}</div><h2 id="newsDialogTitle">${esc(item.title)}</h2><p class="news-dialog-summary">${esc(brief(item.summary, 60))}</p>
      ${takeaways.length ? `<ul>${takeaways.map(text => `<li>${esc(brief(text, 30))}</li>`).join('')}</ul>` : ''}
      <div class="news-dialog-footer">${source ? `<a class="news-dialog-source" href="${esc(source)}" target="_blank" rel="noopener noreferrer">${esc(item.source || 'Original source')} <span aria-label="opens in a new tab">↗</span></a>` : `<span>${esc(item.source || 'Flexlyf Trade Desk')}</span>`}${options.preview ? '<span>Private draft preview</span>' : `<a class="news-button" href="${esc(item.url || ("trade-article.html?slug=" + encodeURIComponent(item.slug)))}">Full update</a>`}</div>${options.preview ? `<div class="news-preview-body"><h3>Full update preview</h3>${(item.content || []).map(text => `<p>${esc(text)}</p>`).join('')}</div>` : ''}`;
    dialog.showModal(); document.documentElement.classList.add('news-modal-open'); document.getElementById('newsDialogClose').focus();
  }
  function bind(container, getItems) {
    container.addEventListener('click', event => {
      const card = event.target.closest('[data-slug]');
      if (!card || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0 || window.getSelection().toString()) return;
      const item = getItems().find(item => item.slug === card.dataset.slug);
      if (item) { event.preventDefault(); open(item, card.querySelector('a')); }
    });
  }
  window.NewsView = { esc, safeUrl, formatDate, brief, bind, open };
})();
