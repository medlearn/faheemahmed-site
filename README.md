# faheemahmed.co.uk

Personal website for Faheem Ahmed — educator, author and consultant across
healthcare and education. Static site, no build step required.

## Structure
```
.
├── index.html              # the page
├── assets/
│   ├── css/styles.css      # all styling
│   ├── js/main.js          # nav + scroll behaviour
│   └── img/faheem.png      # hero portrait
├── robots.txt              # search + AI crawler rules
├── sitemap.xml             # page index for search engines
├── llms.txt                # plain-text summary for AI tools
└── netlify.toml            # deploy config
```

## Run locally
No dependencies needed. From this folder run either:
```
npx serve .
```
or
```
python3 -m http.server 8000
```
then open the address it prints (e.g. http://localhost:8000).

## Deploy (developer workflow)
1. Push this repository to GitHub.
2. Connect the repo to Cloudflare Pages or Netlify for continuous deployment.
   Build command: none. Output directory: `/` (root).
3. Add the custom domain `faheemahmed.co.uk` in the host and set DNS at the registrar.
4. Every push to `main` then redeploys the live site automatically.

## To do (real content)
- Real social URLs in the footer.
- Booking email + a Cal.com / Acuity (Stripe) link for paid bookings.
- A landscape `og-image.jpg` for link previews.
- Books, papers and videos — these sections were removed until real content exists.
