<?php
declare(strict_types=1);
header('Content-Type: text/html; charset=UTF-8');
$config = require __DIR__ . '/config.php';
$raw = is_file($config['data_file']) ? file_get_contents($config['data_file']) : '';
$data = json_decode($raw ?: '', true);
$items = is_array($data) && isset($data['news']) ? $data['news'] : [];
$slug = trim((string)($_GET['slug'] ?? ''));
$article = null;
foreach ($items as $item) if (($item['slug'] ?? '') === $slug && !empty($item['published'])) { $article = $item; break; }
if (!$article) { http_response_code(404); }
function h(string $s): string { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }
function paragraphs(string $s): string {
  $parts = preg_split('/\R\s*\R/u', trim($s)) ?: [];
  $out = '';
  foreach ($parts as $p) $out .= '<p>' . nl2br(h(trim($p)), false) . '</p>';
  return $out;
}
function externalOrLocal(string $url): string {
  $u = trim($url); if ($u === '') return '#';
  if (str_starts_with($u, 'http://') || str_starts_with($u, 'https://') || str_starts_with($u, '/')) return $u;
  return $u;
}
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title><?= $article ? h($article['title']) . ' | Flexlyf Trade Intelligence' : 'Trade Update Not Found | Flexlyf' ?></title>
<meta name="description" content="<?=h($article['summary'] ?? 'Flexlyf Trade Intelligence update')?>">
<link rel="stylesheet" href="styles.css">
<style>
.article-shell{padding:140px 20px 80px}.article-wrap{max-width:900px;margin:auto}.article-meta{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:14px}.article-badge{padding:6px 10px;border-radius:999px;background:#ECFDF5;color:#166534;font-weight:800;font-size:.78rem}.article-date{color:#6b7280;font-size:.86rem}.article-title{font-size:clamp(2rem,5vw,3.4rem);line-height:1.08;color:#063f30;margin:0 0 18px}.article-summary{font-size:1.1rem;color:#4b5563;line-height:1.7;margin-bottom:30px}.article-image{width:100%;max-height:480px;object-fit:cover;border-radius:16px;margin:0 0 30px}.article-body{font-size:1.04rem;line-height:1.85;color:#27352f}.article-body p{margin:0 0 1.25em}.article-source{padding:16px;background:#f0fdf4;border-left:4px solid #4AA923;border-radius:10px;margin-top:28px}.article-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:30px}.not-found{text-align:center;padding:80px 20px}.not-found h1{color:#064e3b}
</style>
</head>
<body>
<nav class="navbar" role="navigation" aria-label="Main navigation">
<div class="container navbar-container">
<a href="index.html" class="logo-wrapper" aria-label="Flexlyf Commerce Home"><span style="font-weight:900;font-size:1.35rem;color:#fff">Flex<span style="color:#7FE327">LyF</span></span></a>
<ul class="nav-menu">
<li><a href="index.html" class="nav-link">Home</a></li>
<li><a href="trade-intelligence.html" class="nav-link active">Trade Intelligence</a></li>
<li><a href="about.html" class="nav-link">About Us</a></li>
<li><a href="rodtep-exchange.html" class="nav-link">RoDTEP/RoSCTL</a></li>
<li class="nav-dropdown"><button class="nav-link nav-dropdown-toggle" type="button" aria-expanded="false" aria-haspopup="true">Services <span aria-hidden="true">⌄</span></button>
<div class="services-dropdown" style="padding:18px">
<div class="services-dropdown-header"><span class="eyebrow">OUR SERVICES</span><h3>Export &amp; Import Trade Solutions</h3><p>End-to-end support for your international trade requirements.</p></div>
<div class="services-dropdown-grid">
<a href="certification.html" class="service-dropdown-item"><span class="service-dropdown-icon">✓</span><span><strong>Certification</strong><small>ISO, CE, FDA, Organic, Halal &amp; more</small></span></a>
<a href="licensing.html" class="service-dropdown-item"><span class="service-dropdown-icon">◆</span><span><strong>Licensing</strong><small>IEC, DGFT, EPCG, RCMC &amp; authorisations</small></span></a>
<a href="testing.html" class="service-dropdown-item"><span class="service-dropdown-icon">⌕</span><span><strong>Product Testing</strong><small>Food, textile, chemical &amp; product testing</small></span></a>
<a href="inspection.html" class="service-dropdown-item"><span class="service-dropdown-icon">✓</span><span><strong>Inspection</strong><small>Pre-shipment inspection &amp; quality verification</small></span></a>
<a href="insurance.html" class="service-dropdown-item"><span class="service-dropdown-icon">◆</span><span><strong>Trade Insurance</strong><small>Marine cargo, freight &amp; ECGC solutions</small></span></a>
<a href="contact.html" class="service-dropdown-item"><span class="service-dropdown-icon">→</span><span><strong>Logistics &amp; Customs</strong><small>Freight, customs clearance &amp; documentation</small></span></a>
</div></div></li>
<li><a href="commodity.html" class="nav-link">Commodity</a></li>
<li><a href="contact.html" class="nav-link">Contact</a></li>
</ul>
<a href="tel:+919220819906" class="nav-phone">+91 92208 19906</a>
<div class="hamburger" role="button" tabindex="0" aria-label="Open navigation"><span></span><span></span><span></span></div>
</div></nav>

<main class="article-shell">
<?php if (!$article): ?>
<div class="article-wrap not-found"><h1>Trade Update Not Found</h1><p>The requested update is unavailable or unpublished.</p><a class="btn btn-primary" href="trade-intelligence.html">Back to Trade Intelligence →</a></div>
<?php else: ?>
<article class="article-wrap">
<div class="article-meta"><span class="article-badge"><?=h((string)($article['category_label'] ?? 'Trade Update'))?></span><span class="article-date"><?=h((string)($article['date'] ?? ''))?></span></div>
<h1 class="article-title"><?=h((string)$article['title'])?></h1>
<p class="article-summary"><?=h((string)$article['summary'])?></p>
<?php if (!empty($article['image'])): ?><img class="article-image" src="<?=h((string)$article['image'])?>" alt="" loading="lazy">
<?php endif; ?>
<div class="article-body"><?=paragraphs((string)($article['content'] ?? $article['summary'] ?? ''))?></div>
<?php if (!empty($article['source'])): ?><div class="article-source"><strong>Source:</strong> <?=h((string)$article['source'])?><?php if (!empty($article['source_url'])): ?> — <a href="<?=h(externalOrLocal((string)$article['source_url']))?>" target="_blank" rel="noopener noreferrer">Verify official source</a><?php endif; ?></div><?php endif; ?>
<div class="article-actions"><a class="btn btn-primary" href="<?=h(externalOrLocal((string)($article['cta_link'] ?? 'contact.html')))?>"><?=h((string)($article['cta_label'] ?? 'Read More'))?> →</a><a class="btn btn-secondary-white" style="background:#064E3B;color:#fff" href="trade-intelligence.html">← All Trade Updates</a></div>
</article>
<?php endif; ?>
</main>
<footer class="footer"><div class="container"><div class="footer-grid"><div><h4 style="color:#fff">Flexlyf Commerce</h4><p class="footer-tagline">Empowering Indian MSMEs to compete confidently in global markets through premium trade consultancy.</p></div><div><h4>Services</h4><ul class="footer-links"><li><a href="certification.html">Certification</a></li><li><a href="licensing.html">Licensing Support</a></li><li><a href="testing.html">Product Testing</a></li><li><a href="contact.html">Logistics &amp; Customs</a></li></ul></div><div><h4>Company</h4><ul class="footer-links"><li><a href="about.html">About Us</a></li><li><a href="commodity.html">Commodity</a></li><li><a href="trade-intelligence.html">Trade Intelligence</a></li><li><a href="contact.html">Contact</a></li></ul></div><div><h4>Contact</h4><ul class="footer-links"><li><a href="tel:+919220819906">+91 92208 19906</a></li><li><a href="mailto:signinshobhit@gmail.com">signinshobhit@gmail.com</a></li></ul></div></div><div style="padding-top:26px;border-top:1px solid rgba(255,255,255,.18);margin-top:26px;color:rgba(255,255,255,.72);font-size:.82rem">© <span class="footer-year"></span> Flexlyf Commerce Pvt. Ltd.</div></div></footer>
<script src="main.js"></script>
<script>
document.addEventListener('DOMContentLoaded',function(){document.querySelectorAll('.footer-year').forEach(function(e){e.textContent=new Date().getFullYear()});var d=document.querySelector('.nav-dropdown'),t=document.querySelector('.nav-dropdown-toggle');if(d&&t){t.addEventListener('click',function(e){e.preventDefault();d.classList.toggle('open');t.setAttribute('aria-expanded',d.classList.contains('open')?'true':'false')});document.addEventListener('click',function(e){if(!d.contains(e.target)){d.classList.remove('open');t.setAttribute('aria-expanded','false')}})}});
</script>
</body></html>
