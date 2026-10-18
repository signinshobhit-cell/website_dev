# E-commerce export and Walmart onboarding — local preview

Research and local implementation: 18 October 2026. No GitHub publication authorised for this redesign yet.

## What the research showed

- [CedCommerce Americas](https://cedcommerce.com/selling-in-americas) groups marketplace integrations and promotes bulk catalogue uploads, category mapping, inventory/order management and syncing. Reviewed in the browser because the text-fetch tool could not retrieve the site.
- [CedCommerce Walmart integration](https://cedcommerce.com/walmart-api-integration/) describes account prerequisites, catalogue work, connector features and fulfilment. Those are different from Yuvglobal owning a software platform or holding an official partner designation; neither is claimed.
- [Walmart's official India guide](https://marketplace.walmart.com/india-sell-on-walmart/) lists business verification, selling history, a US return address, payout providers and entity-specific documentation. It explains verification for Indian sellers without a US tax ID. Eligibility must be reviewed before promising an application to a first-time seller.
- [Walmart registration](https://marketplace.walmart.com/seller-registration-guide/) describes verification, payment-provider setup and operational launch tasks. Yuvglobal's scope is assistance, not approval authority.
- [Amazon's official export guide](https://sell.amazon.in/grow-your-business/amazon-global-selling/exports) distinguishes account/catalogue setup and FBA versus seller fulfilment.
- [eBay India](https://export.ebay.com/in/) describes global selling, account verification, listings and shipping.
- [Etsy's official India payment guide](https://help.etsy.com/hc/en-in/articles/6742925359255-How-to-Accept-Payments-as-a-Seller-in-India) allows new Indian shops to sell internationally, with a regular GSTIN and Payoneer. Product-policy suitability is a separate check.
- [Target Plus](https://plus.target.com/) requires a US-registered and operating business. Channels from the supplied screenshot are not all generally accessible to Indian exporters. TikTok Shop, SHEIN, Temu, Shopee, Lazada, Miravia and Lelong are presented as eligibility-assessment enquiries, not guaranteed onboarding routes. Older screenshot/aggregator lists are not evidence that every marketplace is currently admitting sellers. Sears was not promoted as an active launch service without current verification. Mirakl Connect and connectors are distinguished from marketplaces.

## Page and search-intent structure

| Page | Main user need | Service enquiry |
| --- | --- | --- |
| `ecommerce-export.html` | New international channels, e-commerce export services, marketplace onboarding | Choose a channel or ask for a shortlist |
| `walmart-seller-onboarding.html` | Walmart onboarding agent/support in India, account setup, catalogue preparation | Walmart preselected in the hub enquiry form |

The hub links to a substantial Walmart page with different content, rather than making many near-duplicate location or brand pages. Both pages have unique titles/descriptions, canonical URLs, service/business/breadcrumb structured data and real contact details. The Walmart URL is added to the sitemap. All primary content is static HTML, available without JavaScript. No partnership badges, invented success metrics, testimonials, approval claims or ranking promises were added.

The hub's six services cover channel selection, seller onboarding, listings, third-party integration coordination, export compliance/shipping and ongoing support. Marketplace terms, software subscriptions, freight, advertising and professional fees are distinguished. Credit-assistance content remains accessible through the existing explainer, without republishing unverified scheme figures in the redesign.

## Local review and deployment

- Hub: http://localhost:3000/ecommerce-export.html
- Walmart: http://localhost:3000/walmart-seller-onboarding.html
- The enquiry form prepares a visitor-reviewed WhatsApp draft. It sends nothing automatically and does not collect KYC, create a seller account, save leads to Sheets or submit marketplace applications.
- Region filters help visitors browse the six core channels; all cards are present in the initial HTML for discovery.
- After approval: publish, submit the updated sitemap in Search Console and request indexing of both URLs. Evaluate impressions, relevant queries, clicks and genuine enquiries over time. Search ranking depends on many factors and is not guaranteed.

Service availability, pricing and scope should be agreed with each client before accepting work. Any official marketplace partnership can be added only with verifiable supporting evidence from the owner.

## Global-directory expansion following owner clarification

The hub now presents 26 channels with combined region, category, seller-route and name filters. Multiple selected channels persist while filters change and are combined into one visitor-reviewed WhatsApp enquiry. Walmart is one channel card; its detail page remains available without making the hub Walmart-focused.

Canonical public catalogue: `marketplace-channels.js`. Edit its channel data, then run `node scripts/build-marketplace-directory.cjs` to regenerate the static cards and enquiry options. The standard public build includes both catalogue and controller JavaScript. Keep the explanatory directory count aligned if adding/removing entries. Test coverage checks every catalogue channel appears in both cards and the form, along with combined filters and multi-channel enquiry validation.

Additional primary references reviewed on 18 October 2026:

- [noon India Global Selling programme](https://helpcenter.noon.partners/en/category/global-selling/noon-guide-to-setup-global-store-in-uae-and-ksa-for-indian-sellers)
- [Amazon India registration guide](https://sell.amazon.in/grow-your-business/amazon-global-selling/registration-guide)
- [Kaufland non-EU tax registration](https://www.kauflandglobalmarketplace.com/en/seller-university/formal-framework/tax-registration/)
- [Allegro non-EEA registration](https://help.allegro.com/en/sell/a/registration-for-sellers-outside-the-european-economic-area-Pgbk3OdYgh6)
- [Cdiscount seller FAQ](https://marketplace.cdiscount.com/en/faqs/)
- [Newegg international sellers](https://www.newegg.com/sellers/index.php/international/)
- [Wayfair supplier programme](https://sell.wayfair.com/)
- [Rakuten overseas merchant announcement](https://global.rakuten.com/corp/news/press/2025/0930_03.html)
- [Jumia seller overview](https://group.jumia.com/business/marketplace/sell)
- [Mercado Libre seller-entity verification](https://global-selling.mercadolibre.com/learning-center/news/what-you-should-know-about-the-kyc-process)
- [Lazada seller programmes](https://sellercenter.lazada.com.my/apps/seller/login)
- [SHEIN Europe requirements](https://seller-eu.shein.com/get-started-shein-marketplace)
- [Temu seller centre](https://am.seller.temu.com/login.html)

The catalogue distinguishes an India-specific published route from a cross-border review or a potentially restricted local-entity/invitation route. It does not represent every platform as open to a direct Indian registration. Product tags are editorial discovery groupings, not a complete platform category list or a product-permission determination. Shopify and WooCommerce are explicitly labelled storefront platforms; Alibaba.com and Faire are labelled wholesale channels. Individual card links point to the platform's own site or guidance for the next review.

## Trade Connect guide expansion

Read the [Indian Trade Connect Global E-commerce Guide](https://www.trade.gov.in/pages/ecommerce-guide) through the browser on 18 October 2026. The text-fetch tool could not retrieve the page and web search confused it with the separate US `trade.gov` site; no US-site findings were attributed to India's portal.

The Indian directory includes categories, countries, platform profiles, sector / platform type, ECDB-sourced sales information and shipping-provider information. The [Zalando profile](https://www.trade.gov.in/pages/ecommerce-guide/zalando-de) was inspected in detail. Its category, main-country and shipping structure informed the site's planning section. Sales figures and third-party ECDB tables were not copied or presented as current data.

The guide lists online retailers as well as third-party seller marketplaces. A listing alone is not proof of a self-service onboarding route or Indian seller acceptance. Eight relevant directory discoveries were cross-checked against platform-owned guidance/sites and added with route-review labels: Zalando, OTTO Market, bol, eMAG, Coupang, Tmall Global, JD Worldwide and Trendyol. The current catalogue contains **34 channels**.

Primary programme references:

- [Zalando partner onboarding](https://partner.zalando.com/university/pp/start)
- [OTTO application process](https://www.otto.market/en/howitworks/registration.html)
- [bol international partner routes](https://partnerplatform.bol.com/en/cdp/selling-via-bol)
- [eMAG cross-border programme](https://marketplace.emag.ro/cross-border/en)
- [Coupang global sellers](https://globalsellers.coupang.com/en/)
- [Tmall Global merchant information](https://merchant.tmall.hk/en)
- [JD Worldwide merchant information](https://www.jd.hk/channelGuidePage/UdWaVaW6UdV4U9T3.html)
- [Trendyol platform](https://www.trendyol.com/): listed as entity/route review; direct Indian onboarding not claimed.

The target-country filter uses explicitly curated discovery examples in `countryCodes`; it is not a complete platform coverage list. Worldwide supplier/storefront channels remain discoverable under individual countries. Product permission and admission remain separate checks. A country selection suggests the enquiry's target market, while preserving a visitor's own edited text. No live sales feed, shipping-partner affiliation or government endorsement is implied.

The page now offers market/channel fit, destination readiness and full-cost shipping planning as practical discussion topics. Run `node scripts/build-marketplace-directory.cjs` after catalogue edits; it now updates country options and the channel count as well as cards and enquiry options.
