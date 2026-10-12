const fs = require('node:fs');
const path = require('node:path');
function build(root, destination = path.join(root, 'dist')) {
  root = path.resolve(root); destination = path.resolve(destination);
  if (path.relative(root, destination) !== 'dist' || (fs.existsSync(destination) && fs.lstatSync(destination).isSymbolicLink())) throw new Error('Build output must be the project dist directory.');
  if (fs.existsSync(destination)) fs.rmSync(destination, { recursive: true });
  fs.mkdirSync(destination, { recursive: true });
  const copy = relative => {
    const source = path.join(root, relative), target = path.join(destination, relative);
    if (fs.lstatSync(source).isSymbolicLink()) throw new Error('Symbolic links are not supported in the public build.');
    fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(source, target);
  };
  const blocked = new Set(['news-manager.html', 'manager.js', 'manager.css']);
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.isFile() && !blocked.has(entry.name) && (/\.(html|css|js|svg|ico)$/i.test(entry.name) || ['CNAME', 'robots.txt', 'sitemap.xml', 'news.json'].includes(entry.name))) copy(entry.name);
  }
  const assetFiles = folder => {
    if (!fs.existsSync(path.join(root, folder))) return;
    for (const entry of fs.readdirSync(path.join(root, folder), { withFileTypes: true })) {
      const relative = path.join(folder, entry.name);
      if (entry.isDirectory()) assetFiles(relative);
      else if (entry.isFile() && /\.(png|jpe?g|gif|webp|svg|ico|woff2?|ttf|css|js|mp4)$/i.test(entry.name)) copy(relative);
    }
  };
  assetFiles('assets');
  const publicNews = JSON.parse(fs.readFileSync(path.join(root, 'data/news.json'), 'utf8'));
  if (!Array.isArray(publicNews.items) || publicNews.items.some(item => item.published !== true)) throw new Error('Public news must contain only published items.');
  copy('data/news.json');
  require('./build-news-pages.cjs').buildNewsPages(root, destination, publicNews.items);
  // Preserve known service URLs reported as 404 in Search Console.
  // GitHub Pages has no configurable server redirects; immediate HTML refresh
  // plus the destination canonical provide a crawler-readable redirect.
  for(const [legacy,target] of Object.entries({'product-testing':'testing.html','certification-services':'certification.html','about-us':'about.html','contact':'contact.html','licensing-support':'licensing.html','logistics-customs':'logistics.html','news-logs-desk':'trade-intelligence.html','trade-insurance':'insurance.html'})){
    if(!fs.existsSync(path.join(destination,target)))continue;
    const directory=path.join(destination,legacy);fs.mkdirSync(directory,{recursive:true});
    fs.writeFileSync(path.join(directory,'index.html'),'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=https://flexlyf.com/'+target+'"><link rel="canonical" href="https://flexlyf.com/'+target+'"><title>Service page moved | Flexlyf</title><meta name="description" content="This service page has moved to its current Flexlyf address."></head><body><h1>This service page has moved</h1><p><a href="https://flexlyf.com/'+target+'">Continue to the current service page</a></p></body></html>');
  }
  if (fs.existsSync(path.join(root, 'data/fx-rates.json'))) copy('data/fx-rates.json');
  for (const image of new Set(publicNews.items.map(item => item.image).filter(image => /^news-images\/[a-zA-Z0-9_.-]+\.(png|jpe?g|webp|gif)$/i.test(image)))) copy(image);
  fs.writeFileSync(path.join(destination, '.nojekyll'), '');
  return destination;
}
if (require.main === module) console.log(`Public site built: ${build(path.resolve(__dirname, '..'))}`);
module.exports = { build };
