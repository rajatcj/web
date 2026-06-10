# Royal Interior Designer, Website

Static multi-page website for **Royal Interior Designer**, Pokhara, Nepal.
Built with plain HTML, CSS and vanilla JavaScript, no build step required.

## How to use

1. Open the folder in VS Code.
2. Double-click `index.html` to preview locally, or use the **Live Server** extension for hot reload.
3. To deploy, upload the entire folder to any static host (Netlify, Vercel, GitHub Pages, cPanel, etc.).

## File structure

```
royal-interior/
├── index.html          # Home
├── about.html          # About Us
├── services.html       # Services
├── gallery.html        # Project gallery
├── team.html           # Our team
├── contact.html        # Contact (WhatsApp form)
├── sitemap.xml         # SEO sitemap
├── robots.txt          # Crawler rules (incl. AI / GEO bots)
├── css/
│   └── style.css       # All styles
├── js/
│   └── script.js       # All scripts (slider, form → WhatsApp, etc.)
└── images/             # Logo + photos (replaceable)
```

## Editing key info

- **WhatsApp number**, change `COMPANY_WHATSAPP` in `js/script.js` (line 5).
- **Phone, email, address**, search & replace in the footer of every `.html` file.
- **Domain**, replace `https://royalinteriorpokhara.com/` in canonical / OG tags
  and in `sitemap.xml` once your domain is live.
- **Images**, replace files in `/images/` keeping the same file names.

## How the WhatsApp form works

The contact form does **not** submit anywhere. On click, it composes a
pre-filled WhatsApp message containing every field the user filled in
and opens `https://wa.me/9779704681345?text=...` in a new tab. The
user just hits send inside WhatsApp.

The message body is capped at ~700 characters so it stays comfortably
readable inside the WhatsApp chat.

## SEO + GEO (Generative Engine Optimization)

- Per-page `<title>` and meta description.
- Open Graph + Twitter cards.
- Canonical URLs.
- `LocalBusiness` / `InteriorDesigner` JSON-LD with full NAP and geo
  coordinates (helps Google **and** AI engines like ChatGPT / Perplexity
  cite the business correctly).
- `FAQPage` schema on the Services page.
- `sitemap.xml` + `robots.txt` (AI bots explicitly allowed).

Enjoy!
