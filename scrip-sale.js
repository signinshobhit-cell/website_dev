(function (root) {
  'use strict';
  const names = { rodtep: 'RoDTEP', rosctl: 'RoSCTL' };
  const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
  function calculate(input, config, now = Date.now()) {
    if (!Object.hasOwn(names, input.scheme)) return { error: 'Choose RoDTEP or RoSCTL.' };
    const raw = String(input.amount).trim();
    const numberPattern = /^(?:\d+|\d{1,3}(?:,\d{3})+|\d{1,2}(?:,\d{2})*,\d{3})(?:\.\d{1,2})?$/;
    const amount = Number(raw.replace(/,/g, ''));
    if (!numberPattern.test(raw) || !Number.isFinite(amount) || amount <= 0 || amount > 1000000000) {
      return { error: 'Enter a face value from ₹0.01 to ₹1,00,00,00,000, with up to two decimal places.', field: 'scrip-amount' };
    }
    const port = String(input.port).trim().toUpperCase();
    if (!/^IN[A-Z0-9]{3}[0-9]$/.test(port)) return { error: 'Enter the six-character Indian port code shown on your scrip, for example INNSA1.', field: 'scrip-port' };
    const result = { scheme: input.scheme, name: names[input.scheme], amount, port };
    const scheme = config?.schemes?.[input.scheme];
    const slab = config?.slabs?.find(row => amount >= row.min && (amount < row.max || (row.maxInclusive && amount === row.max)));
    const percent = scheme?.enabled ? slab?.percent : null;
    const expiry = Date.parse(config?.validUntil);
    const updated = Date.parse(config?.updatedAt);
    if (typeof percent !== 'number' || !Number.isFinite(percent) || percent <= 0 || percent > 100 || Math.abs(percent * 100 - Math.round(percent * 100)) > 1e-8 || !Number.isFinite(updated) || updated > now || (config.validUntil !== null && (!Number.isFinite(expiry) || expiry <= now || updated >= expiry))) {
      return { ...result, available: false };
    }
    const facePaise = Math.round(amount * 100);
    const payoutPaise = Math.round(facePaise * Math.round(percent * 100) / 10000);
    return { ...result, available: true, percent, payout: payoutPaise / 100, discount: (facePaise - payoutPaise) / 100, updatedAt: config.updatedAt, validUntil: config.validUntil };
  }
  function messageFor(result) {
    const lines = ['Hello Yuvglobal, I would like to sell my e-scrip.', 'Scheme: ' + result.name, 'Scrip face value: ' + money(result.amount), 'Port code: ' + result.port];
    if (result.available) lines.push('Indicative buying rate: ' + result.percent + '%', 'Estimated payout: ' + money(result.payout));
    else lines.push('Please confirm your current buying rate and estimated payout.');
    lines.push('Please confirm the document checklist and settlement terms.');
    return lines.join('\n');
  }
  if (typeof module === 'object' && module.exports) module.exports = { calculate, messageFor };
  if (!root.document) return;
  const form = document.getElementById('scrip-form');
  if (!form) return;
  const resultBox = document.getElementById('scrip-result');
  const errorBox = document.getElementById('scrip-error');
  const set = (id, value) => { document.getElementById(id).textContent = value; };
  form.addEventListener('submit', event => {
    event.preventDefault();
    form.querySelectorAll('[aria-invalid]').forEach(field => field.removeAttribute('aria-invalid'));
    const data = new FormData(form);
    const result = calculate({ scheme: data.get('scheme'), amount: data.get('amount'), port: data.get('port') }, root.YuvglobalScripRates);
    errorBox.hidden = true;
    if (result.error) {
      resultBox.hidden = true;
      errorBox.textContent = result.error;
      errorBox.hidden = false;
      const field = document.getElementById(result.field);
      if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
      return;
    }
    document.getElementById('scrip-port').value = result.port;
    set('scrip-result-title', result.available ? 'Your estimated sale value' : 'Your scrip details are ready');
    set('scrip-result-context', result.name + ' · ' + result.port + ' · Face value ' + money(result.amount));
    document.getElementById('scrip-numbers').hidden = !result.available;
    document.getElementById('scrip-pending').hidden = result.available;
    if (result.available) {
      set('scrip-buying-rate', result.percent.toFixed(2) + '%');
      set('scrip-payout', money(result.payout));
      set('scrip-discount', money(result.discount));
      const options = { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' };
      const date = new Date(result.updatedAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium' });
      set('scrip-rate-time', 'Rate schedule updated ' + date + '.' + (result.validUntil ? ' Valid until ' + new Date(result.validUntil).toLocaleString('en-IN', options) + ' IST.' : '') + ' Final rate and settlement terms require confirmation.');
    }
    const link = document.getElementById('scrip-sell-link');
    link.href = 'https://wa.me/919220819906?text=' + encodeURIComponent(messageFor(result));
    link.textContent = result.available ? 'Sell this scrip — confirm on WhatsApp ↗' : 'Get my rate on WhatsApp ↗';
    resultBox.hidden = false;
    resultBox.focus({ preventScroll: true });
    resultBox.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' });
  });
  form.addEventListener('input', () => { resultBox.hidden = true; errorBox.hidden = true; });
  form.addEventListener('change', () => { resultBox.hidden = true; errorBox.hidden = true; });
  const hamburger = document.querySelector('.hamburger');
  const menu = document.querySelector('.nav-menu');
  if (hamburger && menu) {
    const toggle = () => { const open = hamburger.getAttribute('aria-expanded') !== 'true'; hamburger.setAttribute('aria-expanded', String(open)); menu.classList.toggle('active', open); };
    hamburger.addEventListener('click', toggle);
    hamburger.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(); } });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') { hamburger.setAttribute('aria-expanded', 'false'); menu.classList.remove('active'); } });
  }
  const top = document.querySelector('.back-to-top');
  if (top) {
    window.addEventListener('scroll', () => { top.style.display = window.scrollY > 300 ? 'flex' : 'none'; }, { passive: true });
    top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));
  }
})(typeof window === 'undefined' ? globalThis : window);
