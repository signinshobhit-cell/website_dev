const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const { status, sync } = require('../scripts/publish-git.cjs');
test('sync pushes only published content and images, supports retry, and blocks unrelated staged work', t => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'flexlyf-git-test-'));
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const root = path.join(base, 'site'), remote = path.join(base, 'remote.git');
  fs.mkdirSync(root);
  const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  git(base, 'init', '--bare', remote); git(root, 'init', '-b', 'main');
  git(root, 'config', 'user.name', 'Newsroom test'); git(root, 'config', 'user.email', 'test@example.com');
  git(root, 'remote', 'add', 'origin', remote);
  fs.writeFileSync(path.join(root, '.gitignore'), '.local/\nnews-images/\n');
  git(root, 'add', '.gitignore'); git(root, 'commit', '-m', 'Initial');
  fs.mkdirSync(path.join(root, 'data')); fs.mkdirSync(path.join(root, 'news-images')); fs.mkdirSync(path.join(root, '.local'));
  fs.writeFileSync(path.join(root, 'data/news.json'), JSON.stringify({ items: [{ image: 'news-images/public.png' }] }));
  fs.writeFileSync(path.join(root, 'news.json'), '[]');
  fs.writeFileSync(path.join(root, 'news-images/public.png'), 'public');
  fs.writeFileSync(path.join(root, 'news-images/private.png'), 'private');
  fs.writeFileSync(path.join(root, '.local/draft.json'), 'private');
  fs.writeFileSync(path.join(root, 'unrelated.txt'), 'unrelated');
  git(root, 'add', 'data/news.json'); // Retry a previously staged news commit.
  assert.equal(status(root).ready, true); sync(root);
  const tree = git(base, '--git-dir', remote, 'ls-tree', '-r', '--name-only', 'main').split('\n');
  assert.deepEqual(tree, ['.gitignore', 'data/news.json', 'news-images/public.png', 'news.json']);
  sync(root); // A no-change retry is safe.
  git(root, 'add', 'unrelated.txt'); assert.throws(() => sync(root), /Other changes/);
  git(root, 'reset', 'unrelated.txt'); git(root, 'checkout', '-b', 'feature/test');
  assert.equal(status(root).ready, false); assert.throws(() => sync(root), /One-time setup/);
});
