# Internal linking audit — 20 October 2026

## Coverage and findings

- Examined the production build: 39 HTML files, including 26 root pages, five generated news articles and eight legacy URL landing pages.
- Evaluated 1,354 internal anchor occurrences after improvements. Checked relative and absolute same-site URLs, query strings, base URLs, decoded fragments, duplicate IDs, local assets, sitemap destinations and canonical agreement.
- No missing targets, missing anchors, duplicate IDs or orphaned indexable pages were found. All 30 indexable pages remain within two HTML links of the homepage. The sitemap was not counted as a discovery link.
- Checked all 32 distinct internally linked live URLs (HTML destinations and the XML sitemap); all returned HTTP 200 at the audit time. This checks availability, not Google's indexed state, external destinations, email delivery or every interactive form submission.
- The existing build already provides static news-article links in the archive's no-JavaScript fallback. Those remain intact.
- The terms page is discoverable from footer links; a contextual service link to a legal page was not added merely to inflate the link count.

## Improvements

- Added subject-specific related-service links to 18 service pages. For example, trade finance connects to export benefits, scrip sales, logistics and e-commerce onboarding; import monitoring connects to licensing, EPR, certification and logistics.
- Updated 58 service-specific enquiry links to land directly at the contact form. `contact-routing.js` preserves the selected topic in the service field, permits the visitor to change it, and ignores unsupported query values. No information is submitted during selection.
- Production HTML now links the e-commerce export credit guide directly to its generated canonical article, rather than the noindex query-based reader. The old reader remains available for local preview and existing bookmarks.
- Added an internal-link graph audit to the existing site SEO test. New tests cover same-origin absolute links, directory indexes, nested base URLs, encoded anchors, missing files/scripts/fragments, duplicate IDs, orphan pages and enquiry-topic handling.
- Preserved the owner's three recent GitHub commits for Bing verification. The uploaded `BingSiteAuth.xml` returned HTTP 404 because the public build did not copy it. Added only this named verification file to the build allowlist and checked that its contents survive unchanged.
- Browser-checked a complete licensing → CHIMS enquiry journey and finance → export benefits journey. Checked related links at 320, 768, 1024 and 1440 pixels.

## Unresolved: email delivery configuration

The contact form still has the existing placeholder `https://formspree.io/f/YOUR_FORMSPREE_ID`. It cannot deliver enquiries through that endpoint. The owner chose email delivery and was asked to provide the actual Formspree form endpoint from the dashboard's Integration tab. No account password or API secret is needed. The existing phone, direct email and WhatsApp contact links remain available. The audit reports this as a warning and does not claim that email submission works.

## Repeat the checks

```text
node scripts/build-site.cjs
node scripts/audit-internal-links.cjs
node scripts/audit-internal-links.cjs --live --output .local/internal-link-audit-final.json
node --test tests/*.test.cjs
```

To maintain the contextual service links, update the map in `scripts/update-related-links.cjs` and run that script. Keep links in the static HTML so discovery does not depend on client-side JavaScript.
