const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
test('service discovery uses unique canonical pages with consistent real business data',()=>{
  const names=['services.html','iec-registration.html','apeda-registration.html','international-courier.html','licensing.html','logistics.html','rcmc-registration.html'];
  const titles=new Set();
  for(const name of names){const html=fs.readFileSync(path.join(root,name),'utf8');const title=html.match(/<title>([^<]+)<\/title>/)[1];assert.ok(!titles.has(title),'Duplicate title: '+name);titles.add(title);assert.match(html,new RegExp('href="https://flexlyf.com/'+name.replace('.','\\.')+'"'));assert.ok(!/<meta[^>]*name="robots"[^>]*content="[^\"]*noindex/.test(html));const blocks=[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));for(const data of blocks){for(const entity of data['@graph']||[data]){if(entity['@type']==='ProfessionalService'){assert.equal(entity.address.streetAddress,'310, Arjangarh');assert.equal(entity.address.addressLocality,'New Delhi');assert.ok(!entity.aggregateRating);}}}assert.doesNotMatch(html,/A-123|Sector 63/);assert.match(html,/href="services.html"/);}
  const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');for(const name of names)assert.ok(sitemap.includes('https://flexlyf.com/'+name));
  assert.match(fs.readFileSync(path.join(root,'licensing.html'),'utf8'),/href="iec-registration.html"/);
  assert.match(fs.readFileSync(path.join(root,'rcmc-registration.html'),'utf8'),/href="apeda-registration.html"/);
});
