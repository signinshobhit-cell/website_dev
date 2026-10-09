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
  if (fs.existsSync(path.join(root, 'data/fx-rates.json'))) copy('data/fx-rates.json');
  for (const image of new Set(publicNews.items.map(item => item.image).filter(image => /^news-images\/[a-zA-Z0-9_.-]+\.(png|jpe?g|webp|gif)$/i.test(image)))) copy(image);
  fs.writeFileSync(path.join(destination, '.nojekyll'), '');
  return destination;
}
if (require.main === module) console.log(`Public site built: ${build(path.resolve(__dirname, '..'))}`);
module.exports = { build };
