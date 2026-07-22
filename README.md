# StackVerdict — subscription-vs-API cost calculator for solo builders

A cost calculator for technical solopreneurs building real products (Shopify apps,
mobile apps, directories, browser extensions, AI agents) — people who've already
shipped something with an AI tool but don't think of themselves as programmers. Users
pick what they're building and how much they actually use AI coding tools, and get a
ranked shortlist of tool + model pairings — each with a real estimated monthly cost,
and a note on whether a flat subscription or raw API access works out cheaper for
their usage — plus SEO setup guides. See CLAUDE.md's "Voice & audience" section
before writing copy for this site.

## Run it
```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static site into ./dist
npm run preview  # preview the built site
```

## Deploy
The build output in `dist/` is fully static. Drag it into Netlify/Vercel/Cloudflare
Pages, or connect the repo for auto-deploys. Set the real domain in `astro.config.mjs`
(the `site` field) so canonical URLs and OG tags are correct.

## Where to edit things
- `src/data/combos.js`   THE database. Add/edit tool+model pairings and the ranking
                         logic here. This is your moat — keep it current.
- `src/data/model-prices.js`   Raw per-token API prices. **Edit this file to update
                         token prices** — no backend or admin panel, just edit the
                         numbers and push; Vercel auto-deploys in ~1 minute.
- `src/components/Wizard.jsx`   The 2-step comparison flow: what you're building, then usage volume (React island).
- `src/pages/index.astro`       Homepage + hero.
- `src/pages/guides/*.astro`    SEO setup guides (aider, claude-code, cowork).
- `src/pages/compare/[id].astro`  Auto-generates one indexable detail page per combo.
- `src/layouts/Base.astro`      Design tokens, global CSS, header/footer, SEO meta.

## Adding a new tool
Append an object to `COMBOS` in `src/data/combos.js`. A `/compare/<id>` page and its
appearance in the wizard are generated automatically. If you write a guide for it,
set its `guide` field to the guide's slug.

## Next steps to make it real
1. Verify every price/task field against the tools' current pricing pages.
2. Keep `model-prices.js` current — token prices change often and drive the
   calculator's accuracy directly.
3. Add affiliate/referral links in each combo's `link` field where programs exist.
4. Write more SEO guides (one per tool) — they're your traffic engine.
5. Add a sitemap.xml (@astrojs/sitemap) and analytics.
