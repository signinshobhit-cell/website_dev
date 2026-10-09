# Flexlyf link and SEO audit

Reviewed 9 October 2026. Scope: public HTML pages, navigation/footer links, internal anchors, linked local assets, live HTTP responses, sitemap, canonical URLs, metadata and published news discovery. This is a technical audit, not a ranking guarantee or a measured Core Web Vitals report.

## Findings and fixes

- Audited 20 source pages and 307 unique HTTP/HTTPS link destinations. The deployed build now also contains five individual published news pages.
- Fixed links to nonexistent `news.html`, `news`, `currency`, `resource` and `site` destinations. Removed remaining footer links to the deleted inspection page. Standardised internal links on the actual `.html` files.
- Corrected nine extensionless canonical URLs to match the actual URLs used throughout navigation. Updated the matching social URL metadata.
- Replaced the outdated sitemap, which advertised nonexistent service slugs and the removed inspection page. The build adds the current published news URLs automatically. No invented modification dates are used.
- Removed metadata references to nonexistent social preview images. A dedicated branded sharing image is a future improvement.
- Corrected Trade Finance in the Trade Agreements dropdown and restored its Trade Agreements entry.
- Added consistent footer links for Privacy Policy, Terms of Service and E-Commerce Export.
- Generated public news as static HTML under `updates/`, with individual titles, descriptions, canonical URLs and NewsArticle structured data. Search engines and readers can access the full text without JavaScript. Public news links use these URLs; existing query-string article links continue to work.
- Added plain article links for the news archive when JavaScript is unavailable. The old generic article loader is marked noindex; its canonical is set to the specific static article when loaded.
- Added a regression check for public internal links, local assets, anchor targets, page headings, canonical tags, descriptions, sitemap targets and published article markup. The complete suite has 33 tests.

## External links needing manual verification

An automated failure does not establish that an external page is broken. Some government sites have certificate-chain or availability problems, and some organisations block automated requests. These links were retained rather than replaced with unverified alternatives:

- FIEO membership page: HTTP 403.
- EFTA India agreement page: HTTP 403.
- LinkedIn profile: HTTP 999 (automated-access restriction).
- MSME International Cooperation and first-time-exporter portals: certificate validation could not complete.
- Coal monitoring portal: certificate validation could not complete.
- Aluminium monitoring portal: request timed out.
- CBIC home/customs pages and ICEGATE FTP page: certificate validation could not complete.
- DFAT Australia–India ECTA guidance: request timed out.
- New Zealand–India agreement page: certificate validation could not complete.

## What remains outside this audit

1. Verify ownership in Google Search Console, submit `https://flexlyf.com/sitemap.xml`, and inspect the main service pages and a news article. Account access was not supplied for this audit.
2. Check Search Console indexing and field Core Web Vitals after Google recrawls the site. A valid sitemap helps discovery but does not guarantee indexing or ranking.
3. Add a real branded social preview image and, where useful, original service images with descriptive alternative text.
4. Review marketing claims, policy-page accuracy, client evidence and service availability periodically. Technical checks cannot verify those business facts.

References: [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview), [Google canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).
