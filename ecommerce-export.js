(function (root) {
  'use strict';
  const catalog = typeof module === 'object' && module.exports ? require('./marketplace-channels.js') : root.YuvglobalMarketplaceCatalog;
  const channels = ['', ...(catalog?.channels || []).map(channel => channel.name), 'Another marketplace'];
  const stages = ['Starting my first online business', 'Already selling online in India', 'Already exporting through e-commerce'];
  function filterChannels(items, filters = {}) {
    const search = String(filters.search || '').trim().toLowerCase();
    return items.filter(channel =>
      (!filters.region || filters.region === 'all' || channel.regions.includes(filters.region) || channel.regions.includes('worldwide')) &&
      (!filters.country || filters.country === 'all' || (channel.countryCodes || []).includes(filters.country) || (channel.countryCodes || []).includes('*')) &&
      (!filters.category || filters.category === 'all' || channel.categories.includes(filters.category)) &&
      (!filters.route || filters.route === 'all' || channel.route === filters.route) &&
      (!search || (channel.name + ' ' + channel.kind + ' ' + channel.countries).toLowerCase().includes(search))
    );
  }
  function prepareEnquiry(input) {
    const product = String(input.product || '').trim();
    const market = String(input.market || '').trim();
    if (!product || product.length > 300) return { error: 'Tell us your product or category in up to 300 characters.' };
    const selections = input.channels === undefined ? [] : input.channels;
    if (!Array.isArray(selections) || selections.length > channels.length || selections.some(name => typeof name !== 'string' || !name || !channels.includes(name)) || !channels.includes(input.channel) || !stages.includes(input.stage) || market.length > 100) return { error: 'Please check the channel, selling stage and target market.' };
    const selected = [...new Set([...selections, input.channel].filter(Boolean))];
    const message = ['Hello Yuvglobal, I would like a quote for global marketplace onboarding / e-commerce export support.', 'Product: ' + product, 'Selling stage: ' + input.stage, 'Channels: ' + (selected.join(', ') || 'Help me choose'), 'Target market: ' + (market || 'To discuss'), 'Please review seller eligibility for each selected channel and confirm the onboarding scope, fees and next steps.'].join('\n');
    return { message, url: 'https://wa.me/919220819906?text=' + encodeURIComponent(message) };
  }
  if (typeof module === 'object' && module.exports) module.exports = { prepareEnquiry, filterChannels };
  if (!root.document) return;
  const selectedChannels = new Set();
  const checks = [...document.querySelectorAll('[data-pick-channel]')];
  const form = document.getElementById('ec-enquiry-form');
  if (form) {
    const result = document.getElementById('ec-enquiry-result');
    const error = document.getElementById('ec-enquiry-error');
    const channelSelect = document.getElementById('ec-channel');
    const syncSelections = () => {
      checks.forEach(check => { check.checked = selectedChannels.has(check.dataset.pickChannel); });
      const list = [...selectedChannels];
      const count = document.getElementById('ec-selection-count');
      if (count) count.textContent = list.length + ' channel' + (list.length === 1 ? '' : 's') + ' selected';
      const names = document.getElementById('ec-selection-names');
      if (names) names.textContent = list.join(' · ') || 'Tick “Add to my enquiry” on any channel card.';
      const summary = document.getElementById('ec-enquiry-selected');
      if (summary) summary.textContent = list.join(' · ') || 'No channels selected yet. Choose above or use the field below.';
      result.hidden = true; error.hidden = true;
    };
    if (new URLSearchParams(location.search).get('channel') === 'walmart') { channelSelect.value = 'Walmart US'; selectedChannels.add('Walmart US'); }
    checks.forEach(check => check.addEventListener('change', () => {
      if (check.checked) selectedChannels.add(check.dataset.pickChannel);
      else { selectedChannels.delete(check.dataset.pickChannel); if (channelSelect.value === check.dataset.pickChannel) channelSelect.value = ''; }
      syncSelections();
    }));
    document.querySelectorAll('[data-channel]').forEach(link => link.addEventListener('click', () => {
      channelSelect.value = link.dataset.channel;
      selectedChannels.add(link.dataset.channel);
      syncSelections();
    }));
    document.getElementById('ec-clear-selection')?.addEventListener('click', () => { selectedChannels.clear(); channelSelect.value = ''; syncSelections(); });
    channelSelect.addEventListener('change', () => { if (channelSelect.value && channelSelect.value !== 'Another marketplace') selectedChannels.add(channelSelect.value); syncSelections(); });
    syncSelections();
    form.addEventListener('submit', event => {
      event.preventDefault();
      const enquiry = prepareEnquiry({ ...Object.fromEntries(new FormData(form)), channels: [...selectedChannels] });
      error.hidden = true; result.hidden = true;
      if (enquiry.error) { error.textContent = enquiry.error; error.hidden = false; document.getElementById('ec-product').focus(); return; }
      document.getElementById('ec-enquiry-summary').textContent = enquiry.message;
      document.getElementById('ec-whatsapp-link').href = enquiry.url;
      result.hidden = false; result.focus({ preventScroll: true });
      result.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    });
    form.addEventListener('input', () => { result.hidden = true; error.hidden = true; });
    form.addEventListener('change', () => { result.hidden = true; error.hidden = true; });
  }
  const region = document.getElementById('ec-region-filter');
  if (region) {
    const category = document.getElementById('ec-category-filter');
    const country = document.getElementById('ec-country-filter');
    const route = document.getElementById('ec-route-filter');
    const search = document.getElementById('ec-channel-search');
    let lastSuggestedMarket = '';
    const applyFilters = () => {
      const matches = filterChannels(catalog.channels, { region: region.value, country: country.value, category: category.value, route: route.value, search: search.value });
      const names = new Set(matches.map(item => item.name));
      document.querySelectorAll('[data-name][data-region]').forEach(card => { card.hidden = !names.has(card.dataset.name); });
      document.getElementById('ec-filter-status').textContent = matches.length + ' of ' + catalog.channels.length + ' channels shown';
      document.getElementById('ec-directory-empty').hidden = matches.length !== 0;
      const marketField = document.getElementById('ec-market');
      const suggestedMarket = country.value === 'all' ? '' : catalog.countryLabels[country.value];
      if (marketField && (!marketField.value || marketField.value === lastSuggestedMarket) && marketField.value !== suggestedMarket) {
        marketField.value = suggestedMarket;
        document.getElementById('ec-enquiry-result').hidden = true;
      }
      lastSuggestedMarket = suggestedMarket;
    };
    [region,country,category,route].forEach(input => input.addEventListener('change', applyFilters));
    search.addEventListener('input', applyFilters);
    document.getElementById('ec-reset-filters').addEventListener('click', () => { region.value = 'all'; country.value = 'all'; category.value = 'all'; route.value = 'all'; search.value = ''; applyFilters(); region.focus(); });
    applyFilters();
  }
  const hamburger = document.querySelector('.hamburger'), menu = document.querySelector('.nav-menu');
  if (hamburger && menu) {
    const toggle = () => { const open = hamburger.getAttribute('aria-expanded') !== 'true'; hamburger.setAttribute('aria-expanded', String(open)); hamburger.classList.toggle('active', open); menu.classList.toggle('active', open); };
    hamburger.addEventListener('click', toggle);
    hamburger.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(); } });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') { hamburger.setAttribute('aria-expanded', 'false'); hamburger.classList.remove('active'); menu.classList.remove('active'); } });
  }
})(typeof window === 'undefined' ? globalThis : window);
