const fs = require('node:fs');
const path = require('node:path');
const labels = {
  'services.html': 'All export & import services',
  'iec-registration.html': 'IEC registration & DGFT profile support',
  'licensing.html': 'Import & export licensing',
  'rcmc-registration.html': 'RCMC & export council registration',
  'apeda-registration.html': 'APEDA RCMC registration',
  'import-monitoring.html': 'Import monitoring system registration',
  'epr-registration.html': 'EPR registration & importer compliance',
  'certification.html': 'Global compliance certification',
  'testing.html': 'Product testing & laboratory coordination',
  'logistics.html': 'Logistics & freight forwarding',
  'international-courier.html': 'International courier quotes & shipping',
  'insurance.html': 'Marine cargo & trade insurance',
  'trade-finance.html': 'Trade finance, LC & bank guarantee support',
  'trade-agreements.html': 'Trade agreements & certificate of origin',
  'rodtep-exchange.html': 'Sell RoDTEP & RoSCTL scrips',
  'ecommerce-export.html': 'Global marketplace onboarding & e-commerce exports',
  'walmart-seller-onboarding.html': 'Walmart seller onboarding assistance',
  'export-benefits.html': 'Export benefits & scheme assistance',
  'ai-export.html': 'AI-assisted export research & workflows'
};
const related = {
  'iec-registration.html': ['licensing.html', 'rcmc-registration.html', 'ecommerce-export.html'],
  'licensing.html': ['iec-registration.html', 'rcmc-registration.html', 'import-monitoring.html', 'epr-registration.html'],
  'rcmc-registration.html': ['apeda-registration.html', 'iec-registration.html', 'export-benefits.html', 'trade-agreements.html'],
  'apeda-registration.html': ['rcmc-registration.html', 'testing.html', 'certification.html', 'logistics.html'],
  'import-monitoring.html': ['licensing.html', 'epr-registration.html', 'certification.html', 'logistics.html'],
  'epr-registration.html': ['import-monitoring.html', 'licensing.html', 'certification.html', 'testing.html'],
  'certification.html': ['testing.html', 'epr-registration.html', 'trade-agreements.html'],
  'testing.html': ['certification.html', 'apeda-registration.html', 'logistics.html'],
  'logistics.html': ['international-courier.html', 'insurance.html', 'trade-agreements.html', 'licensing.html'],
  'international-courier.html': ['logistics.html', 'ecommerce-export.html', 'insurance.html'],
  'insurance.html': ['logistics.html', 'international-courier.html', 'trade-finance.html'],
  'trade-finance.html': ['export-benefits.html', 'rodtep-exchange.html', 'logistics.html', 'ecommerce-export.html'],
  'trade-agreements.html': ['licensing.html', 'rcmc-registration.html', 'logistics.html', 'certification.html'],
  'rodtep-exchange.html': ['export-benefits.html', 'trade-finance.html', 'licensing.html'],
  'ecommerce-export.html': ['walmart-seller-onboarding.html', 'iec-registration.html', 'international-courier.html', 'export-benefits.html'],
  'walmart-seller-onboarding.html': ['ecommerce-export.html', 'iec-registration.html', 'international-courier.html', 'certification.html'],
  'export-benefits.html': ['rodtep-exchange.html', 'trade-finance.html', 'rcmc-registration.html', 'ecommerce-export.html'],
  'ai-export.html': ['ecommerce-export.html', 'trade-finance.html', 'trade-intelligence.html']
};
labels['trade-intelligence.html'] = 'Official trade updates & export guidance';
const escape = text => text.replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
function update(root) {
  for (const [file, targets] of Object.entries(related)) {
    let html = fs.readFileSync(path.join(root, file), 'utf8');
    const section = '<section id="seo-related-services" class="seo-related-section"><div class="container"><h2>Find related trade support</h2><ul class="seo-related">' +
      ['services.html', ...targets].map(target => `<li><a href="${target}">${escape(labels[target])} →</a></li>`).join('') + '</ul></div></section>';
    const existing = /<section\b(?=[^>]*\bid="seo-related-services")[^>]*>[\s\S]*?<\/section>/;
    html = existing.test(html) ? html.replace(existing, section) : html.replace('</main>', section + '</main>');
    fs.writeFileSync(path.join(root, file), html);
  }
}
if (require.main === module) { update(path.resolve(__dirname, '..')); console.log(`Updated related links on ${Object.keys(related).length} service pages.`); }
module.exports = { update, related, labels };
