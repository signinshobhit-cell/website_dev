const { spawn } = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const url = 'http://localhost:3000/news-manager.html';
async function ready() {
  try { const response = await fetch('http://localhost:3000/api/session', { signal: AbortSignal.timeout(1000) }); return response.ok; } catch { return false; }
}
function open() {
  if (process.platform === 'win32') spawn('cmd.exe', ['/c', 'start', '', url], { windowsHide: true, stdio: 'ignore' });
  console.log(`Newsroom: ${url}\nKeep this window open while working. Press Ctrl+C to stop.`);
}
(async () => {
  if (await ready()) { open(); return; }
  const child = spawn(process.execPath, ['scripts/serve.cjs'], { cwd: root, stdio: 'inherit', windowsHide: true });
  let stopped = false; child.on('exit', () => { stopped = true; });
  for (let attempt = 0; attempt < 30 && !stopped; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (await ready()) { open(); return; }
  }
  console.error('Could not start. Close an old preview using port 3000, then try again.');
})();
