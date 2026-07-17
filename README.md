# StackVerdict — Check24 for solo builders on API access

A comparison engine for AI coding tools, niched to solopreneurs who build real products
(Shopify apps, mobile apps, directories, browser extensions, AI agents) and pay for API
access rather than bundled subscriptions. Users pick what they're building and their
API budget, and get a ranked shortlist of tool + model pairings — plus SEO setup guides.

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
- `src/components/Wizard.jsx`   The 2-step comparison flow: what you're building, then API budget (React island).
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
2. Add affiliate/referral links in each combo's `link` field where programs exist.
3. Write more SEO guides (one per tool) — they're your traffic engine.
4. Add a sitemap.xml (@astrojs/sitemap) and analytics.
5. Consider moving `combos.js` to a CMS/Airtable later so you can update prices
   without a redeploy.
