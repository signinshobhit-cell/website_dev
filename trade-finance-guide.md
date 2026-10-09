# Trade Finance page maintenance

The page is `trade-finance.html`, linked under Services throughout the website. It presents Flexlyf's advisory/documentation scope, LC/BG explanations, eight finance services, the eight DGFT portal areas supplied by the owner, currency references and WhatsApp/call/contact enquiry links.

## Currency refresh

The existing GitHub Pages workflow now runs at 16:30 and 20:30 UTC on weekdays (22:00 and 02:00 the following day in India), as well as on main-branch pushes and manual dispatch. It fetches the ECB daily XML, validates it, computes INR cross-rates and builds/deploys the site with `data/fx-rates.json`. No API key or private server is required. GitHub schedules may be delayed; the page always shows the reference date and flags data older than four days. It never calls the figures live trading prices.

ECB publishes on business days. EUR is the feed base; INR per foreign currency equals ECB INR-per-EUR divided by the foreign-currency-per-EUR figure. AED and SAR are explicitly marked USD-peg estimates, using 3.6725 and 3.75 respectively. Bank transaction rates and customs assessment rates must be obtained from the relevant bank or CBIC notification.

To refresh manually, run the **Publish Flexlyf website** workflow on GitHub. For local development, run `node scripts/update-fx.cjs`, then `node scripts/build-site.cjs`. A failed or malformed official feed stops the update without overwriting the previous snapshot; check Actions failures and the displayed date. The Refresh button reloads the deployed snapshot, not unpublished central-bank data. The browser rechecks the snapshot every 15 minutes while visible.

The fetch updates deployment artifacts rather than committing daily rate files. Each subsequent build refreshes the feed again. If the workflow becomes inactive, re-enable it in GitHub Actions. Confirm website source is configured to GitHub Actions so only the public build is deployed.

## Content and sources

- [India Exim Bank corporate banking](https://www.eximbankindia.in/corporate-banking): pre/post-shipment credit, LC/BG and import finance context.
- [India Exim Bank buyer's credit](https://www.eximbankindia.in/buyers-credit) and [Trade Assistance Programme](https://tap.eximbankindia.in/trade_assistance_programme.html).
- [DGFT](https://www.dgft.gov.in/CP/), [official factoring guidelines](https://content.dgft.gov.in/Website/dgftprod/c8a4b775-338c-454c-8284-89a30e521f53/Trade%20Notice%20-%20Alternative%20Trade%20Instruments%2020th%20Feb.pdf) and [PIB Export Promotion Mission overview](https://www.pib.gov.in/PressNoteDetails.aspx?ModuleId=3&NoteId=156349&id=156349&lang=1&reg=3).
- [ECB rate publication](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html), [CBUAE reference](https://centralbank.ae/umbraco/Surface/Exchange/GetExchangeRateAllCurrency) and [SAMA peg policy](https://sama.gov.sa/en-US/MediaCenter/News/Pages/news-557.aspx).

Review current DGFT guidelines before advising on eligibility, claims or support amounts. The page intentionally does not promise sanctions, government benefit approvals or fixed borrowing rates. Flexlyf is described as an adviser/coordinator, not an issuing bank or lender. Recheck the AED/SAR peg assumptions if official policy changes.
