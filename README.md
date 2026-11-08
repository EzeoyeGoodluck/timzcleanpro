# TimZ Cleanpro Services — website

The TimZ Cleanpro site, moved off GoHighLevel into plain HTML/CSS/JS.
All 9 pages keep their original URLs (`/services`, `/pricing`, `/contact` …), so existing Google rankings and links carry over.

## Folder layout

```
site.config.json     ← phone, email, hours, areas, rating, image links, form key (edit here once, updates every page)
src/pages/           ← one file per page (the content)
src/partials/        ← shared bits: header, footer, quote form, call-to-action band, logo
public/              ← the finished site (generated — don't edit the .html files here directly)
public/assets/       ← styles.css, main.js, favicon
build.mjs            ← stitches pages + partials into public/
vercel.json          ← Vercel settings (clean URLs, build command)
```

To change colours or fonts, edit the variables at the top of `public/assets/css/styles.css`.

## Editing

1. Change a page in `src/pages/` or a setting in `site.config.json`.
2. Run `node build.mjs` (Node 18+, nothing to install) — or just push; Vercel runs it for you.

To preview locally: `npm run preview`, then open the address it prints.

## Put it on GitHub and Vercel

1. Create a new **empty** repository on github.com (e.g. `timz-cleanpro-website`).
2. In this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/timz-cleanpro-website.git
   git push -u origin main
   ```
3. On vercel.com → **Add New → Project** → import the repo → **Deploy**. Settings are picked up from `vercel.json`; leave Framework Preset as "Other".
4. In the Vercel project → **Settings → Domains** → add `timzcleaningproservices.co.uk` (and `www.`). Vercel shows the DNS records to set at your domain registrar. Only switch DNS once you're happy with the Vercel preview, and then cancel the GHL site.

## Things to finish (replacing GoHighLevel features)

### 1. Quote form → your email (FormSubmit, free, no account)
Quote requests are emailed to oluwatoyinmarian@gmail.com via **formsubmit.co**.

**Activate it once, after the site is live on Vercel:**
1. Fill in the quote form on the live site yourself (use your own details).
2. FormSubmit emails oluwatoyinmarian@gmail.com an **activation link**. Click it (check spam if it's not there).
3. Done. Every quote request after that arrives as an email: name, email, phone, service, property, message and page. Pressing **Reply** answers the customer.

Note: the activation is tied to the website address it's activated from. If you first test on the `*.vercel.app` preview and later switch to your own domain, you may get a second activation email; just click it again.

**Optional: hide your email address from the page code.** The activation email (or the first lead) gives you a random alias like `a1b2c3…`. Put that in `site.config.json` as `"formsubmitAddress"` instead of your email and push. Spammers then can't scrape your address from the form.

### 2. Images — do this before cancelling GHL
The 4 photos are still loaded from GHL's file storage (`vibe.filesafe.space`) and may stop working when the GHL account closes.
Download them (right-click → Save image) from the live site, put them in `public/assets/img/`, and change the `img…` links in `site.config.json` to e.g. `/assets/img/living-room.png`.

### 3. Google reviews
The GHL site showed reviews live via a GHL widget. The new site shows your 4.9★ / 27-review rating with links to Google.
To show individual reviews, see the instructions inside `src/pages/reviews.html` (paste real reviews, or a free widget embed like Elfsight/Trustindex). Update `rating` and `reviewCount` in `site.config.json` as they change.

### 4. Anything else in GHL
Automations triggered by the old GHL form (auto-reply texts, pipeline entries) won't run any more, as leads now go to your email instead.

## Also included
SEO titles/descriptions per page, LocalBusiness schema for Google, `sitemap.xml`, `robots.txt`, a 404 page, a mobile menu, and a sticky "Call / Free Quote" bar on phones.
