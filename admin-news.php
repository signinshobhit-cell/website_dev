<?php
declare(strict_types=1);

session_start();
$config = require __DIR__ . '/config.php';
$dataFile = $config['data_file'];
$uploadDir = $config['upload_dir'];
$uploadPrefix = $config['upload_url_prefix'];

if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0755, true);
}

function h(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function loadNews(string $file): array {
    if (!is_file($file)) return [];
    $raw = file_get_contents($file);
    $decoded = json_decode($raw ?: '', true);
    if (is_array($decoded) && isset($decoded['news']) && is_array($decoded['news'])) return $decoded['news'];
    if (is_array($decoded)) return $decoded;
    return [];
}

function saveNews(string $file, array $items): bool {
    $payload = json_encode(['news' => array_values($items)], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    $tmp = $file . '.tmp';
    if (file_put_contents($tmp, $payload, LOCK_EX) === false) return false;
    return rename($tmp, $file);
}

function slugify(string $text): string {
    $text = trim(mb_strtolower($text));
    $text = preg_replace('/[^a-z0-9]+/u', '-', $text) ?? '';
    return trim($text, '-') ?: 'trade-update';
}

function csrf_token(): string {
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(24));
    return $_SESSION['csrf'];
}

function requireCsrf(): void {
    if (!hash_equals($_SESSION['csrf'] ?? '', $_POST['csrf'] ?? '')) {
        http_response_code(400);
        exit('Invalid request token. Please refresh and try again.');
    }
}

if (isset($_GET['logout'])) {
    $_SESSION = [];
    session_destroy();
    header('Location: admin-news.php');
    exit;
}

$loginError = '';
if (isset($_POST['login'])) {
    $password = (string)($_POST['password'] ?? '');
    if (password_verify($password, $config['admin_password_hash'])) {
        $_SESSION['admin'] = true;
        $_SESSION['csrf'] = bin2hex(random_bytes(24));
        header('Location: admin-news.php');
        exit;
    }
    $loginError = 'Invalid password.';
}

if (empty($_SESSION['admin'])):
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Flexlyf Trade Intelligence — Admin Login</title>
<link rel="stylesheet" href="styles.css">
<style>
body{background:#f6f8f5}.admin-shell{max-width:460px;margin:10vh auto;padding:28px}.admin-card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:30px;box-shadow:0 20px 60px rgba(2,44,34,.10)}.admin-card h1{color:#064e3b;margin:0 0 8px}.admin-card p{color:#52605b}.admin-input{width:100%;padding:13px 14px;border:1px solid #cfd8d3;border-radius:10px;box-sizing:border-box;margin:10px 0 16px}.admin-btn{width:100%;padding:13px 16px;border:0;border-radius:10px;background:#064e3b;color:#fff;font-weight:800;cursor:pointer}.error{padding:10px 12px;border-radius:8px;background:#fff1f2;color:#991b1b;margin-bottom:14px}
</style>
</head>
<body>
<main class="admin-shell"><div class="admin-card">
<h1>Trade Intelligence Admin</h1><p>Sign in to publish and manage news.</p>
<?php if ($loginError): ?><div class="error"><?=h($loginError)?></div><?php endif; ?>
<form method="post">
<label for="password"><strong>Admin Password</strong></label>
<input class="admin-input" id="password" name="password" type="password" required autocomplete="current-password">
<button class="admin-btn" name="login" value="1">Sign In</button>
</form>
</div></main>
</body>
</html>
<?php
exit;
endif;

$news = loadNews($dataFile);
$message = '';
$editing = null;

if (isset($_GET['edit'])) {
    $id = (int)$_GET['edit'];
    foreach ($news as $item) if ((int)($item['id'] ?? 0) === $id) $editing = $item;
}

if (isset($_POST['action'])) {
    requireCsrf();
    $action = (string)$_POST['action'];

    if ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        $news = array_values(array_filter($news, fn($item) => (int)($item['id'] ?? 0) !== $id));
        if (saveNews($dataFile, $news)) $message = 'Article deleted.';
    } elseif ($action === 'save') {
        $id = (int)($_POST['id'] ?? 0);
        $title = trim((string)($_POST['title'] ?? ''));
        if ($title === '') exit('Title is required.');

        $slug = slugify((string)($_POST['slug'] ?? $title));
        $categoryKey = slugify((string)($_POST['category_key'] ?? 'other'));
        $categoryLabel = trim((string)($_POST['category_label'] ?? 'Trade Update'));
        $date = trim((string)($_POST['date'] ?? ''));
        $summary = trim((string)($_POST['summary'] ?? ''));
        $source = trim((string)($_POST['source'] ?? ''));
        $sourceUrl = trim((string)($_POST['source_url'] ?? ''));
        $image = trim((string)($_POST['image'] ?? ''));
        $content = trim((string)($_POST['content'] ?? ''));
        $ctaLabel = trim((string)($_POST['cta_label'] ?? 'Read More'));
        $ctaLink = trim((string)($_POST['cta_link'] ?? ''));
        $featured = isset($_POST['featured']);
        $published = isset($_POST['published']);

        // Optional image upload.
        if (!empty($_FILES['image_file']['name']) && is_uploaded_file($_FILES['image_file']['tmp_name'])) {
            if ((int)$_FILES['image_file']['size'] > 5 * 1024 * 1024) exit('Image is larger than 5 MB.');
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime = finfo_file($finfo, $_FILES['image_file']['tmp_name']) ?: '';
            finfo_close($finfo);
            $allowed = ['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp'];
            if (!isset($allowed[$mime])) exit('Only JPG, PNG or WEBP images are allowed.');
            $filename = bin2hex(random_bytes(12)) . '.' . $allowed[$mime];
            if (!move_uploaded_file($_FILES['image_file']['tmp_name'], $uploadDir . '/' . $filename)) exit('Could not save uploaded image.');
            $image = $uploadPrefix . $filename;
        }

        $record = [
            'id' => $id > 0 ? $id : (max(array_map(fn($x)=>(int)($x['id'] ?? 0), $news), default: 0) + 1),
            'slug' => $slug,
            'title' => $title,
            'category_key' => $categoryKey,
            'category_label' => $categoryLabel ?: 'Trade Update',
            'date' => $date,
            'summary' => $summary,
            'source' => $source,
            'source_url' => $sourceUrl,
            'image' => $image,
            'featured' => $featured,
            'published' => $published,
            'content' => $content,
            'cta_label' => $ctaLabel ?: 'Read More',
            'cta_link' => $ctaLink,
        ];

        $updated = false;
        foreach ($news as $i => $item) {
            if ((int)($item['id'] ?? 0) === (int)$record['id']) {
                $news[$i] = $record;
                $updated = true;
                break;
            }
        }
        if (!$updated) $news[] = $record;

        if (saveNews($dataFile, $news)) {
            $message = $updated ? 'Article updated.' : 'Article published.';
            $editing = $record;
        } else {
            $message = 'Could not save the article. Check write permissions on data/news.json.';
        }
    }
}

// Reload after mutations.
$news = loadNews($dataFile);
usort($news, fn($a,$b) => strcmp((string)($b['date'] ?? ''), (string)($a['date'] ?? '')) ?: ((int)($b['id'] ?? 0) <=> (int)($a['id'] ?? 0)));

function val(?array $row, string $key, string $fallback=''): string { return h((string)($row[$key] ?? $fallback)); }
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Flexlyf Trade Intelligence — Admin</title>
<link rel="stylesheet" href="styles.css">
<style>
body{background:#f6f8f5}.admin-wrap{max-width:1240px;margin:110px auto 60px;padding:0 20px}.admin-head{display:flex;justify-content:space-between;gap:20px;align-items:center;margin-bottom:22px}.admin-head h1{margin:0;color:#064e3b}.admin-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(320px,.75fr);gap:24px}.admin-card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:24px;box-shadow:0 12px 36px rgba(2,44,34,.06)}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.field{display:flex;flex-direction:column;gap:7px}.field.full{grid-column:1/-1}.field label{font-weight:800;color:#16352d}.field input,.field textarea,.field select{width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #cfd8d3;border-radius:9px;font:inherit}.field textarea{min-height:110px;resize:vertical}.field small{color:#6b7280}.admin-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:18px}.btn-admin{display:inline-flex;align-items:center;justify-content:center;padding:11px 15px;border-radius:9px;font-weight:800;border:1px solid transparent;text-decoration:none;cursor:pointer}.btn-save{background:#064e3b;color:#fff}.btn-new{background:#dff7d2;color:#1c5310}.btn-secondary{background:#fff;border-color:#cfd8d3;color:#16352d}.notice{background:#ecfdf5;border:1px solid #bbf7d0;color:#166534;padding:11px 14px;border-radius:9px;margin-bottom:18px}.table-wrap{overflow:auto}.news-table{width:100%;border-collapse:collapse}.news-table th,.news-table td{padding:12px 10px;border-bottom:1px solid #eef1ef;text-align:left;vertical-align:top}.status{font-size:.78rem;font-weight:800;padding:4px 8px;border-radius:999px;display:inline-block}.published{background:#dcfce7;color:#166534}.draft{background:#f3f4f6;color:#4b5563}.row-actions{display:flex;gap:7px;flex-wrap:wrap}.row-actions a,.row-actions button{font-size:.78rem;padding:7px 9px;border-radius:7px;border:1px solid #d9e0dc;background:#fff;text-decoration:none;color:#064e3b;cursor:pointer}.danger{color:#991b1b!important}.check-row{display:flex;gap:20px;align-items:center;flex-wrap:wrap}.muted{color:#6b7280;font-size:.86rem}.topbar-link{color:#fff;text-decoration:none;font-weight:700}.admin-nav{position:fixed;left:0;right:0;top:0;z-index:1000;background:#064e3b;color:#fff;padding:14px 20px}.admin-nav-inner{max-width:1240px;margin:auto;display:flex;justify-content:space-between;align-items:center}.admin-nav a{color:#fff}.count{font-weight:800;color:#064e3b}.help{background:#f0fdf4;border:1px solid #d1fae5;padding:14px;border-radius:10px;line-height:1.6}.help code{background:#dcfce7;padding:2px 5px;border-radius:4px}@media(max-width:900px){.admin-grid{grid-template-columns:1fr}.form-grid{grid-template-columns:1fr}.admin-head{align-items:flex-start;flex-direction:column}.admin-wrap{margin-top:100px}}
</style>
</head>
<body>
<nav class="admin-nav"><div class="admin-nav-inner"><strong>Flexlyf Trade Intelligence CMS</strong><div><a class="topbar-link" href="trade-intelligence.html" target="_blank">View Page</a> &nbsp; | &nbsp; <a class="topbar-link" href="admin-news.php?logout=1">Logout</a></div></div></nav>
<main class="admin-wrap">
<div class="admin-head"><div><h1>News Manager</h1><div class="muted">Add, edit, publish, unpublish and delete Trade Intelligence updates.</div></div><a class="btn-admin btn-new" href="admin-news.php">+ New Article</a></div>
<?php if ($message): ?><div class="notice"><?=h($message)?></div><?php endif; ?>
<div class="admin-grid">
<section class="admin-card">
<h2><?= $editing ? 'Edit Article' : 'New Article' ?></h2>
<form method="post" enctype="multipart/form-data">
<input type="hidden" name="csrf" value="<?=h(csrf_token())?>">
<input type="hidden" name="action" value="save">
<input type="hidden" name="id" value="<?=val($editing,'id','0')?>">
<div class="form-grid">
<div class="field full"><label for="title">Headline *</label><input id="title" name="title" value="<?=val($editing,'title')?>" required></div>
<div class="field"><label for="slug">URL Slug</label><input id="slug" name="slug" value="<?=val($editing,'slug')?>"><small>Leave empty to generate from headline.</small></div>
<div class="field"><label for="date">Publish Date</label><input id="date" name="date" type="date" value="<?=val($editing,'date')?>"></div>
<div class="field"><label for="category_label">Category Name *</label><input id="category_label" name="category_label" value="<?=val($editing,'category_label')?>" placeholder="e.g. DGFT & FTP" required></div>
<div class="field"><label for="category_key">Category Key</label><input id="category_key" name="category_key" value="<?=val($editing,'category_key')?>" placeholder="e.g. dgft"></div>
<div class="field full"><label for="summary">Short Summary *</label><textarea id="summary" name="summary" required><?=val($editing,'summary')?></textarea></div>
<div class="field"><label for="source">Source / Authority</label><input id="source" name="source" value="<?=val($editing,'source')?>" placeholder="e.g. DGFT"></div>
<div class="field"><label for="source_url">Source URL</label><input id="source_url" name="source_url" value="<?=val($editing,'source_url')?>" placeholder="https://..."></div>
<div class="field"><label for="image">Image URL</label><input id="image" name="image" value="<?=val($editing,'image')?>" placeholder="https://.../image.jpg"></div>
<div class="field"><label for="image_file">Or upload image</label><input id="image_file" name="image_file" type="file" accept="image/jpeg,image/png,image/webp"><small>JPG / PNG / WEBP, max 5 MB.</small></div>
<div class="field full"><label for="content">Full Article</label><textarea id="content" name="content" rows="9" placeholder="Write the full article. Leave a blank line between paragraphs."><?=val($editing,'content')?></textarea></div>
<div class="field"><label for="cta_label">Button Label</label><input id="cta_label" name="cta_label" value="<?=val($editing,'cta_label','Read More')?>"></div>
<div class="field"><label for="cta_link">Button Link</label><input id="cta_link" name="cta_link" value="<?=val($editing,'cta_link')?>" placeholder="contact.html or https://..."></div>
</div>
<div class="check-row" style="margin-top:16px">
<label><input type="checkbox" name="featured" <?=!empty($editing['featured'])?'checked':''?>> Featured</label>
<label><input type="checkbox" name="published" <?=(!$editing || !isset($editing['published']) || !empty($editing['published']))?'checked':''?>> Published</label>
</div>
<div class="admin-actions"><button class="btn-admin btn-save" type="submit">Save Article</button><a class="btn-admin btn-secondary" href="admin-news.php">Clear</a></div>
</form>
</section>
<aside class="admin-card">
<h2>Publishing Workflow</h2>
<div class="help"><strong>1.</strong> Add the headline, category, date and summary.<br><strong>2.</strong> Add the official source and verify the information before publishing.<br><strong>3.</strong> Paste the source URL or upload an image.<br><strong>4.</strong> Add the full article text and mark <strong>Published</strong>.<br><strong>5.</strong> Save. The public Trade Intelligence page updates automatically from <code>data/news.json</code>.</div>
<p class="muted" style="margin-top:14px">The admin page stores content in a JSON file, so it does not require a database. This is suitable for a small-to-medium static business website on PHP hosting.</p>
</aside>
</div>

<section class="admin-card" style="margin-top:24px">
<h2>Existing Articles <span class="count"><?=count($news)?></span></h2>
<div class="table-wrap">
<table class="news-table"><thead><tr><th>Headline</th><th>Category</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>
<?php foreach ($news as $item): ?>
<tr>
<td><strong><?=h((string)($item['title']??''))?></strong><br><span class="muted"><?=h((string)($item['slug']??''))?></span></td>
<td><?=h((string)($item['category_label']??''))?></td>
<td><?=h((string)($item['date']??'—'))?></td>
<td><?php if (!empty($item['published'])): ?><span class="status published">Published</span><?php else: ?><span class="status draft">Draft</span><?php endif; ?></td>
<td><div class="row-actions"><a href="admin-news.php?edit=<?=urlencode((string)$item['id'])?>">Edit</a><a href="news-article.php?slug=<?=urlencode((string)$item['slug'])?>" target="_blank">View</a><form method="post" onsubmit="return confirm('Delete this article?');" style="display:inline"><input type="hidden" name="csrf" value="<?=h(csrf_token())?>"><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?=h((string)$item['id'])?>"><button class="danger" type="submit">Delete</button></form></div></td>
</tr>
<?php endforeach; ?>
</tbody></table>
</div>
</section>
</main>
</body>
</html>
