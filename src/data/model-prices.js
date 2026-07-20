// Raw per-token API prices, in USD per million tokens.
// This is the ONE file to touch when a provider changes pricing — edit the
// numbers below, commit, and push. Vercel auto-deploys from GitHub, so a
// price update is live within a minute or two. No backend, no database.
//
// Keep this in sync with the `model` field used in src/data/combos.js —
// only models that appear here get a subscription-vs-API comparison in the
// wizard. Combos whose model isn't listed here (managed/multi-model tools
// like Bolt, Lovable, GitHub Copilot) just show their flat price as before.
//
// Sources (check before trusting these numbers — pricing changes fast):
//   Anthropic: https://platform.claude.com/docs/en/about-claude/pricing
//   DeepSeek:  https://api-docs.deepseek.com/quick_start/pricing
//
// Last verified: 2026-07-20
export const MODEL_PRICES = {
  // Introductory price through 2026-08-31; rises to $3 / $15 per MTok after.
  'Sonnet 5': { inputPerM: 2, outputPerM: 10 },
  // DeepSeek V3 (deepseek-chat) is deprecated 2026-07-24 — this is the
  // DeepSeek V4 Flash rate that replaces it. combos.js has been updated to
  // call the model "DeepSeek V4 Flash" so the site doesn't advertise a dead model.
  'DeepSeek V4 Flash': { inputPerM: 0.14, outputPerM: 0.28 },
};

// Rough token cost of one hour of active agentic coding (input-heavy: repo
// context, tool results; lighter on output). Anchored to Anthropic's own
// worked example of a one-hour session (~50k input / ~15k output tokens).
export const TOKENS_PER_HOUR = { input: 50_000, output: 15_000 };

export function estimateApiCost(model, hoursPerMonth) {
  const price = MODEL_PRICES[model];
  if (!price) return null;
  const tokensIn = hoursPerMonth * TOKENS_PER_HOUR.input;
  const tokensOut = hoursPerMonth * TOKENS_PER_HOUR.output;
  return (tokensIn / 1_000_000) * price.inputPerM + (tokensOut / 1_000_000) * price.outputPerM;
}
