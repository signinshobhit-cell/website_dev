const test=require('node:test'),assert=require('node:assert/strict');
const {calculate,key}=require('../scripts/courier-api.cjs');
const data={markup:.7,surchargesIncluded:true,confirmedValidityYear:2027,validUntil:null,dimensionalDivisor:5000,services:[
 {id:'aramex-export',name:'Aramex International',direction:'export',zones:{UAE:'1'},rates:[{weight:.5,prices:{'1':651.25}},{weight:1,prices:{'1':847.5}},{weight:2,prices:{'1':1102.5}}]},
 {id:'import',name:'Import courier',direction:'import',zones:{'United Arab Emirates':'1'},rates:[{weight:1,prices:{'1':1000}}]}
]};
const now=new Date('2026-10-10T06:00:00Z');
const input=extra=>({direction:'export',country:'United Arab Emirates',readyDate:'2026-10-11',handling:'general',packages:[{pieces:1,weight:1,length:10,width:10,height:10}],...extra});
test('70 percent markup is applied once without adding included surcharges',()=>{const q=calculate(data,input(),now);assert.equal(q.quotes[0].amount,1440.75);assert.equal(q.quotes[0].chargedKg,1);assert.equal(q.quotes[0].currency,'INR');assert.doesNotMatch(JSON.stringify(q),/"markup"|"prices"|"sourceSheet"|"supplier"|651.25|847.5/);});
test('volumetric weight and half kilogram rounding affect slab selection',()=>{const q=calculate(data,input({packages:[{pieces:1,weight:.4,length:20,width:20,height:20}]}),now);assert.equal(q.shipment.volumetricKg,1.6);assert.equal(q.shipment.billableKg,2);assert.equal(q.quotes[0].amount,1874.25);});
test('mixed dense and light boxes calculate chargeable weight per piece',()=>{const q=calculate(data,input({packages:[{pieces:1,weight:1,length:10,width:10,height:10},{pieces:1,weight:.1,length:10,width:10,height:10}]}),now);assert.equal(q.shipment.billableKg,1.5);assert.equal(q.shipment.pieces,2);assert.equal(q.quotes[0].chargedKg,2);});
test('unsupported route, high weight, special cargo and dates use manual fallback',()=>{for(const e of [{country:'Atlantis'},{packages:[{pieces:1,weight:3,length:10,width:10,height:10}]},{handling:'special'},{readyDate:'2028-01-01'},{packages:[{pieces:1,weight:1,length:121,width:10,height:10}]}])assert.equal(calculate(data,input(e),now).quotes.length,0);});
test('import filters out export services and supports aliases',()=>{const q=calculate(data,input({direction:'import',country:'UAE'}),now);assert.equal(q.quotes.length,1);assert.equal(q.quotes[0].amount,1700);assert.equal(key('USA'),'united states');});
test('invalid fields and quantities cannot produce quotes',()=>{for(const e of [{direction:'sea'},{readyDate:'2026-02-31'},{readyDate:'2026-10-09'},{packages:[]},{packages:[{pieces:1.5,weight:1,length:1,width:1,height:1}]},{packages:[{pieces:1,weight:-1,length:1,width:1,height:1}]}])assert.throws(()=>calculate(data,input(e),now));});
test('exact configured expiry is honored',()=>assert.equal(calculate({...data,validUntil:'2027-03-31'},input({readyDate:'2027-04-01'}),now).quotes.length,0));
