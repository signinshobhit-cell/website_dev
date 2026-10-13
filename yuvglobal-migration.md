# Yuvglobal domain migration

The prepared website uses https://www.yuvglobal.com, the existing services and colours, +91 92208 19906 and shobhit@flexlyf.com. Do not cancel flexlyf.com: the email still depends on it.

## Before publishing

1. In Cloudflare's yuvglobal.com DNS zone, set a DNS-only CNAME named `www` to `signinshobhit-cell.github.io`. Keep all unrelated email records.
2. Configure the apex domain for GitHub Pages using GitHub's current official custom-domain instructions. Check existing records before replacing any conflicting website record. Do not change MX records.
3. In the website_dev repository's Settings → Pages, set the custom domain to `www.yuvglobal.com`. Complete any required ownership verification and wait for DNS checks and HTTPS certificate issuance.
4. Merge the `feature/yuvglobal-rebrand` branch into main and let the Pages workflow deploy. Confirm the new homepage, service links, news and courier quote endpoint work over HTTPS.
5. Once the new site works, configure permanent, path-preserving redirects from the old website domain to the new one. Retain the old domain and email DNS. Never redirect mail services.

## Connected services

- Redeploy the cargo-enquiry Apps Script from `integrations/cargo-sheets/Code.gs` as a new version of its existing deployment so its confirmation page uses Yuvglobal. Keep its endpoint URL and private spreadsheet permissions.
- The courier callback identifiers intentionally retain their existing internal names for compatibility with the deployed endpoint. Pricing remains purchase cost × 1.70. No private rate-card upload is required for this rebrand.
- Existing social and Google review links remain attached to the current business profiles. Update those profiles separately when the new brand is ready.

## Search migration

Verify yuvglobal.com in Google Search Console, submit https://www.yuvglobal.com/sitemap.xml, and use Change of Address for the old property after redirects are working. Preserve redirects for at least a year. Previous SEO audit files describe the old domain and remain historical records.

Official instructions: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
