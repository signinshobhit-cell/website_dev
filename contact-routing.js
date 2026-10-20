/* Preserve the enquiry topic when a visitor follows a service-specific link. */
(function (root) {
  const topics = new Set(('aeo aeo-lo aluminium-dross aluminium-scrap apeda-registration battery-import battery-waste bis-products bonded-manufacturing capexil capexil-amendment capexil-renewal cepa-eligibility cfs chemical-import chims console-agent copper-scrap cpcb dgft-hazardous-waste dgft-licence ebrc ecoo electronics eodc export-dgft-advisory export-documentation fieo gas-lpg gjepc iata icegate iec-linking iec-registration import-authorisation india-oman-cepa lighters lithium-battery lubricants metal-scrap moef-hazardous-waste moef-waste-export moefcc mpeda mto ods oman-market-entry plexconcil product-registration refrigerant restricted-goods rules-of-origin scomet scrap-import trade-connect tyres waste-authorization waste-export').split(' '));
  const acronyms = {aeo:'AEO',lo:'LO',apeda:'APEDA',bis:'BIS',capexil:'CAPEXIL',cepa:'CEPA',cfs:'CFS',chims:'CHIMS',cpcb:'CPCB',dgft:'DGFT',ebrc:'eBRC',ecoo:'e-CoO',eodc:'EODC',fieo:'FIEO',gjepc:'GJEPC',iata:'IATA',icegate:'ICEGATE',iec:'IEC',lpg:'LPG',moef:'MoEF',moefcc:'MoEFCC',mpeda:'MPEDA',mto:'MTO',ods:'ODS',plexconcil:'PLEXCONCIL',scomet:'SCOMET'};
  function getServiceContext(search) {
    const topic = new URLSearchParams(search).get('service');
    if (!topics.has(topic)) return null;
    return {topic, label:topic.split('-').map(word => acronyms[word] || word[0].toUpperCase() + word.slice(1)).join(' ')};
  }
  if (typeof module === 'object' && module.exports) module.exports = {getServiceContext};
  else root.document.addEventListener('DOMContentLoaded', () => {
    const context = getServiceContext(root.location.search);
    const select = root.document.getElementById('service');
    if (!context || !select || select.value) return;
    const option = root.document.createElement('option');
    option.value = context.label;
    option.textContent = context.label;
    select.append(option);
    select.value = option.value;
    const note = root.document.createElement('p');
    note.className = 'service-enquiry-context';
    note.textContent = 'Selected from your service enquiry: ' + context.label + '. You can change this above.';
    select.insertAdjacentElement('afterend', note);
  });
})(typeof window === 'undefined' ? globalThis : window);
