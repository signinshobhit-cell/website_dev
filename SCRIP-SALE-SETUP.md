# RoDTEP / RoSCTL seller page — local review

Preview: http://localhost:3000/rodtep-exchange.html

This change is on `feature/instant-scrip-sale`. Do not publish before the owner approves the preview.

## Buying schedule supplied by the owner on 18 October 2026

Each calculation is for **one individual scrip**. Both schemes and all ports currently use the same schedule:

| Face value | Buying rate |
| --- | --- |
| ₹0.01 to below ₹1,000 | 75% |
| ₹1,000 to below ₹10,000 | 85% |
| ₹10,000 to below ₹1,00,000 | 90% |
| ₹1,00,000 to below ₹5,00,000 | 95% |
| ₹5,00,000 through ₹50,00,000 | 99% |
| Above ₹50,00,000 | Manual confirmation |

Boundary interpretation: the next slab starts at the named threshold; the owner's final `5,00,00` was interpreted as ₹5,00,000 from the preceding slab. These assumptions were communicated during implementation. Confirm them during preview approval.

Formula: face value × buying percentage ÷ 100, rounded to the nearest paise. Discount is face value minus estimated payout. No unsupported tax, fee or payment timing assumptions are included. This is an indicative quote, not a binding offer or transaction.

## Update rates

1. Edit public **seller buying rates** in `scrip-rates.js`. Never add purchase costs, bank details, passwords or credentials.
2. Update `updatedAt` using an ISO timestamp. `validUntil: null` means there is no automatic expiry; set an ISO timestamp with timezone to stop quoting after a chosen time.
3. Keep the explanatory slab schedule in the page FAQ aligned with any rate changes. Update tests for approved new boundaries.
4. Run `npm test` and `npm run build`; check the local page. Publish only after approval.

This browser calculator exposes public buying percentages and cannot guarantee price integrity against modified client-side code. The desk must recalculate/verify every enquiry before agreeing a purchase. Port validation checks format only, not whether the port or scrip exists. WhatsApp opens a draft; the visitor must send it. It does not write to Google Sheets, collect uploads, verify ownership, transfer a scrip or move money.

## Research used for the redesign

Reviewed 18 October 2026. Original copy was written for Yuvglobal; competitor rates, rankings, guarantees and payment promises were not reused.

- [M.M. Overseas / eScrip seller page](https://escrip.in/sell-rodtep-rosctl-scrip): a dedicated seller journey and clear next action.
- [EXIMINQ RoDTEP / RoSCTL trading](https://eximinq.in/services/rodtep-rosctl-trading/): scheme selection, face value, buying percentage and estimated payout, followed by a sale request. The Yuvglobal calculator uses only the owner's schedule.
- [IBR Live](https://ibrlive.com/buy-sell-rodtep-rosctl/): separate buy/sell intent and transaction verification before finalisation.
- [ICEGATE official e-scrip advisory](https://www.icegate.gov.in/guidelines/others/advisory-e-scrip-avail-export-incentive-schemes-rosctl-rodtep): authority for the e-scrip module, not competitor claims.
- [ICEGATE official tutorials](https://www.icegate.gov.in/video-tutorials/RoDTEP-%26-RoSCTL): scheme-specific generation, viewing and transfer guidance.

The six document items are the owner's business checklist, not a claim that they are a universal government-mandated checklist. No documents are uploaded through this calculator.

## Competitor-led improvements — 18 October 2026

The owner identified EXIMINQ as a competitor appearing first in their own search results. This is not an independently established ranking across queries or locations.

The competitor prominently separates buying/selling prices and seller/buyer workflows, includes a calculator, explains the process and covers common questions. Its page also makes claims about instant settlement, best pricing, escrow and compliance. Those claims are not evidence of Yuvglobal capabilities and were not adopted.

Yuvglobal improvements: a seller-intent headline, public owner-approved slab table, one worked example, jump navigation, clearer service descriptions, a local-only six-item document checklist, direct company/contact information, and questions for exporters and authorised intermediaries. The calculator and rate configuration were preserved byte-for-byte during this pass. The visible rate table and example are regression-checked against the calculator.

Search guidance: [Google's people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content). Original useful content, clear business identity and a functional tool support the page's purpose. No first-page ranking or FAQ rich-result visibility is promised. The canonical URL is preserved. Publish and request indexing only after the owner approves the local version.
