/* Audit built HTML, including absolute same-site links, base URLs and fragments. */
const fs = require('node:fs');
const path = require('node:path');
const origin = 'https://www.yuvglobal.com';
function decode(value) {
  return value.replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi, entity => {
    const named = {'&amp;':'&','&quot;':'"','&apos;':"'",'&lt;':'<','&gt;':'>'};
    if (named[entity]) return named[entity];
    const number = entity.slice(2,-1);
    const point = number[0].toLowerCase() === 'x' ? parseInt(number.slice(1),16) : Number(number);
    return point <= 0x10ffff ? String.fromCodePoint(point) : entity;
  });
}
function attrs(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)].map(m=>[m[1].toLowerCase(),decode(m[2]??m[3]??m[4])]));
}
function walk(root) {
  return fs.readdirSync(root,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(root,entry.name)):[path.join(root,entry.name)]);
}
function audit(root) {
  root = path.resolve(root);
  const pages = new Map(), errors = [], warnings = [], links = [];
  for (const file of walk(root).filter(file=>file.endsWith('.html'))) {
    const url = '/' + path.relative(root,file).split(path.sep).join('/');
    const html = fs.readFileSync(file,'utf8');
    const markup = html.replace(/<script\b([^>]*)>[\s\S]*?<\/script>/gi,'<script$1></script>')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'');
    const baseTag = markup.match(/<base\b[^>]*>/i);
    const base = new URL(baseTag ? attrs(baseTag[0]).href : url, origin + url);
    const ids = [...markup.matchAll(/<[a-z][^>]*>/gi)].map(m=>attrs(m[0]).id).filter(Boolean);
    const seen = new Set();
    for (const id of ids) { if(seen.has(id))errors.push({source:url,issue:'duplicate-id',id}); seen.add(id); }
    const noindex = [...markup.matchAll(/<meta\b[^>]*>/gi)].some(m=>{const a=attrs(m[0]);return a.name?.toLowerCase()==='robots'&&/noindex/i.test(a.content||'');});
    const redirect = /<meta\b[^>]*http-equiv=["']refresh["']/i.test(markup);
    const canonicalTag = markup.match(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*>/i);
    pages.set(url,{file,markup,base,ids:seen,noindex,redirect,canonical:canonicalTag?attrs(canonicalTag[0]).href:null,outgoing:new Set()});
    if (/action=["'][^"']*(?:YOUR_|REPLACE_|EXAMPLE_)/i.test(markup)) warnings.push({source:url,issue:'unconfigured-form-endpoint'});
  }
  const route = pathname => {
    let pathnameDecoded;
    try { pathnameDecoded=decodeURIComponent(pathname); } catch { return null; }
    if(pathnameDecoded.endsWith('/'))pathnameDecoded+='index.html';
    if(pages.has(pathnameDecoded+'/index.html'))pathnameDecoded+='/index.html';
    return pathnameDecoded;
  };
  for (const [source,page] of pages) {
    for (const match of page.markup.matchAll(/<(a|area|link|img|script|source|iframe)\b[^>]*>/gi)) {
      const tag=match[1].toLowerCase(),a=attrs(match[0]),href=tag==='a'||tag==='area'||tag==='link'?a.href:a.src;
      if(href==null)continue;
      if(!href.trim()||href==='#'){if(tag==='a')errors.push({source,issue:'placeholder-link',href});continue;}
      let url;
      try {url=new URL(href,page.base);}catch{errors.push({source,issue:'malformed-url',href});continue;}
      if(!['http:','https:'].includes(url.protocol)||!['www.yuvglobal.com','yuvglobal.com'].includes(url.hostname))continue;
      const target=route(url.pathname);
      if(!target){errors.push({source,issue:'invalid-encoded-path',href});continue;}
      const destination=path.resolve(root,'.'+target);
      if(path.relative(root,destination).startsWith('..')||!fs.existsSync(destination)){errors.push({source,issue:'missing-target',href});continue;}
      if(tag!=='a'&&tag!=='area')continue;
      links.push({source,target,href});
      const targetPage=pages.get(target);
      if(targetPage){
        let fragment;
        try {fragment=decodeURIComponent(url.hash.slice(1));}catch{errors.push({source,issue:'invalid-fragment',href});continue;}
        if(fragment&&!targetPage.ids.has(fragment))errors.push({source,issue:'missing-anchor',href});
        if(source!==target)page.outgoing.add(target);
        if(targetPage.noindex&&!page.noindex&&source!==target)warnings.push({source,issue:'link-to-noindex-page',href});
        if(targetPage.redirect)warnings.push({source,issue:'link-to-legacy-redirect',href});
        if(url.protocol!=='https:')warnings.push({source,issue:'insecure-internal-link',href});
      }
    }
  }
  const depth = new Map();
  if(pages.has('/index.html')){
    depth.set('/index.html',0);const queue=['/index.html'];
    for(let i=0;i<queue.length;i++)for(const target of pages.get(queue[i]).outgoing)if(!depth.has(target)){depth.set(target,depth.get(queue[i])+1);queue.push(target);}
  }
  const indexable=[...pages].filter(([,p])=>!p.noindex&&!p.redirect).map(([url])=>url);
  const orphans=indexable.filter(url=>!depth.has(url));
  for(const source of orphans)errors.push({source,issue:'orphan-page'});
  const sitemapFile=path.join(root,'sitemap.xml');
  if(fs.existsSync(sitemapFile))for(const [,loc]of fs.readFileSync(sitemapFile,'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)){
    const url=new URL(decode(loc)),target=route(url.pathname),page=pages.get(target);
    if(!page)errors.push({source:'sitemap.xml',issue:'missing-sitemap-target',href:loc});
    else if(page.canonical!==loc)errors.push({source:'sitemap.xml',issue:'sitemap-canonical-mismatch',href:loc,canonical:page.canonical});
  }
  return {pages:pages.size,indexable:indexable.length,internalLinks:links.length,errors,warnings,orphans,maxDepth:Math.max(0,...indexable.map(url=>depth.get(url)||0)),depth:Object.fromEntries(indexable.map(url=>[url,depth.get(url)??null])),links};
}
async function checkLive(report) {
  const urls=[...new Set(report.links.map(link=>link.target))];
  const results=[];let next=0;
  await Promise.all(Array.from({length:4},async()=>{
    while(next<urls.length){const pathname=urls[next++];try{const response=await fetch(origin+(pathname==='/index.html'?'/':pathname),{signal:AbortSignal.timeout(20000)});await response.arrayBuffer();results.push({path:pathname,status:response.status,final:response.url});}catch(error){results.push({path:pathname,error:error.message});}}
  }));
  return results.sort((a,b)=>a.path.localeCompare(b.path));
}
if(require.main===module){
  (async()=>{const report=audit(path.resolve(__dirname,'../dist'));if(process.argv.includes('--live'))report.live=await checkLive(report);
    const out=process.argv.indexOf('--output');if(out!==-1)fs.writeFileSync(process.argv[out+1],JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify({...report,links:undefined,depth:undefined,live:report.live?{checked:report.live.length,failures:report.live.filter(r=>r.status!==200)}:undefined},null,2));
    if(report.errors.length||report.live?.some(r=>r.status!==200))process.exitCode=1;
  })().catch(error=>{console.error(error);process.exitCode=1;});
}
module.exports={audit};
