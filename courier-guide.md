# Local courier estimates

Open http://localhost:3000/logistics.html#instant-courier. Choose export from India or import to India, country, ready date, commodity and package details. Click **Show my rates**. You can compare prices, open a prepared WhatsApp message or transfer details into the existing cargo enquiry form. WhatsApp requires the customer to press Send. Estimates do not book a shipment or submit contact details automatically.

Sea freight remains manual. Choose Sea freight and follow the enquiry link. The existing air and sea enquiry form continues to save submissions through the configured Google Apps Script deployment.

## Pricing

- Customer transport estimate = supplied purchase rate × 1.30, rounded to two decimals.
- Fuel and other supplier surcharges are treated as included, as confirmed by the owner. They are not added again despite older notes in the workbook.
- Taxes, customs duties and optional insurance are excluded. No GST rate is assumed.
- General parcels use L × W × H / 5,000. Dimensions are rounded up to whole cm, and the larger of actual / volumetric weight is rounded up to 0.5 kg per piece. Piece weights are added and the next available shipment slab is used. These are disclosed estimation rules; final account-specific rounding and measurements are checked before booking.
- FedEx export/import parcel slabs, UPS Express Saver package slabs, DHL non-document slabs and Aramex parcel slabs are imported directly. Separate document/envelope rates are not used for parcel quotes.
- Per-kg extensions and special USA/Canada/Mexico, Australia Local/Beyond and UK PPX annexures need confirmed mapping/billing rules before activation. Missing country or weight coverage returns manual enquiry, never an extrapolated price.
- The owner confirmed validity into 2027 but has not supplied the exact expiry date. Local estimates allow shipment dates through that year, with booking confirmation required. Set `validUntil` to the confirmed YYYY-MM-DD in the private JSON before production; do not treat December 31 as a confirmed supplier deadline.
- Packages above 70 kg, a dimension above 120 cm, length plus twice width plus twice height above 300 cm, and special cargo are routed for review. These are conservative preview eligibility limits, not promises of carrier acceptance.

## Private rate data

Purchase rates live in `.local/courier-rates.json`. This directory is gitignored, blocked by the preview file server and excluded from the public build. The quote endpoint returns selling prices only. Never copy the workbook or this JSON into public assets or GitHub.

To refresh the workbook import from the project directory:

```powershell
& 'C:/Users/tenni/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' scripts/import-courier-rates.py 'C:/Users/tenni/Documents/Client folder/Orangestar rate card.xlsx'
```

The importer replaces the private JSON. Preserve any subsequently confirmed exact expiry setting when refreshing. Restart `npm start` after changes to the preview server; rate JSON is read anew on each quote.

## Before public deployment

This pass intentionally works locally only. GitHub Pages cannot execute the private pricing endpoint. Deploy a private Apps Script / serverless pricing backend, add abuse limits, confirm exact expiry and billing rules, and connect the frontend to it before enabling public estimates. The public page currently falls back to manual enquiry outside localhost. Supplier cost data must stay private in that backend. The existing enquiry submission deployment is unchanged.

## Calculation references

Carrier volumetric guidance: [FedEx](https://www.fedex.com/en-au/customer-support/faq/invoices-and-payments/fees-and-charges/calculate-dimensional-weight.html), [DHL India](https://www.dhl.com/discover/en-in/logistics-advice/import-export-advice/how-to-ship-large-items-internationally), [UPS guide](https://assets.ups.com/adobe/assets/urn%3Aaaid%3Aaem%3A891d1d04-7392-48bc-932a-8ab9dc5f33ee/original/as/domestic-rates-and-service-guide-preview_my-gb-en.pdf). Account-specific rounding should be confirmed with Orangestar.
