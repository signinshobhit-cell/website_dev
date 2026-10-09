const fs=require('node:fs'),path=require('node:path');
const SOURCE='https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';
function parseRates(xml) {
  const date=xml.match(/time=['"](\d{4}-\d{2}-\d{2})['"]/i)?.[1];
  const base={EUR:1};
  for(const match of xml.matchAll(/currency=['"]([A-Z]{3})['"]\s+rate=['"]([\d.]+)['"]/g)) base[match[1]]=Number(match[2]);
  if(!date || !Number.isFinite(Date.parse(date)) || !(base.INR>0) || !(base.USD>0) || Object.keys(base).length<20 || Object.values(base).some(x=>!Number.isFinite(x)||x<=0)) throw Error('Invalid ECB reference feed; previous snapshot retained.');
  const rates=Object.fromEntries(Object.entries(base).filter(([code])=>code!=='INR').map(([code,value])=>[code,{inr:base.INR/value,basis:'ECB cross-rate'}]));
  rates.AED={inr:rates.USD.inr/3.6725,basis:'USD peg estimate'};rates.SAR={inr:rates.USD.inr/3.75,basis:'USD peg estimate'};
  return {date,source:SOURCE,rates};
}
async function update(root=path.resolve(__dirname,'..')) {
  const response=await fetch(SOURCE,{signal:AbortSignal.timeout(25000)});
  if(!response.ok) throw Error('ECB feed HTTP '+response.status);
  const data=parseRates(await response.text());
  const target=path.join(root,'data/fx-rates.json');
  if(fs.existsSync(target)){const old=JSON.parse(fs.readFileSync(target,'utf8'));if(old.date>data.date)throw Error('ECB date regressed; previous snapshot retained.');}
  fs.writeFileSync(target,JSON.stringify(data,null,2)+'\n');console.log('ECB reference rates: '+data.date);return data;
}
if(require.main===module)update().catch(error=>{console.error(error.message);process.exitCode=1;});
module.exports={parseRates,update};
