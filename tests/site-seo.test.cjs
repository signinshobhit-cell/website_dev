const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {build} = require('../scripts/build-site.cjs');
test('public pages, assets and anchors resolve; sitemap and article metadata are consistent', () => {
  const source = path.resolve(__dirname,'..');
  const root = fs.mkdtempSync(path.join(os.tmpdir(),'flexlyf-seo-'));
  try {
    for (const name of fs.readdirSync(source)) {
      if (/\.(html|css|js|svg|ico)$/.test(name) || ['sitemap.xml','robots.txt','news.json','assets','data','news-images'].includes(name)) {
        fs.cpSync(path.join(source,name),path.join(root,name),{recursive:true});
      }
    }
    const output=build(root);
    const files=fs.readdirSync(output).filter(name=>name.endsWith('.html')).map(name=>path.join(output,name));
    files.push(...fs.readdirSync(path.join(output,'updates')).map(name=>path.join(output,'updates',name)));
    const failures=[];
    for(const file of files) {
      const text=fs.readFileSync(file,'utf8');
      const base=text.includes('<base href="../">') ? output : path.dirname(file);
      const markup=text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
      for(const match of markup.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
        const href=match[1];
        if(/^(?:[a-z]+:|\/\/)/i.test(href)) continue;
        const url=new URL(href,'https://flexlyf.com/'+path.basename(file));
        const target=url.pathname==='/'?path.join(base,'index.html'):path.join(base,decodeURIComponent(url.pathname));
        if(!fs.existsSync(target)){failures.push(`${path.basename(file)}: ${href}`);continue;}
        if(url.hash && target.endsWith('.html')) {
          const targetText=fs.readFileSync(target,'utf8');
          if(!targetText.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`)) failures.push(`Missing anchor: ${file} -> ${href}`);
        }
      }
      if(!file.endsWith('trade-article.html')) assert.equal((text.match(/<h1\b/gi)||[]).length,1,file);
      assert.match(text,/<title>[^<]+<\/title>/,file);
      assert.match(text,/<meta\b(?=[^>]*name="description")(?=[^>]*content="[^"]+")[^>]*>/,file);
      assert.equal((text.match(/<link\b[^>]*rel="canonical"/g)||[]).length,1,file);
    }
    assert.deepEqual(failures,[]);
    const sitemap=fs.readFileSync(path.join(output,'sitemap.xml'),'utf8');
    for(const [,loc] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const url=new URL(loc), target=path.join(output,url.pathname==='/'?'index.html':url.pathname);
      assert.ok(fs.existsSync(target),`Sitemap target: ${loc}`);
      const canonical=fs.readFileSync(target,'utf8').match(/<link\b[^>]*rel="canonical"[^>]*>/)[0];
      assert.ok(canonical.includes(`href="${loc}"`),`Sitemap canonical: ${loc}`);
    }
    const items=JSON.parse(fs.readFileSync(path.join(output,'data/news.json'),'utf8')).items;
    for(const item of items){
      const page=fs.readFileSync(path.join(output,item.url),'utf8');
      assert.ok(page.includes('"@type":"NewsArticle"'));
      assert.ok(page.includes('content="index,follow"'));
      assert.ok(!page.includes('fetch("./data/news.json'));
    }
  } finally { fs.rmSync(root,{recursive:true,force:true}); }
});
