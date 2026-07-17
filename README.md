# VibeStack — Check24 for vibe coding

A comparison engine for AI coding tools. Users pick a task, their skill level, and
a budget, and get a ranked shortlist of tool + model pairings — plus SEO setup guides.

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
- `src/components/Wizard.jsx`   The 3-step comparison flow (React island).
- `src/pages/index.astro`       Homepage + hero.
- `src/pages/guides/*.astro`    SEO setup guides (aider, claude-code, cowork).
- `src/pages/compare/[id].astro`  Auto-generates one indexable detail page per combo.
- `src/layouts/Base.astro`      Design tokens, global CSS, header/footer, SEO meta.

## Adding a new tool
Append an object to `COMBOS` in `src/data/combos.js`. A `/compare/<id>` page and its
appearance in the wizard are generated automatically. If you write a guide for it,
set its `guide` field to the guide's slug.

## Next steps to make it real
1. Verify every price/skill/task field against the tools' current pricing pages.
2. Add affiliate/referral links in each combo's `link` field where programs exist.
3. Write more SEO guides (one per tool) — they're your traffic engine.
4. Add a sitemap.xml (@astrojs/sitemap) and analytics.
5. Consider moving `combos.js` to a CMS/Airtable later so you can update prices
   without a redeploy.
