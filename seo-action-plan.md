# Search visibility review — 12 October 2026

## What the evidence shows

- All 20 original sitemap pages returned successful live HTTP responses. HTTPS, www and the GitHub Pages hostname consolidate to flexlyf.com. `/index.html` declares the root homepage as canonical.
- Public search results already include the homepage and contact page. A site search does not establish complete indexing coverage or exact rankings.
- Google Search Console recognised the signed-in owner's existing DNS verification. The sitemap report showed Success, 25 discovered pages and last read on 10 October 2026 before this update.
- Licensing URL Inspection explicitly showed **URL is on Google**, **Page is indexed**, successful fetch and crawling/indexing allowed. Its last recorded crawl was 28 September 2026. Google still recorded the older user-declared extensionless canonical `/licensing`; the live HTML now declares `/licensing.html`.
- The newer URL-prefix property displayed “Processing data”, but the existing domain property provided historical performance and indexing reports. A detailed baseline is saved privately in `.local/seo-search-console-baseline.md`, excluded from Git and the public build. No manual-action audit result is claimed; the overview lacked field Core Web Vitals data.
- Exclusion examples were legacy URLs, redirect/canonical alternatives and the favicon. Eight legacy paths with relevant replacements receive immediate redirects: product-testing, certification-services, about-us, contact, licensing-support, logistics-customs, news-logs-desk and trade-insurance. Removed commodity/inspection services and meaningless site URLs are not indiscriminately redirected to the homepage.

## Changes implemented

1. Clear service titles, descriptions and H1 headings for 14 service areas, retaining their existing URLs.
2. Corrected inconsistent placeholder addresses in legacy company/service structured data. The main business address is 310, Arjangarh, New Delhi. Mumbai is a service area, not an invented office. The registered Prayagraj address remains visible in the footer.
3. Consistent business identity, service information and breadcrumb structured data. This describes the business; it does not promise a Google rich result or ranking boost. No fabricated reviews, ratings, certifications, prices or approval guarantees.
4. A crawlable `/services.html` catalogue linked from every public footer.
5. Three distinct, substantive service pages: `/iec-registration.html`, `/apeda-registration.html` and `/international-courier.html`. Each explains scope, information to prepare, process, quotation limits and next steps. IEC and APEDA have official source references. Courier content explains the actual live calculator.
6. Related-service links, accurate service-area copy for Delhi, Uttar Pradesh and Mumbai, and new canonical URLs in the sitemap. There are no cloned city pages or hidden keyword lists.
7. Link, sitemap, canonical and structured-data regression checks. Pricing, news publishing and private-data build exclusion remain covered by the existing suite.
8. Crawler-readable immediate redirects for the eight known old paths. GitHub Pages does not offer configurable server-side redirects; the build uses zero-second HTML refresh and destination canonicals, which Google recognises as permanent redirect signals. Redirects are excluded from the sitemap.

## Priority search intent map

| Customer need | Primary page | Focus |
|---|---|---|
| IEC registration / DGFT profile support | iec-registration.html | Application preparation and existing profile assistance |
| General import-export licences | licensing.html | Service catalogue and links to detailed support |
| RCMC and export council membership | rcmc-registration.html | Council selection and membership scope |
| APEDA RCMC application assistance | apeda-registration.html | Product coverage and official DGFT route |
| International courier rates from India | international-courier.html | Quote guide linked to the live logistics calculator |
| Air / sea freight or logistics registrations | logistics.html | Actual quote and enquiry tools |

Service areas are Delhi, Uttar Pradesh and Mumbai. Search intent and useful local information should guide future content. Do not create near-identical pages solely by changing a city or licence name.

## Next actions after Google processes the data

- In Search Console, review Performance over 28 days: record queries, landing pages, impressions, clicks, CTR and average position. Filter India where helpful. Average position is not a promise of a fixed ranking in each city.
- Inspect priority URLs for Google's chosen canonical, last crawl and exclusions. Fix the specific cause rather than repeatedly requesting indexing. The sitemap helps discovery but does not guarantee indexing.
- Keep the Google Business Profile accurate: actual business name, appropriate service categories, real address/service areas, contact details, opening hours and service descriptions. Verify profile ownership before edits. Avoid a Mumbai address unless there is an actual eligible office there.
- Publish original proof with permission: real project examples, anonymised process explanations, actual staff expertise and genuine customer reviews. Do not publish client documents, invented results or paid link schemes.
- Add deeper pages only where you can supply genuinely useful service-specific information. Review government references when rules change. Avoid generic copied competitor descriptions.
- Measure field Core Web Vitals when sufficient data exists. No performance score was measured during this review.
- Evaluate trends after several weeks. Improvements may take longer; first-page placement for every service cannot be guaranteed.

## Maintenance

Edit the service HTML carefully and keep title, description, visible headings and schema consistent. `scripts/update-service-seo.cjs` is the source generator for this pass; rerunning it overwrites generated service text/metadata, so review its content before regeneration. `node scripts/audit-public-seo.cjs` checks live responses; `node --test tests/*.test.cjs` verifies the public build and links. Do not change the courier markup or expose purchase rates during SEO work.

## Official research

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Helpful, reliable content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google technical indexing requirements](https://developers.google.com/search/docs/essentials/technical)
- [Business structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Local ranking guidance](https://support.google.com/business/answer/7091)
- [Google redirect guidance](https://developers.google.com/search/docs/crawling-indexing/301-redirects)
- [DGFT IEC manual](https://content.dgft.gov.in/Website/IEC_Manual_V4.0.pdf)
- [APEDA RCMC guidance](https://apeda.gov.in/RCMC2)

Deployment and Search Console submission outcomes are recorded separately when confirmed; this report does not invent indexing or ranking results for new pages.
