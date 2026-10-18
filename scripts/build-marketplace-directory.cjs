/* Regenerate crawlable marketplace cards and enquiry options from the public catalogue. */
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const { channels, countryLabels } = require('../marketplace-channels.js');
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const routes = { india: 'India seller guidance available', review: 'Cross-border route review', restricted: 'Entity / invitation review', store: 'Own-store setup' };
let html = fs.readFileSync(path.join(root, 'ecommerce-export.html'), 'utf8');
const cards = channels.map((channel,index) => `<article class="ec-channel" data-region="${esc(channel.regions.join(' '))}" data-categories="${esc(channel.categories.join(' '))}" data-route="${esc(channel.route)}" data-name="${esc(channel.name)}"><span class="ec-channel-type">${esc(channel.kind)}</span><h3 class="ec-channel-name">${esc(channel.name)}</h3><p class="ec-channel-countries">${esc(channel.countries)}</p><span class="ec-route-badge ec-route-${esc(channel.route)}">${routes[channel.route]}</span><details class="ec-channel-details"><summary>Onboarding &amp; route notes</summary><p>${esc(channel.note)}</p><a href="${esc(channel.source)}" target="_blank" rel="noopener noreferrer">Official platform reference ↗</a>${channel.guide ? `<a href="${esc(channel.guide)}">Detailed onboarding guide →</a>` : ''}</details><div class="ec-channel-links"><label class="ec-select-channel" for="ec-pick-${index}"><input id="ec-pick-${index}" type="checkbox" data-pick-channel="${esc(channel.name)}" aria-label="Add ${esc(channel.name)} to my enquiry"><span>Add to my enquiry</span></label><a href="#export-enquiry" data-channel="${esc(channel.name)}" aria-label="Enquire about ${esc(channel.name)}">Discuss ${esc(channel.name)} onboarding →</a></div></article>`).join('\n');
html = html.replace(/(<div id="ec-marketplace-directory" class="ec-channel-grid">)[\s\S]*?(<\/div>\s*<div class="ec-route-legend">)/,(_,start,end)=>start+cards+end);
const options = '<option value="">Help me choose / use my selections</option>'+channels.map(channel=>`<option>${esc(channel.name)}</option>`).join('')+'<option>Another marketplace</option>';
html = html.replace(/(<select id="ec-channel"[^>]*>)[\s\S]*?<\/select>/,(_,start)=>start+options+'</select>');
const countries = '<option value="all">All target countries</option>'+Object.entries(countryLabels || {}).sort((a,b)=>a[1].localeCompare(b[1])).map(([code,name])=>`<option value="${esc(code)}">${esc(name)}</option>`).join('');
html = html.replace(/(<select id="ec-country-filter"[^>]*>)[\s\S]*?<\/select>/,(_,start)=>start+countries+'</select>');
html = html.replace(/Explore \d+ marketplaces and storefront platforms\./,`Explore ${channels.length} marketplaces and storefront platforms.`);
html = html.replace(/(<p id="ec-filter-status"[^>]*>)[\s\S]*?<\/p>/,(_,start)=>start+channels.length+' channels to explore</p>');
fs.writeFileSync(path.join(root,'ecommerce-export.html'),html,'utf8');
console.log(`Marketplace directory built: ${channels.length} channels.`);
