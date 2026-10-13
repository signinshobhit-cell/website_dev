# Daily operation and maintenance

## Automatic checks

The live-health workflow runs approximately every six hours and can be run manually in GitHub Actions. It checks every sitemap page, brand and canonical metadata, robots.txt, courier country options and one read-only UAE quote. It retries transient network failures and fails visibly if checks do not pass. It never submits a customer enquiry or writes to Google Sheets.

Every Pages deployment also runs the health check. Build and deploy jobs have time limits. Existing GitHub notifications are configured for failed workflows by email and on GitHub. Scheduled Actions can be delayed and are not continuous uptime monitoring; periodically confirm that runs are still happening.

The check verifies the quote service is responding, not every supplier price or the spreadsheet write path. After a rate-card change, run the courier tests and verify a known sample against purchase cost × 1.70. After an enquiry-backend change, submit one clearly labelled owner test, confirm its receipt in the private sheet, then remove the test record.

## Monthly review

- Review failed Actions runs and Google Search Console indexing errors.
- Test a courier quote and manual air/sea enquiry on mobile.
- Check rate validity, supplier conditions and official scheme content before updating it.
- Review GitHub collaborators, Google Sheet sharing and Apps Script project access. Keep private rates and customer enquiries out of public Git.
- Check Cloudflare auto-renew and payment validity before the renewal date. Domain expiration is October 9, 2027; auto-renew is currently scheduled for September 9, 2027.

## Security and limits

GitHub and Google 2FA were already enabled during the October 13, 2026 review. Cloudflare authenticator setup requires the owner to complete it privately. DNSSEC was enabled through Cloudflare and its status should be checked after registrar activation.

The courier source already restricts JSONP callbacks, validates shipment data, avoids processing contact data and applies a global quote request limit. The cargo source validates inputs, neutralizes spreadsheet formulas, uses consent and a honeypot, and handles duplicate requests. These controls do not eliminate all spam or quota exhaustion. Cloudflare website rules do not protect the separate script.google.com endpoints.

The www record remains DNS-only while GitHub Pages serves HTTPS. Do not assume Cloudflare WAF/CDN protects this hostname. Adding stronger bot protection requires server-side validation in the Apps Script backend as well as the form widget.

Flexlyf.com remains a separate domain at the owner's request. Do not configure a redirect or Search Console Change of Address from it.
