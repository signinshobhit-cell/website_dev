const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
function gitExecutable() {
  if (process.env.GIT_EXECUTABLE) return process.env.GIT_EXECUTABLE;
  try { execFileSync('git', ['--version'], { windowsHide: true, stdio: 'ignore' }); return 'git'; } catch {}
  if (process.platform === 'win32') {
    const candidates = [
      path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Git', 'cmd', 'git.exe'),
      path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'Programs', 'Git', 'cmd', 'git.exe'),
      path.join(os.homedir(), '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'native', 'git', 'cmd', 'git.exe')
    ];
    for (const candidate of candidates) if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error('Git was not found. Install Git for Windows, restart the newsroom, or set GIT_EXECUTABLE to your git.exe path.');
}
const run = (root, args) => execFileSync(gitExecutable(), args, { cwd: root, encoding: 'utf8', timeout: 60000, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] }).trim();
function status(root) {
  try {
    const branch = run(root, ['branch', '--show-current']);
    return { branch, ready: branch === 'main', message: branch === 'main' ? 'Ready to sync published news to GitHub.' : `One-time setup: merge ${branch} into main before syncing the live website.` };
  } catch (error) { return { ready: false, message: error.stderr?.toString().trim() || error.message }; }
}
function sync(root) {
  const info = status(root); if (!info.ready) throw new Error(info.message);
  const news = JSON.parse(fs.readFileSync(path.join(root, 'data/news.json'), 'utf8'));
  const images = [...new Set(news.items.map(item => item.image).filter(image => /^news-images\/[a-zA-Z0-9_.-]+\.(png|jpe?g|webp|gif)$/i.test(image)))];
  const allowed = new Set(['data/news.json', 'news.json', ...images]);
  const staged = run(root, ['diff', '--cached', '--name-only']).split('\n').filter(Boolean);
  if (staged.some(file => !allowed.has(file))) throw new Error('Other changes are staged in Git. Commit or unstage them before syncing news.');
  run(root, ['add', '--', 'data/news.json', 'news.json']);
  for (const image of images) run(root, ['add', '-f', '--', image]);
  if (run(root, ['diff', '--cached', '--name-only'])) run(root, ['commit', '-m', 'Publish news updates']);
  run(root, ['push', 'origin', 'main']);
  return 'Published news was pushed to GitHub. Check the Pages deployment in GitHub Actions.';
}
module.exports = { status, sync };
