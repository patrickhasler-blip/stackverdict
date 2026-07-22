# StackVerdict — project guide for Claude Code

StackVerdict (stackverdict.dev) is a subscription-vs-API cost calculator for
freelancers building real products (Shopify apps, mobile apps, directories, browser
extensions, AI agents/chatbots, API backends). Users answer two questions (what
they're building, how many hours/day they actively use AI coding tools) and get a
ranked verdict of tool + model pairings, each with a real estimated monthly cost
and, where it applies, a note on whether a subscription or raw API access is
cheaper for them. The ranking logic in `rankCombos()` sorts cheapest-first — that
bias is the point, not a bug.

Subscription combos also get a **rate-limit reality check**: most subscriptions
cap usage (a rolling session window, a monthly $ or token allowance) and naively
comparing flat price vs. API price ignores that. `getLimitStatus()` in
`subscription-limits.js` translates the user's hours/day into a threshold and, if
they're over it, shows both consequences side by side — estimated wait time
(if the plan actually blocks you) and estimated extra cost (upgrade or overage) —
rather than picking one "winner."

## Stack
- Astro 5 (static output), one React island for the wizard.
- No backend, no database. All data lives in `src/data/combos.js`.
- Deployed as a static site on **Vercel** (project: patrickhasler-blips-projects/stackverdict,
  connected to the `patrickhasler-blip/stackverdict` GitHub repo — every push to `main`
  auto-deploys). `npm run build` -> `dist/`.

## Where things live
- `src/data/combos.js` — THE source of truth. Tool+model pairings, the task/usage
  taxonomy, and the `rankCombos()` scoring logic. Editing this is 90% of
  maintenance. Every combo auto-generates a `/compare/<id>` page and appears in the
  wizard. No other file needs touching to add a tool.
- `src/data/model-prices.js` — raw per-token API prices (USD per million tokens).
  **This is the one file to touch when a provider changes pricing.** Edit the
  numbers, commit, push — Vercel auto-deploys from GitHub, live in ~1 minute. No
  backend, no database, no admin panel needed. Only models listed here get a
  subscription-vs-API comparison in the wizard.
- `src/data/subscription-limits.js` — **the one place** for subscription rate-limit/
  quota assumptions, keyed by combo `id`. Every entry has a `confidence` level
  ('verified' / 'estimated' / 'vague' / 'unverifiable') and a `basis` string
  explaining where the number came from — read those before trusting a figure,
  and re-check `sourceUrl` since providers change these often and rarely
  document them well. `getLimitStatus()` is the only function that reads this file.
- `src/components/Wizard.jsx` — the 2-step flow: task, then a coding-intensity slider
  (hours/day, React island, client:load). Also has the results-page email capture
  (fake door, `EmailCapture`) and fires the `calculator_started` /
  `calculator_completed` / `email_submitted` analytics events.
- `src/lib/analytics.js` — `trackEvent(name)` — thin wrapper around `window.goatcounter.count()`
  that polls briefly then no-ops if GoatCounter isn't loaded (e.g. local dev, or blocked
  by an ad-blocker). Use this, never call `window.goatcounter` directly, so tracking
  calls can't break the page.
- `src/pages/index.astro` — homepage + hero.
- `src/pages/guides/*.astro` — SEO setup guides. One per tool is the growth engine.
- `src/pages/compare/[id].astro` — generates one detail page per combo automatically.
- `src/pages/privacy.astro` — privacy policy. Currently a **draft placeholder** — has
  real legal review needed before you rely on it; see the callout on the page itself.
- `src/layouts/Base.astro` — design tokens (CSS vars), global styles, header/footer,
  all SEO/OG meta, and the conditional GoatCounter analytics script tag.
- `public/` — favicon, OG image, static assets.

## Brand (do not drift from this)
- Voice: authoritative, sober, like a testing institute issuing a verdict. Not playful,
  not hypey. The signature element is the "Our verdict" seal on the top result.
- Palette (CSS vars in Base.astro): --ink #0F1B2D, --paper #F4F2EC,
  --verdict #3FB984 (the recommendation green — THE accent, use sparingly),
  --verdict-deep #1E8A5C, --ochre #C99A3B (rare accent), --slate #5B6B85.
- Type: Space Grotesk (display), Inter (body).

## Common maintenance tasks
- Add a tool: append an object to COMBOS in src/data/combos.js. Fill every field.
  If you write a guide for it, set `guide` to the guide's slug.
- Update subscription pricing: edit monthlyLow/monthlyHigh on the relevant combo.
- Update raw API token prices: edit src/data/model-prices.js — this is what drives
  the calculator's cost estimates for BYOK/usage combos and the "at your usage,
  raw API would cost ~$X" notes on subscription combos. Prices change often —
  most frequent edit. Verify against the tool's/provider's real pricing page first.
- Update subscription rate limits: edit src/data/subscription-limits.js. Keep the
  `confidence` level honest — don't upgrade an 'estimated'/'vague' entry to
  'verified' unless the provider actually publishes that number.
- Add a guide: create src/pages/guides/<slug>.astro, copy the structure of
  aider-setup.astro, and link it from the relevant combo's `guide` field.
- Never invent prices or features. If unsure, check the official source.
- **Known issue to resolve:** `windsurf-sonnet5` in combos.js may need removal —
  windsurf.com now redirects to devin.ai with no mention of "Windsurf" (checked
  2026-07-22). See the 'unverifiable' entry in subscription-limits.js.

## Environment variables
Both are optional at build time (see `.env.example`) — the site builds and runs fine
with neither set, just without analytics or the email capture form.

- `PUBLIC_GOATCOUNTER_URL` — your site's GoatCounter counting endpoint (e.g.
  `https://stackverdict.goatcounter.com/count`). Free for reasonable public use — no
  30-day-trial limit like Plausible. Set only in production. Leave unset in local
  dev/preview so the analytics script never loads and nothing fires during development.
- `PUBLIC_FORMSPREE_FORM_ID` — the Formspree form ID (not the full URL — just the id,
  e.g. `xeeylgbq`) the results-page email form submits to via the official
  `@formspree/react` SDK (`useForm`/`ValidationError` in `EmailCapture`, Wizard.jsx).
  Leave unset locally to hide the form entirely instead of showing one that goes
  nowhere. Note: this ties the form specifically to Formspree — swapping providers
  later means swapping the SDK, not just the env var.

**Where to set these for production:** this site is deployed on **Vercel**, not
Cloudflare Pages — set them under the `stackverdict` Vercel project → Settings →
Environment Variables (Production), then redeploy (or just push to `main`).

## Conventions
- Keep the site static — no backend, no client-side storage.
- Copy is written from the user's side of the screen: plain verbs, sentence case.
- After any change, run `npm run build` and confirm it completes with no errors.

## SEO infrastructure
- Sitemap is auto-generated by @astrojs/sitemap on every build (dist/sitemap-index.xml).
  It picks up all pages automatically — no manual editing needed when you add tools or
  guides. It relies on the `site` field in astro.config.mjs being correct.
- public/robots.txt allows all crawlers and points to the sitemap.
- After first deploy: submit https://stackverdict.dev/sitemap-index.xml in Google
  Search Console so pages get indexed.
