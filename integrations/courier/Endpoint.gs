// A separate Apps Script project: no Spreadsheet / Drive / Gmail permissions.
// PRIVATE_RATES and the calculator are added by the local deployment builder.
function doGet(e) {
  const p=e && e.parameter || {},callback=p.callback || '';
  if(callback && !/^flexlyfCourier_[a-zA-Z0-9_]{1,80}$/.test(callback))return ContentService.createTextOutput('{}').setMimeType(ContentService.MimeType.JSON);
  let response;
  try {
    if(p.action==='options'){
      const countries=direction=>[...new Set(PRIVATE_RATES.services.filter(s=>s.direction===direction).flatMap(s=>Object.keys(s.zones)).map(key))].sort().map(c=>c.replace(/\b\w/g,l=>l.toUpperCase()));
      response={countries:{export:countries('export'),import:countries('import')}};
    }else if(p.action==='quote'){
      if(!p.shipment || p.shipment.length>12000)throw Error('Please reduce the number of box groups.');
      const lock=LockService.getScriptLock();
      if(!lock.tryLock(1500))throw Error('The rate service is busy. Please try again shortly.');
      try{
        const cache=CacheService.getScriptCache(),bucket='quotes-'+Math.floor(Date.now()/60000),count=Number(cache.get(bucket)||0);
        if(count>=300)throw Error('The rate service is busy. Please try again in a minute or request a manual quote.');
        cache.put(bucket,String(count+1),120);
      }finally{lock.releaseLock();}
      const input=JSON.parse(p.shipment);
      // Only route, date and box measurements are processed; no customer identity.
      response=calculate(PRIVATE_RATES,input);
    }else response={error:'Choose a supported quote action.'};
  }catch(error){response={error:error instanceof SyntaxError?'Check your shipment details.':error.message};}
  const json=JSON.stringify(response).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  return ContentService.createTextOutput(callback?callback+'('+json+');':json).setMimeType(callback?ContentService.MimeType.JAVASCRIPT:ContentService.MimeType.JSON);
}
