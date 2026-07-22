// Subscription rate-limit / quota assumptions — the ONE place to update
// these when a provider changes their limits (they do this often, and
// often without much public documentation).
//
// Every entry is tagged with a `confidence` level — read this before
// trusting a number:
//   'verified'     — the provider publishes this exact figure today
//   'estimated'    — the provider confirms the *mechanism* (e.g. a 5-hour
//                    rolling window) but never publishes a number; the
//                    figure here is our own conservative, unofficial guess
//   'vague'        — the provider's own docs are unclear, inconsistent, or
//                    contradict each other across pages
//   'unverifiable' — we could not confirm the product/plan still exists as
//                    described (e.g. the site now redirects elsewhere) —
//                    no threshold is modeled, don't trust anything here
//
// Checked against official sources on 2026-07-22 — re-check `sourceUrl`
// before relying on anything below, especially non-'verified' entries.

import { estimateApiCost, TOKENS_PER_HOUR } from './model-prices.js';

// Average working days per month (5 days/week × 52 weeks ÷ 12). Used only
// to translate a monthly $ or token allowance into an "hours/day" figure
// that's comparable to the calculator's hours/day slider.
export const WORKDAYS_PER_MONTH = 21.7;

const TOKENS_PER_HOUR_TOTAL = TOKENS_PER_HOUR.input + TOKENS_PER_HOUR.output;

export const SUBSCRIPTION_LIMITS = {
  'claude-cowork-sonnet5': {
    confidence: 'estimated',
    windowHours: 5,
    windowCapHours: 2.5,
    basis: 'Anthropic confirms a 5-hour rolling session limit shared across Claude.ai and Claude Code, plus a separate weekly cap — but publishes no exact message/hour figure, stating usage "varies based on...message length, model choice, and effort level." 2.5h of active use per 5h window is our own conservative estimate for the entry Pro tier, not an Anthropic number.',
    sourceUrl: 'https://support.claude.com/en/articles/9797557-usage-limit-best-practices',
    overage: { type: 'upgrade', label: 'Upgrade to a Max plan (5x or 20x more usage)', priceUsd: 100 },
  },
  'claude-code-sonnet5': {
    confidence: 'estimated',
    windowHours: 5,
    windowCapHours: 2.5,
    basis: 'Anthropic states Claude Code usage limits are "shared across Claude and Claude Code" on Pro/Max, using the same 5-hour rolling window — again with no published hour/message figure. Anthropic also mentions an option to add pay-as-you-go API credits if you consistently hit limits, as an alternative to upgrading. Same unofficial 2.5h/window estimate as Claude Cowork.',
    sourceUrl: 'https://support.claude.com/en/articles/11145838-using-claude-code-with-your-pro-or-max-plan',
    overage: { type: 'upgrade', label: 'Upgrade to Max ($100/mo, 5x–20x more usage)', priceUsd: 100 },
  },
  'cursor-sonnet5': {
    confidence: 'verified',
    monthlyCapUsd: 20,
    basis: 'Cursor\'s $20/mo plan includes "$20 of API usage" billed at cost; usage beyond that bills automatically at the same per-token rate as the underlying model API. Confirmed: no hard block, no waiting — just gradually more expensive.',
    sourceUrl: 'https://cursor.com/docs/account/pricing',
    overage: { type: 'api', label: 'Automatic pay-as-you-go at raw API rates', priceUsd: null },
  },
  'devin-desktop-sonnet5': {
    // Windsurf was rebranded, not discontinued — confirmed on a second check
    // (2026-07-22): devin.ai/desktop states outright "Devin Desktop is the
    // new name for Windsurf," and existing Windsurf users keep their plans.
    confidence: 'vague',
    basis: 'The current $20/mo Pro plan promises "increased quotas" over the free tier but discloses no concrete monthly numbers (tokens, messages, or $ amount). Overage is available — "purchase extra usage which is consumed at API pricing" — so likely no hard block, but the per-unit overage rate also isn\'t published. Not enough to model a threshold on.',
    sourceUrl: 'https://devin.ai/pricing',
    overage: { type: 'api', label: 'Pay-as-you-go overage at unpublished API rates', priceUsd: null },
  },
  'bolt-managed': {
    confidence: 'estimated',
    monthlyCapTokens: 10_000_000,
    basis: 'Bolt\'s current entry paid plan advertises "10M tokens/month" with unused tokens rolling over. We could not confirm what happens exactly at exhaustion (hard block vs. paid top-up) from the public pricing page. Also note: the plan price itself may have moved since our last check (we saw $25/mo quoted; combos.js still lists $20) — worth a separate pricing re-check.',
    sourceUrl: 'https://bolt.new/pricing',
    overage: { type: 'vague', label: 'Unclear from public pricing — check bolt.new/pricing', priceUsd: null },
  },
  'lovable-managed': {
    confidence: 'vague',
    basis: 'Lovable uses an opaque, tier-dependent "credits" system. Its public pricing/FAQ confirms paid "top-up credits" exist but discloses no monthly credit counts, consumption rates, or top-up pricing — not enough to model a threshold on.',
    sourceUrl: 'https://lovable.dev/pricing',
  },
  'github-copilot': {
    confidence: 'vague',
    monthlyCapUsd: 15,
    basis: 'GitHub\'s own docs disagree with each other: one support article describes Pro as "300 premium requests/month" ($10/mo, legacy annual billing, $0.04/request overage); a newer-looking plans page instead describes "$15 monthly total credits" with a "$5/mo Flex allotment" and $0.01/credit overage. We anchor on the $15-credit figure as the more current-looking one, but treat it as unresolved.',
    sourceUrl: 'https://github.com/features/copilot/plans',
    overage: { type: 'credits', label: 'Pay-as-you-go credits (~$0.01 each)', priceUsd: null },
  },
};

// Translate a combo's cap (whatever shape it's in) into a comparable
// "hours of active coding per day" threshold, then compare against the
// user's slider input. Assumes active use clusters into roughly one
// session per workday that aligns with any rate-limit window — a
// simplification, not a measured fact (documented here and shown in the UI).
export function getLimitStatus(combo, hoursPerDay) {
  const limit = SUBSCRIPTION_LIMITS[combo.id];
  if (!limit) return null;

  if (limit.confidence === 'unverifiable') {
    return { ...limit, thresholdHoursPerDay: null, overLimit: false, wait: null, extraCostUsd: null };
  }

  const perHourUsd = estimateApiCost(combo.model, 1); // $ for one hour of use, at raw API rates

  let thresholdHoursPerDay = null;
  if (limit.windowCapHours != null) {
    thresholdHoursPerDay = limit.windowCapHours;
  } else if (limit.monthlyCapUsd != null && perHourUsd) {
    thresholdHoursPerDay = limit.monthlyCapUsd / perHourUsd / WORKDAYS_PER_MONTH;
  } else if (limit.monthlyCapTokens != null) {
    thresholdHoursPerDay = limit.monthlyCapTokens / TOKENS_PER_HOUR_TOTAL / WORKDAYS_PER_MONTH;
  }

  if (thresholdHoursPerDay == null) {
    return { ...limit, thresholdHoursPerDay: null, overLimit: false, wait: null, extraCostUsd: null };
  }

  const overLimit = hoursPerDay > thresholdHoursPerDay;
  let wait = null;
  let extraCostUsd = null;

  if (overLimit) {
    // Only window-based (blocking) limits actually make you wait — a $/token
    // allowance just bills more, it doesn't stop you (see 'cursor-sonnet5').
    if (limit.windowHours != null) {
      const hitsPerDay = Math.max(1, Math.ceil(hoursPerDay / thresholdHoursPerDay) - 1);
      wait = {
        timesPerWeek: hitsPerDay * 5, // assumes a 5-day workweek
        hoursLow: Math.max(0, limit.windowHours - thresholdHoursPerDay),
        hoursHigh: limit.windowHours,
      };
    }

    if (limit.overage?.type === 'upgrade') {
      extraCostUsd = limit.overage.priceUsd - combo.monthlyLow;
    } else if ((limit.overage?.type === 'api' || limit.overage?.type === 'credits') && perHourUsd) {
      const excessHoursPerMonth = (hoursPerDay - thresholdHoursPerDay) * WORKDAYS_PER_MONTH;
      extraCostUsd = estimateApiCost(combo.model, excessHoursPerMonth);
    }
  }

  return { ...limit, thresholdHoursPerDay, overLimit, wait, extraCostUsd };
}
