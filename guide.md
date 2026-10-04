# Flexlyf Newsroom — daily publishing guide

## Start here

Double-click **Start Newsroom.cmd** in this project folder. Keep its console open while working. It opens <http://localhost:3000/news-manager.html>. Alternatively, run `npm start` from this folder and open that address yourself. Node.js 18 or newer and Git are required; the launcher also finds the bundled Codex Node runtime on this computer.

The editor runs privately on this computer. Your public website remains a static GitHub Pages site. There is no hosted CMS, Supabase account, or production application server to maintain. Anyone with access to your computer can access its local editor while it is running.

## Daily routine

1. Click **+ New update**. Today's date uses India time.
2. Write the headline, select a category, add a short **In a nutshell** summary and the **Full update**. Separate paragraphs with a blank line. Add up to three takeaways, one per line.
3. Open **Source & cover image** to credit the original source, link to it, and optionally upload a cover. Supported images: PNG, JPG, WebP and GIF, up to 5 MB. An HTTPS image link also works.
4. Wait for **Saved on this computer**. Drafts save automatically after you stop typing; **Save draft** or Ctrl/Cmd+S saves immediately.
5. Click **Preview** to review the bite-sized popup and full draft text. Check spelling, facts, dates and source links.
6. Click **Publish update** and confirm. This updates the local public website immediately. Review it using **Open published update** or **View website**.
7. After the one-time GitHub setup below, click **Sync website to GitHub** and confirm. This commits published news and its uploaded images, then pushes them to `main`. Wait for the GitHub Pages deployment to succeed in the repository's **Actions** tab before checking the live website.

Saving a draft does not publish it. Publishing locally does not update the live site until you sync. Keep your working copy on `main` for daily live publishing.

## Improve an existing update

Search the news library, select the article, and edit it normally. Its published version remains visible while you work; the library displays **Unpublished changes**. Click **Publish changes** when ready, then sync.

Keep its original publication date when correcting older news. The article link stays the same after its first publication, even when you change the headline. For a genuinely new development, use **Duplicate as draft**, which creates an independent article dated today, or create a new update.

**Discard unpublished changes** resets the draft to the current published version. **Recent saved versions** lets you restore an earlier saved revision as a draft without changing the public article. Up to 20 revisions are retained per article.

## Organize, remove and recover

The status filter shows active articles, drafts, published articles, unpublished changes, Archived or Trash. Search matches the headline, summary and category.

**Archive update** removes a published article from local public pages and retains its published version, working draft, stable URL and revision history privately. Find it using **Archived**, then select **Restore published update** to make the saved published version public again. Any unpublished draft changes stay private. Archived articles must be restored before editing. Archive in the newsroom is separate from the public news archive, which lists all currently published articles.

**Delete permanently** removes an article and its revision history from the newsroom and local public pages after confirmation. It works for published articles, drafts, archived articles and Trash. There is no undo in the editor. Automatic workspace backups may still contain earlier copies; uploaded image files are retained to avoid removing an image another article uses. Use Archive or Trash when you may need the article again.

**Unpublish** removes an article from local public pages but keeps its draft. **Move to trash** removes it from those pages and moves it out of the active library. Select **Trash** and use **Restore as draft** to recover it privately. Publish it again if you want it public. Sync to propagate removals or republication to the live website.

Archive, delete and restore update your local website immediately. **Sync website to GitHub** is required to apply those changes to the live website.

Older published articles remain in the public archive. It shows nine articles per page, newest first, with keyword, category and inclusive date filters. The home carousel displays the six latest published articles; **New** applies to today and the preceding six calendar days in India time.

## Backups and importing

**Export backup** downloads the working draft content of all articles outside Trash, including archived articles, as JSON. **Import JSON** adds the file's articles as new private drafts; it does not replace existing articles or publish imported entries. Review each imported draft before publishing. Duplicate imports create additional drafts.

That download is a content backup. It does not preserve article identities, published snapshots, revision history or image files. For a complete backup, stop the newsroom and copy both `.local` and `news-images` to a safe location. Restore those folders with the newsroom stopped.

The authoritative workspace is `.local/news-workspace.json`. Up to 50 automatic workspace snapshots are kept in `.local/backups`. For advanced recovery, stop the newsroom, preserve the current workspace file, then copy the desired valid snapshot over `news-workspace.json` and restart. Restarting rebuilds local public news from the restored published snapshots; review before syncing.

Do not edit `data/news.json` or `news.json` by hand after initializing the newsroom: the private workspace controls them. Drafts, backups and unpublished image uploads are ignored by Git. The deployment builds `dist` from an explicit public-file list and excludes the local editor and its APIs.

## One-time GitHub setup

The approved implementation has been merged into local `main`. Live sync is disabled whenever you use a development branch.

1. Push the approved `main` branch to the existing GitHub repository. The implementation includes `.github/workflows/pages.yml` and the scripts/tests it uses.
2. In the repository, open **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**. The workflow builds only the public site and deploys its `dist` folder. See [GitHub's Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
3. Ensure Git on this computer can commit and push to `origin`. Configure your Git name/email if needed and authenticate using your usual GitHub credential manager. Do not put passwords or tokens in site files.
4. Use the local checkout of `main` and restart the newsroom. Its GitHub sync button becomes available. Confirm the first Pages workflow succeeds and that your existing custom domain, if any, remains configured correctly.

Daily sync includes only the public news JSON files and images referenced by published news. It refuses to commit unrelated staged changes. Code changes require the usual Git review/commit workflow.

## When something goes wrong

- **Not saved / connection error:** keep the editor open, copy important unsaved text, restart the local server if needed and try saving again.
- **Newer revision / conflict:** another editor saved first. Copy your unsaved text, reload the library, then apply it to the latest version. The system refuses silent overwrites.
- **Publication refused:** complete the headline, summary, full text and date. Future dates are unsupported; there is no scheduled publication in this pass. Source links must use HTTP/HTTPS.
- **Sync failed:** local work remains saved. Fix Git identity, authentication or connection and retry. A successful push still requires a successful Pages workflow to appear online.
- **Other changes staged:** commit or unstage unrelated development changes before syncing news.
- **Port already used:** close the older preview server and restart the launcher. Reopening the launcher reuses an already running compatible newsroom.
- **Invalid workspace at startup:** preserve the file and recover a valid automatic snapshot as described above. The server fails rather than erasing saved content.

## News sourcing

This pass supports manual writing and JSON import. It does not scrape or automatically publish daily news. Collect information from reliable original sources, verify it, write a short attributed summary, and review before publishing. A future collection workflow can feed private drafts into the same editor for human review.

Starter entries and temporary validation articles have been removed. Your own MIP article has been preserved. Obsolete PHP CMS files, outdated setup instructions, the superseded news loader and test upload fixtures are stored in the ignored `junk_` folder. That folder is excluded from deployment and cannot be accessed through the local preview server. Current application code, tests and operational documentation remain in the project.
