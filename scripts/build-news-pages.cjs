const fs = require('node:fs');
const path = require('node:path');
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function buildNewsPages(root, destination, items) {
  const templateFile = path.join(root, 'trade-article.html');
  if (!fs.existsSync(templateFile)) return;
  const template = fs.readFileSync(templateFile, 'utf8');
  const directory = path.join(destination, 'updates');
  fs.mkdirSync(directory, { recursive: true });
  const published = items.map(item => {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(item.slug)) throw new Error('Invalid public article slug.');
    const url = `updates/${item.slug}.html`, canonical = `https://www.yuvglobal.com/${url}`;
    const body = `<div class="trade-article-meta"><span>${escape(item.categoryLabel)}</span><time datetime="${escape(item.date)}">${escape(item.date)}</time></div><h1>${escape(item.title)}</h1><p class="trade-article-summary">${escape(item.summary)}</p>${item.image ? `<img class="trade-article-image" src="${escape(item.image)}" alt="" loading="eager">` : ''}<div class="trade-article-content">${item.content.map(paragraph => `<p>${escape(paragraph)}</p>`).join('')}</div>${item.sourceUrl && /^https?:\/\//.test(item.sourceUrl) ? `<div class="trade-article-source"><strong>Source:</strong> ${escape(item.source)}<br><a href="${escape(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">Read official source ↗</a></div>` : ''}<div class="trade-article-actions"><a class="btn btn-primary" href="trade-intelligence.html">← All trade updates</a></div>`;
    const schema = {'@context':'https://schema.org','@type':'NewsArticle',headline:item.title,description:item.summary,datePublished:item.date, dateModified:item.updatedAt || item.date, mainEntityOfPage:canonical,author:{'@type':'Organization',name:'Yuvglobal',url:'https://www.yuvglobal.com/'},publisher:{'@type':'Organization',name:'Yuvglobal',url:'https://www.yuvglobal.com/'}};
    let page = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(item.title)} | Yuvglobal</title>`)
      .replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="index,follow">')
      .replace(/(<meta name="description" content=")[^"]*/, (_,prefix)=>prefix+escape(item.summary))
      .replace(/(<link rel="canonical" href=")[^"]*/, (_,prefix)=>prefix+canonical)
      .replace(/(<meta property="og:title" content=")[^"]*/, (_,prefix)=>prefix+escape(item.title))
      .replace(/(<meta property="og:description" content=")[^"]*/, (_,prefix)=>prefix+escape(item.summary))
      .replace(/(<meta property="og:url" content=")[^"]*/, (_,prefix)=>prefix+canonical)
      .replace(/<div id="articleRoot" class="trade-article-wrap"><\/div>/, `<div id="articleRoot" class="trade-article-wrap">${body}</div>`)
      .replace('href="#main-content"', `href="/${url}#main-content"`)
      .replace(/<script>\s*document.addEventListener\("DOMContentLoaded"[\s\S]*?<\/script>/, '')
      .replace('<head>', '<head><base href="../">')
      .replace('</head>', `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script></head>`);
    fs.writeFileSync(path.join(destination, url), page);
    return {...item,url};
  });
  const payload = JSON.parse(fs.readFileSync(path.join(destination, 'data/news.json'), 'utf8'));
  payload.items = published;
  fs.writeFileSync(path.join(destination, 'data/news.json'), JSON.stringify(payload,null,2)+'\n');
  fs.writeFileSync(path.join(destination, 'news.json'), JSON.stringify({news:published},null,2)+'\n');
  // Link public guides directly to their crawlable article pages. Keep the
  // query-based reader available for local previews and old bookmarks.
  const articleUrls = new Map(published.map(item => [item.slug, item.url]));
  for (const name of fs.readdirSync(destination).filter(name => name.endsWith('.html'))) {
    const file = path.join(destination, name);
    const html = fs.readFileSync(file, 'utf8').replace(/\bhref=(["'])(?:\.\/|\/)?trade-article\.html\?slug=([^"'&#]+)\1/g,
      (match, quote, encodedSlug) => {
        let slug;
        try { slug = decodeURIComponent(encodedSlug); } catch { return match; }
        return articleUrls.has(slug) ? `href=${quote}${escape(articleUrls.get(slug))}${quote}` : match;
      });
    fs.writeFileSync(file, html);
  }
  const archiveFile = path.join(destination, 'trade-intelligence.html');
  if(fs.existsSync(archiveFile)) {
    const links = published.map(item=>`<li><a href="${escape(item.url)}">${escape(item.title)}</a></li>`).join('');
    fs.writeFileSync(archiveFile,fs.readFileSync(archiveFile,'utf8').replace('</main>',`<noscript><div class="container"><h2>Published updates</h2><ul>${links}</ul></div></noscript></main>`));
  }
  const sitemapFile=path.join(destination,'sitemap.xml');
  if(fs.existsSync(sitemapFile)) fs.writeFileSync(sitemapFile,fs.readFileSync(sitemapFile,'utf8').replace('</urlset>',published.map(item=>`<url><loc>https://www.yuvglobal.com/${escape(item.url)}</loc></url>\n`).join('')+'</urlset>'));
}
module.exports = {buildNewsPages};
