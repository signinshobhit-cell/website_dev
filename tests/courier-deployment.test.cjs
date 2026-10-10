const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function service(){
  const source=fs.readFileSync(path.join(root,'scripts/courier-api.cjs'),'utf8');
  const calculator=source.slice(source.indexOf('const aliases'),source.indexOf('function createCourierApi')).replace(/function readRates\(root\) \{[\s\S]*?\n\}/,'').replace("now.toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'})","Utilities.formatDate(now,'Asia/Kolkata','yyyy-MM-dd')").replace('crypto.randomUUID()','Utilities.getUuid()');
  const data={markup:.7,confirmedValidityYear:2027,dimensionalDivisor:5000,services:[{id:'test',name:'Example courier',direction:'export',zones:{UAE:'1'},rates:[{weight:1,prices:{1:1000}}]}]};
  const context=vm.createContext({LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock(){}})},CacheService:{getScriptCache:()=>({get:()=>null,put(){}})},Utilities:{formatDate:()=> '2026-10-10',getUuid:()=> '12345678-test'},ContentService:{MimeType:{JSON:'json',JAVASCRIPT:'js'},createTextOutput:text=>({text,setMimeType(type){this.type=type;return this;}})}});
  vm.runInContext('const PRIVATE_RATES='+JSON.stringify(data)+';\n'+calculator+fs.readFileSync(path.join(root,'integrations/courier/Endpoint.gs'),'utf8'),context);return context;
}
const shipment={direction:'export',country:'UAE',readyDate:'2026-10-11',handling:'general',packages:[{pieces:1,weight:1,length:10,width:10,height:10}]};
test('deployed calculator returns 70 percent selling price without supplier costs',()=>{const c=service();const r=c.doGet({parameter:{action:'quote',shipment:JSON.stringify(shipment)}});const d=JSON.parse(r.text);assert.equal(d.quotes[0].amount,1700);assert.doesNotMatch(r.text,/PRIVATE_RATES|markup|prices|1000/);});
test('JSONP callbacks are restricted and malformed requests fail safely',()=>{const c=service();assert.equal(c.doGet({parameter:{callback:'alert(1)//'}}).text,'{}');assert.match(c.doGet({parameter:{action:'quote',shipment:'not-json'}}).text,/Check your shipment/);const r=c.doGet({parameter:{action:'options',callback:'flexlyfCourier_test'}});assert.match(r.text,/^flexlyfCourier_test\(/);assert.doesNotMatch(r.text,/prices|markup/);});
