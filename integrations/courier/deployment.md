# Public courier quote deployment

This is a separate Google Apps Script project with no connection to the cargo-enquiry spreadsheet. It exposes only supported country names and customer selling-price estimates. Purchase rates are embedded in private server source, never in GitHub or website assets.

1. Run `node scripts/build-courier-apps-script.cjs` locally. It produces `.local/courier-deployment.gs`, containing confidential supplier costs. Do not commit or share this file publicly.
2. Paste that file into a separate Apps Script project's Code.gs. Keep project editor sharing restricted to the owner.
3. Deploy a Web app, execute as the owner, access Anyone. This makes the read-only quote endpoint public, not the source code or spreadsheet. Review and approve any permission prompt yourself.
4. Set the returned `/exec` URL in `courier-config.js`. Redeploy the website through the existing GitHub Pages workflow.
5. Check an anonymous browser with export/import, dimensional-weight examples, unavailable routes and sea enquiries before launch.

Selling prices are purchase rate × 1.70, rounded to two decimals. Fuel and supplier surcharges are included; taxes, duties and optional insurance are excluded. Exact 2027 expiry and exceptional carrier rules still require supplier confirmation before booking.

The read-only JSONP transport follows Google's Content Service documentation. It sends route, readiness date, cargo category and box measurements only. No name, contact information, company or commodity text is sent to the price endpoint. Callback identifiers are strictly validated; errors and replies never include private rates. Anonymous callers can obtain selling prices, so this is not an authentication boundary.

A best-effort global cap of 300 calculations per minute protects processing capacity. Apps Script cache and platform quotas are not a substitute for a production WAF; high-volume abuse may make quotes temporarily unavailable. The manual enquiry remains available. Thirty-second network timeouts allow customers to recover without losing entries.

To update prices: refresh the private workbook import, verify markup and expiry, regenerate server source, update Code.gs and deploy a new version of the existing deployment. Retain the same endpoint URL. Never place supplier data in courier-config.js.

Reference: https://developers.google.com/apps-script/guides/content
