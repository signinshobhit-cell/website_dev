# Cargo quote requests → Google Sheets

## Current access choice

The approved setup is **private spreadsheet + public submission receiver**. Keep the Google Sheet's sharing set to **Restricted**. Set the Apps Script web app to **Execute as: Me** and **Who has access: Anyone**. This lets visitors submit enquiries; it does not share the spreadsheet or provide a read API.

Connection verified on 9 October 2026: the local Logistics form saved a clearly labeled test enquiry, reference `affa9753-79ce-44cb-9102-bcd60a53a960`, in **Cargo Enquiries** and displayed Google's success receipt. The spreadsheet remained private. `cargo-config.js` contains the deployed receiver URL. Website code still needs its normal GitHub publication before the public site uses this form. The test row is retained as verification evidence and can be deleted from the sheet.

## One-time connection

1. Open your [Google Sheet](https://docs.google.com/spreadsheets/d/1h1k-prlj_omrIhmrkUZggQHiaTYFxRYolNXMYWF8uHQ/edit). Sign in as its owner/editor.
2. Choose **Extensions → Apps Script**. Replace the starter code with the complete contents of `integrations/cargo-sheets/Code.gs`. Save. The spreadsheet ID is already configured.
3. Choose **Deploy → New deployment → Web app**. Set **Execute as: Me** and **Who has access: Anyone**, so customers can submit without a Google login. Authorize the script to access your spreadsheet using your own Google account. Do not share the sheet publicly. Your Workspace administrator may restrict anonymous deployments.
4. Copy the deployed URL ending in `/exec`. Paste it between the quotes in `cargo-config.js` (`window.CARGO_QUOTE_ENDPOINT`). Use the deployment URL, not the editor URL or `/dev` test URL.
5. Open the Logistics page, fill a test enquiry and submit. A Google confirmation tab must say **Your quote request is saved**. Check that **Cargo Enquiries** contains the same reference and cargo details. The tab is created automatically on first submission; existing sheet tabs remain intact.
6. Publish the website changes to GitHub only after that test passes. Delete the test row from Cargo Enquiries if desired.

Until step 4, submitting the website form clearly reports that details were **not sent**. The website remains static on GitHub; Google runs the receiver. No Google credentials belong in the public website.

## Daily quoting

After submitting, customers can optionally choose **Discuss on WhatsApp** to open +91 92208 19906 with their enquiry reference prefilled. They must press **Send** themselves. The Google success receipt also offers this button. WhatsApp does not save a sheet row or confirm submission. While the Sheets endpoint is unconfigured, the form explicitly reports that no sheet record was saved.

- Open **Cargo Enquiries**, review new rows, and contact the customer by email or phone.
- Update **Status**, **Quoted rate**, **Currency**, **Follow-up date** and **Team notes** directly in the sheet. These are your internal tracking columns; customers cannot read them from the website.
- Air/LCL rows contain package groups, total pieces, gross kilograms and cubic metres. FCL rows contain container type/count and total gross weight. Dimensions are centimetres; package weight is kilograms **per piece**. These are supplied measurements, not chargeable-weight calculations or final rates.
- Do not rename/reorder the column headers. You can format, filter and sort the data normally.
- Customer retries from the same form retain one reference and are deduplicated. **Start a new request** creates a new reference.

## Updating or troubleshooting

- After changing receiver code: **Deploy → Manage deployments → Edit → New version → Deploy**. Keeping the existing deployment preserves its URL.
- No receipt or an error receipt means saving is not confirmed. Retry from the same form; if a prior attempt saved, the same reference prevents a duplicate. Do not treat the website's “check confirmation tab” message as proof of delivery.
- Check Apps Script **Executions**, deployment permissions, sheet editor access and unchanged headers. Google quotas or outages can interrupt delivery.
- If a confirmation tab is blocked, allow the tab and retry. Customers can also call the trade desk.
- The endpoint accepts anonymous submissions. Validation, a honeypot, timing checks and duplicate protection are included; they are not comprehensive bot protection. If spam becomes a problem, add server-verified CAPTCHA before expanding traffic.
- Keep sheet access limited to your quoting team. Cargo/contact details are personal business data; remove records when no longer needed and apply your retention policy.

## Form research

The route/weight/volume fields follow [DHL quote guidance](https://www.dhl.com/us-en/home/global-forwarding/mydhli/discover-quote-and-book.html). Container, commodity and readiness fields follow [Maersk quote guidance](https://www.maersk.com/support/faqs/how-can-i-get-a-rate-quote). The receiver uses [Google Apps Script web apps](https://developers.google.com/apps-script/guides/web).
