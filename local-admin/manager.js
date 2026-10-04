(function () {
  'use strict';
  const $ = id => document.getElementById(id), esc = NewsView.esc;
  const fields = ['title', 'category', 'date', 'summary', 'takeaways', 'content', 'source', 'sourceUrl', 'image'];
  let session, records = [], selected = null, dirty = false, generation = 0, timer, pending, busy = false, conflicted = false;
  const current = () => records.find(record => record.id === selected);
  const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  function notify(message, error = false) { $('notice').textContent = message; $('notice').classList.toggle('error', error); }
  async function request(url, body, method = 'POST') {
    const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'X-News-Token': session.token }, body: JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) { const error = new Error(result.error || 'The request failed.'); error.status = response.status; throw error; }
    return result;
  }
  function collect() {
    const draft = Object.fromEntries(fields.map(key => [key, $(key).value]));
    draft.content = draft.content.split(/\n\s*\n/).map(value => value.trim()).filter(Boolean);
    draft.takeaways = draft.takeaways.split('\n').map(value => value.trim()).filter(Boolean).slice(0, 3);
    return draft;
  }
  function counts() {
    $('summaryCount').textContent = `${$('summary').value.length} / 600 characters · Appears on cards and in the popup.`;
    $('wordCount').textContent = `${$('content').value.trim().split(/\s+/).filter(Boolean).length} words · Separate paragraphs with a blank line.`;
    const image = NewsView.safeUrl($('image').value);
    $('imagePreview').hidden = !image; if (image) $('imagePreview').src = image; else $('imagePreview').removeAttribute('src');
  }
  function renderLibrary() {
    const query = $('librarySearch').value.trim().toLowerCase(), filter = $('libraryStatus').value;
    const visible = records.filter(record => {
      const matchesStatus = filter === 'trash' ? Boolean(record.trashedAt) : filter === 'archived' ? Boolean(record.archivedAt && !record.trashedAt) : !record.trashedAt && !record.archivedAt && (filter === 'all' || (filter === 'draft' && !record.live) || (filter === 'published' && record.live) || (filter === 'changes' && record.hasChanges));
      return matchesStatus && [record.draft.title, record.draft.summary, record.draft.categoryLabel].join(' ').toLowerCase().includes(query);
    }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    $('libraryCount').textContent = visible.length;
    $('articleList').innerHTML = visible.length ? visible.map(record => `<button type="button" class="library-card" data-id="${esc(record.id)}" aria-current="${record.id === selected}"><span class="badge ${record.live && !record.archivedAt ? record.hasChanges ? 'changes' : 'published' : ''}">${record.trashedAt ? 'Trash' : record.archivedAt ? 'Archived' : record.live ? record.hasChanges ? 'Unpublished changes' : 'Published' : 'Draft'}</span><strong>${esc(record.draft.title || 'Untitled update')}</strong><small>${esc(record.draft.categoryLabel)} · ${esc(record.draft.date || 'No date')}</small></button>`).join('') : '<p class="muted">No articles here. Try another filter or create an update.</p>';
  }
  function updateRecord(record) { const index = records.findIndex(item => item.id === record.id); if (index < 0) records.unshift(record); else records[index] = record; renderLibrary(); meta(); }
  function meta() {
    const record = current(); if (!record) return;
    $('date').max = today();
    const inactive = Boolean(record.trashedAt || record.archivedAt);
    $('articleBadge').textContent = record.trashedAt ? 'In trash' : record.archivedAt ? 'Archived' : record.live ? dirty || record.hasChanges ? 'Unpublished changes' : 'Published' : 'Draft';
    $('articleBadge').className = `badge ${record.live && !inactive ? dirty || record.hasChanges ? 'changes' : 'published' : ''}`;
    $('publishButton').textContent = record.live ? 'Publish changes' : 'Publish update';
    $('publishButton').disabled = busy || inactive || conflicted;
    $('saveButton').disabled = busy || inactive || conflicted;
    $('previewButton').disabled = busy || Boolean(record.trashedAt);
    $('editorFields').disabled = inactive || busy;
    $('discardButton').hidden = inactive || !record.live || (!record.hasChanges && !dirty);
    $('unpublishButton').hidden = !record.live || inactive;
    $('archiveButton').hidden = !record.live || inactive;
    $('unarchiveButton').hidden = !record.archivedAt || Boolean(record.trashedAt);
    $('trashButton').hidden = Boolean(record.trashedAt);
    $('restoreButton').hidden = !record.trashedAt;
    $('duplicateButton').hidden = Boolean(record.trashedAt);
    $('articleSlug').textContent = `trade-article.html?slug=${record.slug}`;
    $('openArticle').hidden = !record.live || inactive; $('openArticle').href = `/trade-article.html?slug=${encodeURIComponent(record.slug)}`;
    for (const id of ['archiveButton', 'unarchiveButton', 'trashButton', 'restoreButton', 'deleteButton', 'unpublishButton', 'discardButton', 'duplicateButton']) $(id).disabled = busy || conflicted;
    $('historyList').hidden = inactive;
    $('historyList').innerHTML = record.history.length ? record.history.slice(0, 8).map(version => `<button type="button" data-version="${version.revision}">Restore v${version.revision} · ${esc(new Date(version.savedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Kolkata' }))}</button>`).join('') : '<p class="hint">Saved versions will appear here as you work.</p>';
  }
  function populate(record) {
    selected = record.id; localStorage.setItem('flexlyf-selected-article', selected); dirty = false; conflicted = false;
    fields.forEach(key => { $(key).value = Array.isArray(record.draft[key]) ? record.draft[key].join(key === 'content' ? '\n\n' : '\n') : record.draft[key] || ''; });
    $('emptyEditor').hidden = true; $('editorPanel').hidden = false; $('saveStatus').textContent = 'Saved on this computer';
    counts(); renderLibrary(); meta();
  }
  async function save() {
    clearTimeout(timer);
    if (pending) { const okay = await pending; if (!okay) return false; if (dirty && !conflicted) return save(); return !dirty; }
    if (!dirty || !current()) return true;
    if (conflicted) return false;
    const record = current(), stamp = generation, draft = collect(); $('saveStatus').textContent = 'Saving…';
    pending = request(`/api/articles/${encodeURIComponent(record.id)}`, { revision: record.revision, draft }, 'PUT').then(result => {
      if (generation === stamp) dirty = false;
      updateRecord(result.record); $('saveStatus').textContent = dirty ? 'Unsaved changes' : 'Saved on this computer';
      notify(result.record.live ? 'Draft saved. Publish changes when you are ready to update the website.' : 'Draft saved privately on this computer.');
      return true;
    }).catch(error => { conflicted = error.status === 409; $('saveStatus').textContent = 'Not saved'; notify(error.message || 'Cannot connect. Keep this page open; your text is still in the editor.', true); meta(); return false; });
    const okay = await pending; pending = null; if (okay && dirty && !conflicted) return save(); return okay;
  }
  async function confirm(title, text, action = 'Confirm') {
    $('confirmTitle').textContent = title; $('confirmText').textContent = text; $('confirmAction').textContent = action;
    const dialog = $('confirmDialog'); dialog.returnValue = ''; dialog.showModal();
    return new Promise(resolve => dialog.addEventListener('close', () => resolve(dialog.returnValue === 'confirm'), { once: true }));
  }
  async function select(id) { if (!await save()) return; const record = records.find(item => item.id === id); if (record) populate(record); }
  async function create(input = {}) {
    if (busy || !await save()) return;
    busy = true; meta();
    try { const { record } = await request('/api/articles', input); updateRecord(record); $('libraryStatus').value = 'all'; $('librarySearch').value = ''; populate(record); notify('New draft created. Your changes save automatically.'); $('title').focus(); }
    catch (error) { notify(error.message, true); } finally { busy = false; meta(); $('title').focus(); }
  }
  async function action(name, title, text, extra = {}) {
    if (busy || !current() || !await save()) return;
    if (!await confirm(title, text, title)) return;
    busy = true; meta();
    try {
      const { record } = await request(`/api/articles/${encodeURIComponent(selected)}/${name}`, { revision: current().revision, ...extra });
      if (record.deleted) {
        records = records.filter(item => item.id !== record.id); selected = null; dirty = false; conflicted = false;
        localStorage.removeItem('flexlyf-selected-article'); $('editorPanel').hidden = true; $('emptyEditor').hidden = false;
        renderLibrary(); $('newArticle').focus();
      } else { updateRecord(record); populate(record); }
      const messages = { publish: 'Published to your local website. Sync to GitHub to update the live site.', unpublish: 'Removed from the local website. Your editable draft is saved.', archive: 'Archived privately and removed from local public pages. Sync to GitHub to update the live site.', unarchive: 'Published version restored to local public pages. Sync to GitHub to update the live site.', delete: 'Article deleted from the newsroom and local public pages. Sync to GitHub to update the live site.', trash: 'Moved to Trash and removed from the local website. You can restore it as a draft.', restore: 'Restored as a private draft.', discard: 'Draft restored to the published version.', revert: 'Previous version restored as a draft. Publish when ready.' };
      notify(messages[name]);
    } catch (error) { notify(error.message, true); } finally { busy = false; meta(); }
  }
  $('articleForm').addEventListener('submit', event => event.preventDefault());
  $('articleForm').addEventListener('input', event => {
    if (!fields.includes(event.target.id)) return;
    dirty = true; generation++; counts(); meta(); $('saveStatus').textContent = 'Unsaved changes';
    clearTimeout(timer); timer = setTimeout(save, 900);
  });
  $('articleList').addEventListener('click', event => { const item = event.target.closest('[data-id]'); if (item && !busy) select(item.dataset.id); });
  $('librarySearch').addEventListener('input', renderLibrary); $('libraryStatus').addEventListener('change', renderLibrary);
  $('newArticle').addEventListener('click', () => create()); $('saveButton').addEventListener('click', save);
  $('publishButton').addEventListener('click', () => { if ($('articleForm').reportValidity()) action('publish', current().live ? 'Publish changes' : 'Publish update', 'This will update the local website immediately. Use Sync website to GitHub when you want these changes on the live site.'); });
  $('previewButton').addEventListener('click', async event => { if (await save()) NewsView.open({ ...current().draft, title: current().draft.title || 'Untitled update', slug: current().slug }, event.target, { preview: true }); });
  $('duplicateButton').addEventListener('click', () => create({ ...collect(), title: `${$('title').value} (copy)`, date: today() }));
  $('unpublishButton').addEventListener('click', () => action('unpublish', 'Unpublish update', 'Remove this article from the local public pages and keep it as a private draft? Sync to GitHub to remove it from the live site too.'));
  $('archiveButton').addEventListener('click', () => action('archive', 'Archive update', 'Remove this article from local public pages and keep its published version, draft and history in Archived? Sync to GitHub to remove it from the live site.'));
  $('unarchiveButton').addEventListener('click', () => action('unarchive', 'Restore published update', 'Make the saved published version visible on local public pages again? Draft changes stay private. Sync to GitHub to restore it on the live site.'));
  $('deleteButton').addEventListener('click', () => action('delete', 'Delete permanently', `Delete “${current().draft.title || 'Untitled update'}” and its revision history from the newsroom? This cannot be undone here. Automatic workspace backups may retain earlier copies. Sync to GitHub to remove the article from the live site.`));
  $('trashButton').addEventListener('click', () => action('trash', 'Move to trash', 'This removes the article from the local website. You can recover its draft from the Trash filter.'));
  $('restoreButton').addEventListener('click', () => action('restore', 'Restore draft', 'Restore this article to your private drafts?'));
  $('discardButton').addEventListener('click', () => action('discard', 'Discard draft changes', 'Replace the working draft with the currently published version? A saved version remains in history.'));
  $('historyList').addEventListener('click', event => { const button = event.target.closest('[data-version]'); if (button) action('revert', 'Restore saved version', 'Load this saved version into the draft? The published article stays unchanged.', { draft: { revision: Number(button.dataset.version) } }); });
  $('imageFile').addEventListener('change', async event => {
    const file = event.target.files[0]; if (!file || !current()) return;
    const articleId = selected;
    if (file.size > 5 * 1024 * 1024) { notify('Choose an image smaller than 5 MB.', true); return; }
    try {
      const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(',')[1]); reader.onerror = reject; reader.readAsDataURL(file); });
      const result = await request('/api/images', { data });
      if (selected !== articleId) { notify('The image was uploaded. Select the original article and upload again to attach it.'); return; }
      $('image').value = result.image; $('image').dispatchEvent(new Event('input', { bubbles: true })); notify('Image uploaded. Your draft is saving.');
    } catch (error) { notify(error.message || 'The image could not be uploaded.', true); } finally { event.target.value = ''; }
  });
  $('removeImage').addEventListener('click', () => { $('image').value = ''; $('image').dispatchEvent(new Event('input', { bubbles: true })); });
  $('importButton').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', async event => {
    const file = event.target.files[0]; if (!file || !await save()) return;
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('Choose a JSON file smaller than 5 MB.');
      const payload = JSON.parse(await file.text());
      if (!await confirm('Import as drafts', 'Imported articles will be added as new private drafts. Existing articles will not be replaced.', 'Import drafts')) return;
      const result = await request('/api/import', payload); records = result.records; renderLibrary(); notify(`${result.count} articles imported as private drafts.`);
    } catch (error) { notify(error.message, true); } finally { event.target.value = ''; }
  });
  $('syncButton').addEventListener('click', async () => {
    if (!await save() || !await confirm('Sync website to GitHub', 'Push all locally published news changes to the main branch? GitHub Pages will then deploy the update.', 'Sync website')) return;
    $('syncButton').disabled = true; notify('Syncing published news to GitHub…');
    try { const result = await request('/api/sync', {}); notify(result.message); } catch (error) { notify(`Sync failed. Your local work is safe. ${error.message}`, true); } finally { $('syncButton').disabled = !session.git.ready; }
  });
  $('reloadButton').addEventListener('click', async () => { if ((dirty || pending) && !await confirm('Reload workspace', 'Unsaved text in this editor will be replaced with the saved version. Copy any text you need first.', 'Reload')) return; clearTimeout(timer); location.reload(); });
  window.addEventListener('beforeunload', event => { if (dirty || pending) { event.preventDefault(); event.returnValue = ''; } });
  document.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); save(); } });
  async function init() {
    try {
      const response = await fetch('/api/session', { cache: 'no-store' }); if (!response.ok) throw new Error('Could not open the local workspace.');
      session = await response.json(); records = session.records;
      $('category').innerHTML = Object.entries(session.categories).map(([value, label]) => `<option value="${value}">${esc(label)}</option>`).join('');
      $('date').max = session.today; $('gitStatus').textContent = session.git.message; $('syncButton').disabled = !session.git.ready;
      renderLibrary(); const last = records.find(record => record.id === localStorage.getItem('flexlyf-selected-article') && !record.trashedAt && !record.archivedAt); if (last) populate(last);
      notify('Ready. Drafts save automatically on this computer.');
    } catch (error) { $('newArticle').disabled = true; notify('Start the local workspace with npm start, then open http://localhost:3000/news-manager.html. If it is already running, restart it and reload this page.', true); }
  }
  init();
})();
