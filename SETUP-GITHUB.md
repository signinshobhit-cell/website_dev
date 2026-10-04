# Flexlyf Trade Intelligence — GitHub Pages Static CMS

This rebuild is designed specifically for a static GitHub Pages website. It does not use PHP or a server-side database.

## Upload these files

```text
trade-intelligence.html
trade-intelligence.js
trade-article.html
news-manager.html
data/news.json
news-images/.gitkeep
```

Keep your existing `styles.css`, `main.js`, and the rest of your website files. Do not replace your global stylesheet just for this feature.

## Publishing a new news article

1. Open `https://YOUR-DOMAIN/news-manager.html`.
2. Fill the headline, category, date, summary, source, source URL and article content.
3. Put the image in `news-images/` and set its path, for example `news-images/dgft-update.jpg`.
4. Click **Save update**.
5. Click **Download news.json**.
6. Replace `data/news.json` in GitHub with the downloaded file.
7. Upload the image into `news-images/`.
8. Commit/push. The Trade Intelligence page automatically reads the new JSON and shows the article.

Article links use one reusable page:
`trade-article.html?slug=your-article-slug`

## Important

`news-manager.html` is not a secure online admin panel because GitHub Pages has no server-side authentication. It is a browser-based content preparation tool. Do not put passwords, API tokens or private information in this file.

## Categories

- DGFT & FTP
- Customs & ICEGATE
- Export Incentives
- GST & Refunds
- Certifications
- International Trade
- Commodity Markets
