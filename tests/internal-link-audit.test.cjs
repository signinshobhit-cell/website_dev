const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {audit}=require('../scripts/audit-internal-links.cjs');
const {getServiceContext}=require('../contact-routing.js');
function fixture(files,run){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'yuvglobal-links-'));
  try{for(const [name,content]of Object.entries(files)){fs.mkdirSync(path.dirname(path.join(root,name)),{recursive:true});fs.writeFileSync(path.join(root,name),content);}run(root);}
  finally{fs.rmSync(root,{recursive:true,force:true});}
}
test('internal audit resolves absolute URLs, directory indexes, base paths and encoded fragments',()=>{
  fixture({
    'index.html':'<a href="https://www.yuvglobal.com/nested/guide.html?view=all#route%20one">Guide</a><a href="/legacy/">Legacy</a>',
    'nested/guide.html':'<base href="../"><h1 id="route one">Guide</h1><a href="index.html">Home</a><script src="app.js"></script>',
    'app.js':'',
    'legacy/index.html':'<meta http-equiv="refresh" content="0;url=/"><a href="/">Home</a>'
  },root=>{const result=audit(root);assert.deepEqual(result.errors,[]);assert.equal(result.depth['/nested/guide.html'],1);assert.ok(result.warnings.some(x=>x.issue==='link-to-legacy-redirect'));});
});
test('audit catches missing same-site files, scripts, anchors, duplicate IDs and orphan pages',()=>{
  fixture({
    'index.html':'<a href="https://yuvglobal.com/missing.html">Broken</a><a href="other.html#missing">Other</a><script src="missing.js"></script><div id="same"></div><div id="same"></div>',
    'other.html':'<a href="/">Home</a>',
    'orphan.html':'<a href="/">Home</a>'
  },root=>{const result=audit(root);for(const issue of ['missing-target','missing-anchor','duplicate-id','orphan-page'])assert.ok(result.errors.some(x=>x.issue===issue),issue);assert.ok(result.errors.some(x=>x.href==='missing.js'));});
});
test('service-specific enquiry links retain their topic and reject unsupported query values',()=>{
  assert.deepEqual(getServiceContext('?service=chims'),{topic:'chims',label:'CHIMS'});
  assert.equal(getServiceContext('?service=iec-linking').label,'IEC Linking');
  for(const query of ['', '?service=%3Cscript%3E', '?service=unlisted-service'])assert.equal(getServiceContext(query),null);
  const root=path.resolve(__dirname,'..');
  for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){
    const html=fs.readFileSync(path.join(root,file),'utf8');
    for(const [,topic]of html.matchAll(/contact\.html\?service=([^"'&#]+)/g))assert.ok(getServiceContext('?service='+topic),file+': '+topic);
  }
  assert.match(fs.readFileSync(path.join(root,'contact.html'),'utf8'),/src="contact-routing\.js"/);
});
