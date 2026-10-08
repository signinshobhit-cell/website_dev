const CARGO_SHEET_ID = '1h1k-prlj_omrIhmrkUZggQHiaTYFxRYolNXMYWF8uHQ';
const CARGO_TAB = 'Cargo Enquiries';
const HEADERS = ['Request ID','Received at','Mode','Service','Origin','Destination','Ready date','Incoterm','Pickup address','Delivery address','Commodity','HS code','Packaging','Handling','Non-stackable','Sea load','Container type','Containers','Pieces','Gross kg','Volume m3','Package details','Requirements','Contact name','Company','Email','Phone','Consent','Status','Quoted rate','Currency','Follow-up date','Team notes'];

function cargoValidate(d) {
  if (!d || typeof d !== 'object' || Array.isArray(d)) throw Error('Invalid request.');
  function field(key, max, required) {
    const value = String(d[key] || '').trim();
    if (value.length > max || (required && !value)) throw Error('Please check ' + key + '.');
    return value;
  }
  function choice(key, values) { const value = field(key,200,true); if (!values.includes(value)) throw Error('Invalid ' + key + '.'); return value; }
  function number(value,min,max,integer) { const n=Number(value); if (!Number.isFinite(n) || n<min || n>max || (integer && !Number.isInteger(n))) throw Error('Please check cargo quantities and dimensions.'); return n; }
  const id=field('requestId',36,true);
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(id)) throw Error('Invalid request reference.');
  if (field('website',200,false)) throw Error('Request could not be accepted.');
  if (d.consent !== 'yes') throw Error('Consent is required.');
  const age=Date.now()-Number(d.startedAt);
  if (!Number.isFinite(age) || age<2000 || age>604800000) throw Error('Please reload the form and try again.');
  const mode=choice('mode',['air','sea']);
  const service=choice('service',['port-port','door-door','door-port','port-door']);
  const ready=field('readyDate',10,true);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ready) || isNaN(Date.parse(ready)) || new Date(ready).toISOString().slice(0,10)!==ready) throw Error('Please check cargo ready date.');
  const email=field('email',200,true),phone=field('phone',40,true);
  if (field('hsCode',10,false) && !/^\d{4,10}$/.test(d.hsCode)) throw Error('Please check HS code.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^[+()\d\s.-]{7,40}$/.test(phone) || phone.replace(/\D/g,'').length<7) throw Error('Please check email and phone.');
  const seaLoad=mode==='sea'?choice('seaLoad',['lcl','fcl']):'';
  const fcl=seaLoad==='fcl';
  let pieces=0,weight=0,volume=0,rows=[],container='',count='';
  if (fcl) {
    container=choice('containerType',['20ft dry','40ft dry','40ft high cube','20ft reefer','40ft reefer','Open top / flat rack — advise']);
    count=number(d.containers,1,1000,true);weight=number(d.fclWeight,0.01,100000000,false);volume='';pieces='';
  } else {
    if (!Array.isArray(d.packages) || !d.packages.length || d.packages.length>20) throw Error('Add 1–20 package groups.');
    rows=d.packages.map(p=>{
      if (!p || typeof p!=='object') throw Error('Invalid package group.');
      const r={pieces:number(p.pieces,1,100000,true),weight:number(p.weight,0.01,1000000,false),length:number(p.length,0.1,10000,false),width:number(p.width,0.1,10000,false),height:number(p.height,0.1,10000,false)};
      pieces+=r.pieces;weight+=r.pieces*r.weight;volume+=r.pieces*r.length*r.width*r.height/1000000;return r;
    });
  }
  return [id,new Date(),mode,service,field('origin',200,true),field('destination',200,true),ready,choice('incoterm',['unsure','EXW','FCA','FOB','CFR','CIF','CPT','CIP','DAP','DPU','DDP']),field('pickupAddress',1000,['door-door','door-port'].includes(service)),field('deliveryAddress',1000,['door-door','port-door'].includes(service)),field('commodity',300,true),field('hsCode',10,false),choice('packaging',['Cartons','Pallets','Crates','Drums','Bags','Other']),choice('handling',['general','dangerous','temperature','oversize']),d.nonStackable==='yes'?'Yes':'No',seaLoad,container,count,pieces,weight,volume,JSON.stringify(rows),field('notes',2000,false),field('contactName',120,true),field('company',200,false),email,phone,'Yes','New','','','',''];
}

function cargoSafe(value) { return typeof value==='string' && /^[\s]*[=+@-]/.test(value) ? "'"+value : value; }
function cargoReceipt(ok,message) {
  const safe=String(message).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const whatsapp=ok?'<p><a target="_blank" rel="noopener noreferrer" href="https://wa.me/919220819906?text='+encodeURIComponent('Hello Flexlyf, I would like to discuss my cargo enquiry. '+message)+'">Discuss on WhatsApp</a></p><p>Press Send in WhatsApp to contact our team.</p>':'';
  return HtmlService.createHtmlOutput('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cargo enquiry</title><body style="font-family:Arial,sans-serif;max-width:640px;margin:60px auto;padding:24px;color:#064c3f"><h1>'+ (ok?'Your quote request is saved':'Your request was not confirmed')+'</h1><p>'+safe+'</p><p>'+ (ok?'Our team will review your shipment and contact you with a quote.':'Return to the form and retry. If this continues, call +91 92208 19906.')+'</p>'+whatsapp+'<a href="https://flexlyf.com/logistics.html">Back to Flexlyf</a></body></html>');
}
function doGet() { return cargoReceipt(false,'Please submit your enquiry from the Flexlyf Logistics page.'); }
function doPost(e) {
  let lock;
  try {
    const payload=e && e.parameter && e.parameter.payload;
    if (typeof payload!=='string' || payload.length>60000) throw Error('Invalid request size.');
    const row=cargoValidate(JSON.parse(payload));
    lock=LockService.getScriptLock();
    if (!lock.tryLock(15000)) throw Error('The service is busy. Please retry.');
    const book=SpreadsheetApp.openById(CARGO_SHEET_ID);
    const sheet=book.getSheetByName(CARGO_TAB) || book.insertSheet(CARGO_TAB);
    if (!sheet.getLastRow()) {
      sheet.appendRow(HEADERS);sheet.setFrozenRows(1);
      sheet.getRange(1,1,1,HEADERS.length).setBackground('#064c3f').setFontColor('#ffffff').setFontWeight('bold');
    }
    const existing=sheet.getRange(1,1,1,HEADERS.length).getValues()[0];
    if (existing.join('|')!==HEADERS.join('|')) throw Error('The enquiry sheet needs administrator attention.');
    if (sheet.getLastRow()>1 && sheet.getRange(2,1,sheet.getLastRow()-1,1).createTextFinder(row[0]).matchEntireCell(true).findNext()) return cargoReceipt(true,'This request was already saved. Reference: '+row[0]);
    sheet.appendRow(row.map(cargoSafe));
    SpreadsheetApp.flush();
    return cargoReceipt(true,'Reference: '+row[0]);
  } catch(error) {
    // Do not expose spreadsheet IDs, account details or internal exception messages.
    return cargoReceipt(false,'We could not confirm saving this enquiry. Check your details and retry using the same form.');
  } finally { if (lock) lock.releaseLock(); }
}
