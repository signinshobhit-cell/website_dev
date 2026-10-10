const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const aliases = new Map(Object.entries({
  'usa':'united states','united states of america':'united states','u.s.a.':'united states',
  'us':'united states','uae':'united arab emirates','u.a.e.':'united arab emirates',
  'uk':'united kingdom','great britain':'united kingdom','hong kong sar, china':'hong kong',
  'hong kong sar':'hong kong','hongkong':'hong kong','korea, south':'south korea',
  'korea (south)':'south korea','korea, republic of':'south korea','russian federation':'russia',
  'u.s.a. - rest of country':'united states','united kingdom (great britain)':'united kingdom',
  "china, people's republic":'china','russian federation, the':'russia','taiwan, china':'taiwan',
  'macau sar, china':'macau','united republic of tanzania':'tanzania','tanzania, united republic of':'tanzania',
  'korea republic of':'south korea','korea the dpr of':'north korea','korea, the d.p.r of':'north korea',
  'netherlands (holland)':'netherlands','netherlands, the':'netherlands','philippines, the':'philippines','phillipines':'philippines',
  'iran (islamic republic of)':'iran','ireland, republic of':'ireland','libyan arab jamahiriya':'libya',
  'czech republic, the':'czech republic','bahama':'bahamas','monserrat':'montserrat',
  'antigua':'antigua and barbuda','antigua & barbuda':'antigua and barbuda',
  'bosnia-herzegovina':'bosnia and herzegovina','faeroe islands':'faroe islands','french guyana':'french guiana',
  'guinea republic':'guinea','guinea-equatorial':'equatorial guinea','guyana (british)':'guyana','guyana(british)':'guyana',
  'moldova republic':'moldova','moldova, republic of':'moldova','republic of moldova':'moldova',
  'montenegro republic':'montenegro','montenegro, republic of':'montenegro','serbia, republic of':'serbia',
  'trinidad & tobago':'trinidad and tobago','turks & caicos islands':'turks and caicos islands',
  'lao people\'s democratic':'laos','lao people\'s democratic republic':'laos',
  'st.lucia':'saint lucia','st. lucia':'saint lucia','yemen, republic of':'yemen',
  'nauru republic of':'nauru','nauru, republic of':'nauru','syrian arab republic':'syria',
  'micronesia federated states':'micronesia','micronesia, federated states of':'micronesia',
  'belarus/ byelorussia':'belarus','kirghizia (kyrgyzstan)':'kyrgyzstan'
}));
function key(value) { const k=String(value || '').trim().toLowerCase().replace(/\*$/,'').replace(/\s+/g,' ').replace(/\s*-\s*/g,' - '); return aliases.get(k)||k; }
function readRates(root) {
  const data=JSON.parse(fs.readFileSync(path.join(root,'.local/courier-rates.json'),'utf8'));
  if(data.schema!==1 || !Array.isArray(data.services) || data.markup!==0.3 || !data.surchargesIncluded) throw Error('Pricing is not configured.');
  return data;
}
function calculate(data, input, now=new Date()) {
  if(!input || !['export','import'].includes(input.direction)) throw Error('Choose export or import.');
  if(typeof input.country!=='string' || input.country.length>100 || !input.country.trim()) throw Error('Choose a country.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(input.readyDate||'') || isNaN(Date.parse(input.readyDate)) || new Date(input.readyDate).toISOString().slice(0,10)!==input.readyDate) throw Error('Enter a valid shipment date.');
  const today=now.toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'});
  if(input.readyDate<today) throw Error('Shipment date must be today or later.');
  const manual=reason=>({quotes:[],message:reason});
  if(Number(input.readyDate.slice(0,4))>data.confirmedValidityYear || (data.validUntil && input.readyDate>data.validUntil)) return manual('Rates are not confirmed for this shipment date. Request a manual quote.');
  if(!['general','special'].includes(input.handling)) throw Error('Choose a cargo type.');
  if(input.handling!=='general') return manual('Special cargo needs a reviewed quote. Please use the enquiry form below.');
  if(!Array.isArray(input.packages)||!input.packages.length||input.packages.length>20) throw Error('Add 1–20 package groups.');
  let gross=0,volumetric=0,billable=0,pieces=0;
  for(const p of input.packages) {
    if(!p || typeof p!=='object') throw Error('Check your package details.');
    for(const n of ['pieces','weight','length','width','height']) if(typeof p[n]!=='number'||!Number.isFinite(p[n])||p[n]<=0||p[n]>1000) throw Error('Use positive package quantities, weights and dimensions.');
    if(!Number.isInteger(p.pieces)) throw Error('Package quantity must be a whole number.');
    pieces+=p.pieces;
    if(pieces>1000) throw Error('Maximum 1,000 pieces per estimate.');
    // Courier estimates round dimensions up to cm and each piece up to 0.5 kg.
    const v=Math.ceil(p.length)*Math.ceil(p.width)*Math.ceil(p.height)/data.dimensionalDivisor;
    gross+=p.weight*p.pieces;volumetric+=v*p.pieces;
    billable+=Math.ceil((Math.max(p.weight,v)-1e-9)*2)/2*p.pieces;
    if(p.weight>70 || Math.max(p.length,p.width,p.height)>120 || p.length+2*(p.width+p.height)>300) return manual('This package needs an oversized / heavy-cargo review. Request a manual quote.');
  }
  const quotes=[];
  for(const service of data.services.filter(s=>s.direction===input.direction)) {
    const matches=Object.entries(service.zones).filter(([country])=>key(country)===key(input.country));
    if(!matches.length || new Set(matches.map(([,z])=>z)).size!==1) continue;
    const zone=matches[0][1],slab=service.rates.find(r=>r.weight>=billable-1e-9);
    if(!slab || !Number.isFinite(slab.prices[zone])) continue;
    const selling=Math.round((slab.prices[zone]*(1+data.markup)+Number.EPSILON)*100)/100;
    quotes.push({serviceId:service.id,service:service.name,amount:selling,currency:'INR',chargedKg:slab.weight});
  }
  quotes.sort((a,b)=>a.amount-b.amount);
  return {reference:'FX-'+crypto.randomUUID().slice(0,8).toUpperCase(),quotes,
    shipment:{direction:input.direction,country:input.country,readyDate:input.readyDate,pieces,grossKg:Math.round(gross*100)/100,volumetricKg:Math.round(volumetric*100)/100,billableKg:billable},
    message:quotes.length?'Fuel and supplier surcharges included. Taxes, customs duties and optional insurance are excluded. Postcode serviceability and final measurements are checked before booking.':'No instant rate covers this route or weight. Request a manual quote below.'};
}
function createCourierApi(root) {
  return async(req,res,pathname)=>{
    const send=(code,value)=>{res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
    // Same-origin local preview only. No private source files are served.
    if(req.headers.origin && !/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(req.headers.origin)) return send(403,{error:'Unavailable.'});
    try {
      let data;
      try { data=readRates(root); } catch { return send(503,{error:'Courier rates are not configured on this preview.'}); }
      if(pathname==='/api/courier/options' && req.method==='GET') {
        const countries=direction=>[...new Set(data.services.filter(s=>s.direction===direction).flatMap(s=>Object.keys(s.zones)).map(key))].sort().map(c=>c.replace(/\b\w/g,l=>l.toUpperCase()));
        return send(200,{countries:{export:countries('export'),import:countries('import')}});
      }
      if(pathname!=='/api/courier/quote'||req.method!=='POST') return send(405,{error:'Method not allowed.'});
      let body='';for await(const chunk of req){body+=chunk;if(body.length>16000)return send(413,{error:'Request too large.'});}
      return send(200,calculate(data,JSON.parse(body)));
    } catch(error) { return send(400,{error:error.code==='ENOENT'?'Courier rates are not configured on this preview.':error instanceof SyntaxError?'Invalid request.':error.message}); }
  };
}
module.exports={calculate,readRates,createCourierApi,key};
