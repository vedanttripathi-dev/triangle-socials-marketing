# Triangle Socials website

The website for **Triangle Socials**, a founder-led agency for social media marketing, Google Ads, Local SEO, Google Business Profile optimisation, content and performance marketing.

One page, plain static files. Open `index.html` in a browser and it runs — there is nothing to install.

---

## Tech stack

| | |
|---|---|
| Markup | Hand-written HTML5, one page (`index.html`) plus 404 and two legal pages |
| Styling | One plain CSS file. Custom properties for the design tokens, CSS Grid and Flexbox for layout |
| Scripting | ~10 KB of vanilla JavaScript. No framework, no jQuery, no animation library |
| Icons | One inline SVG sprite in `index.html` |
| Fonts | The visitor's system font. Nothing is downloaded |
| Build step | **None.** No Node, no bundler, no package.json |
| Hosting | Cloudflare Pages (static) |

Total first load is roughly **130 KB across 6 requests**, with no third-party servers involved.

---

## Structure

```
/
├── index.html              the whole website (every section lives here)
├── 404.html                "Page not found"
├── privacy.html            template — replace with your real policy
├── terms.html              template — replace with your real terms
│
├── css/style.css           all styling (numbered table of contents at the top)
├── js/
│   ├── config.js           ← contact details and links live here
│   └── main.js             menu, WhatsApp links, scroll effects
│
├── assets/
│   ├── logo/               the Triangle Socials logo (see "Logo" below)
│   ├── icons/              app and home-screen icons
│   └── images/             og-image.jpg (the link-preview picture)
│
├── favicon.ico
├── robots.txt              points crawlers at the sitemap
├── sitemap.xml             lists the one page
├── llms.txt                plain-text summary for AI assistants
├── site.webmanifest        name, colours and icons for "add to home screen"
├── _headers                Cloudflare security headers, CSP and caching
├── _redirects              Cloudflare redirects
└── .gitignore
```

**Why one CSS file rather than `variables.css` / `base.css` / `components.css`:** splitting them would mean either extra network requests or a build step, and this project deliberately has neither. `css/style.css` instead opens with a numbered contents list (19 sections) and each block has a banner comment, so you can jump straight to what you need. Media queries sit beside the component they affect instead of in a separate responsive file.

---

## Local development

There is no build process and no dev server to install.

- **Quickest:** double-click `index.html`.
- **Closer to production** (recommended if you are editing the CSP in `_headers`, since `file://` does not apply headers), serve the folder over HTTP with whatever you have:

```bash
npx serve .
```

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`. Neither tool is a project dependency; they are just convenient.

---

## Configuration

Almost everything you will want to change is in **`js/config.js`**, in a single `SITE_CONFIG` object:

| Field | Controls |
|---|---|
| `companyName` | Name used in generated WhatsApp messages |
| `email` | Every "Email us" button and footer link |
| `whatsappNumber` | Every WhatsApp button. Digits only, country code first, no `+` or spaces |
| `whatsappDisplay` | How the number is printed as text |
| `whatsappMessage` | The message pre-filled in WhatsApp |
| `vedicVoxUrl` | The VedicVox case-study buttons |
| `founders[].links` | Instagram/LinkedIn icons on a founder card. Empty = hidden |
| `social` | Triangle Socials' own profiles. Empty ones stay hidden everywhere |
| `analytics` | Off by default (see below) |

> The email, WhatsApp number and VedicVox URL are **also** written into `index.html` so that search engines and visitors without JavaScript still see them. If you change one, update `js/config.js` **and** search `index.html` for the old value.

### SEO metadata

Near the top of `index.html`:

- `<title>` — mirrored in `og:title` and `twitter:title`
- `<meta name="description">` — mirrored in `og:description` and `twitter:description`
- `<link rel="canonical">` — the site address
- Three `application/ld+json` blocks: Organization, Services, and FAQPage

### Your domain

The site currently uses **`triangle-socials.pages.dev`**, the address given by Cloudflare Pages. It appears in `index.html`, `robots.txt`, `sitemap.xml` and `llms.txt` — in the canonical tag, the Open Graph tags, the structured data and the sitemap.

When you buy a real domain, connect it in the Cloudflare Pages project under **Custom domains**, then swap the address everywhere:

```powershell
$old = "triangle-socials.pages.dev"
$new = "trianglesocials.com"   # your domain, without https://
Get-ChildItem -Path . -Recurse -File -Include *.html,*.xml,*.txt,*.webmanifest | ForEach-Object {
  $text = [IO.File]::ReadAllText($_.FullName)
  [IO.File]::WriteAllText($_.FullName, $text.Replace($old, $new), (New-Object Text.UTF8Encoding $false))
}
```

Then search the folder for the old address to confirm nothing is left, and commit the change — Cloudflare redeploys automatically.

---

## Logo

All logo files live in **`assets/logo/`**. There is one canonical file per purpose — no desktop/mobile duplicates.

| File | Where it is used | Notes |
|---|---|---|
| `triangle-socials-mark.svg` | Header, footer, 404 page | The triangle. Vector, so it is sharp at any size and on any screen density. **331 bytes.** |
| `triangle-socials-wordmark.png` | Beside the triangle | The "triangle socials" lettering, 640×98. Wide enough to stay sharp on 3× phone screens |
| `triangle-socials-full.webp` | The hero image | Your supplied artwork, unaltered, 1200×896 |

The markup is the same everywhere, so copy this block if you need the logo somewhere new:

```html
<a class="brand" href="#top" aria-label="Triangle Socials, back to top">
  <img class="brand__mark" src="assets/logo/triangle-socials-mark.svg" width="108" height="89" alt="">
  <img class="brand__word" src="assets/logo/triangle-socials-wordmark.png" width="640" height="98" alt="Triangle Socials">
</a>
```

The triangle carries `alt=""` because it is decorative: the wordmark beside it already supplies the name, so a screen reader would otherwise announce "Triangle Socials" twice. Sizing is handled in CSS (`.brand__mark`, `.brand__word`); the `width`/`height` attributes are there to reserve space and stop the page jumping while images load, so keep them in step with the real file dimensions if you swap a file.

**To replace the logo:** drop your files into `assets/logo/` using the same names, and update the `width`/`height` attributes if the dimensions differ. If you have an official SVG of the wordmark, use it — it will be smaller and sharper than the PNG.

App icons (`assets/icons/`) and the link-preview image (`assets/images/og-image.jpg`) are generated from the same artwork; regenerate them if the logo changes.

---

## Editing content

- **Services:** the chips in the Services section (`class="chips-list"`) and the detailed cards in the Google & Local section (`<article class="card">`). Add or delete the relevant block. If a service has a full description, add or remove its matching entry in the `"@type":"Service"` list in `<head>`.
- **FAQ:** edit the `<details>` block **and** the matching entry in the `FAQPage` block in `<head>`, keeping the wording identical.
- **Colours and spacing:** the `:root` block at the top of `css/style.css`.

---

## Deployment (Cloudflare Pages)

The repository root is the site root; there is no build output directory.

**From GitHub (recommended):**

1. Push this repository to GitHub.
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Pick the repository.
4. Build settings: leave **Framework preset** as *None*, leave **Build command** empty, and set **Build output directory** to `/`.
5. Deploy. Every push to the main branch redeploys automatically.

**Without Git:** Workers & Pages → Create → Pages → **Upload assets**, and drag the folder in.

`_headers` and `_redirects` are read by Cloudflare automatically — do not move or rename them. `_headers` contains the Content-Security-Policy, which includes a SHA-256 hash of the one small inline script in `<head>`. **If you edit that script, recompute the hash** or the script will be blocked.

---

## Analytics (optional)

Off by default, so nothing loads that you did not ask for. Add an ID in `js/config.js` → `analytics`, then allow that vendor's domains in the `Content-Security-Policy` line in `_headers`; the exact additions are listed in a comment there. Analytics loads only after the page has finished rendering, so it never delays the first paint.

---

## Things this site deliberately does not do

No invented clients, testimonials, statistics, ratings, awards, prices or addresses, and no `LocalBusiness` structured data, because no business address has been supplied. The copy never promises guaranteed rankings, leads or advertising results — Google states that organic local ranking cannot be bought or requested and depends mainly on relevance, distance and prominence. Please keep it that way; false claims are a credibility risk and, in structured data, against Google's guidelines.

---

## Performance notes (please keep these)

- No web fonts, no JavaScript libraries, no third-party requests.
- Icons are one inline SVG sprite, so they cost no extra requests.
- The hero image is the LCP element and is never lazy-loaded. Everything below the fold is `loading="lazy"`.
- Only `transform` and `opacity` are animated. The looping hero animations stop when the hero scrolls out of view, and all motion is disabled for visitors whose device asks for reduced motion.
- Every image has `width` and `height`, so the layout never jumps.

Before adding anything — a font, a library, a chat widget, a tracking pixel — ask whether it earns its weight, and measure the page again afterwards.
