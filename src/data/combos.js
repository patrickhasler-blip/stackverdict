// The comparison database. Each entry is a Tool × Model pairing.
// Keep this file the single source of truth — the wizard, the compare
// pages, and the SEO guides all read from it.
//
// Fields:
//   id            unique slug — for subscription combos, also the key to
//                 look up rate-limit assumptions in src/data/subscription-limits.js
//   tool          the coding agent / IDE
//   toolType      "cli" | "ide" | "desktop" | "extension"
//   model         the LLM it runs on (for this recommended pairing) — must
//                 match a key in src/data/model-prices.js to get a
//                 subscription-vs-API cost comparison in the wizard
//   provider      who serves the model
//   tasks         array of task ids this pairing is good at (see TASKS)
//   minSkill      "reads-code" | "ai-builder" | "technical" — floor to be
//                 productive (shown on compare pages; no longer asked in the
//                 wizard). Written for our actual audience — technical
//                 solopreneurs who read code and have already built things
//                 with AI tools, not "beginner/intermediate/pro" devs:
//                   reads-code  — can follow code, wouldn't write it from scratch
//                   ai-builder  — builds with AI tools, wants setup guidance
//                   technical   — comfortable with raw terminal/API-key setup
//   pricing       "free" | "byok" | "subscription" | "usage"  (byok = bring your own API key)
//   monthlyLow    typical low end of monthly spend in USD (0 = free)
//   monthlyHigh   typical high end of monthly spend in USD — used as the
//                 flat cost for subscription/usage combos in the calculator
//   setup         1 (one click) … 5 (terminal + keys + config)
//   surface       "terminal" | "editor" | "app" | "browser"
//   pros          array of short strings
//   cons          array of short strings
//   guide         optional slug of an in-site setup guide
//   link          outbound reference

import { estimateApiCost } from './model-prices.js';
import { getLimitStatus, WORKDAYS_PER_MONTH } from './subscription-limits.js';

export const TASKS = [
  { id: 'shopify-app', label: 'Build a Shopify app', blurb: 'Embedded app, Polaris UI, webhooks, billing.' },
  { id: 'web-app', label: 'SaaS / web app', blurb: 'Full-stack product: auth, billing, a database.' },
  { id: 'mobile-app', label: 'Mobile app', blurb: 'React Native / Expo, native features, store-ready.' },
  { id: 'directory', label: 'Directory / marketplace', blurb: 'Listings, search & filters, submissions, maybe payments.' },
  { id: 'browser-extension', label: 'Browser extension', blurb: 'Manifest V3, content scripts, store review.' },
  { id: 'ai-agent', label: 'Chatbot / AI agent', blurb: 'Wraps an LLM API into a product — chat UI, tools, memory.' },
  { id: 'api-backend', label: 'API / backend service', blurb: 'Auth, endpoints, billing — no frontend required.' },
  { id: 'landing-page', label: 'Landing page', blurb: 'Static, fast, SEO-friendly — the front door for your product.' },
];

// Coding intensity is entered as hours/day (see the slider in Wizard.jsx) —
// a tangible unit, not tokens. Bounds for that slider live here so the data
// layer and the UI agree on the range.
export const INTENSITY_HOURS_PER_DAY = { min: 0.5, max: 8, step: 0.5, default: 2 };

export const COMBOS = [
  {
    id: 'claude-cowork-sonnet5',
    tool: 'Claude Cowork',
    toolType: 'desktop',
    model: 'Sonnet 5',
    provider: 'Anthropic',
    tasks: ['web-app', 'shopify-app', 'directory', 'ai-agent', 'landing-page'],
    minSkill: 'reads-code',
    pricing: 'subscription',
    monthlyLow: 20,
    monthlyHigh: 20,
    setup: 1,
    surface: 'app',
    pros: ['Desktop app, works alongside your files', 'Handles multi-step tasks with little steering', 'Flat monthly price, no token math'],
    cons: ['Subscription, no free tier', 'No BYOK option — you can’t swap in your own API key'],
    guide: 'claude-cowork-setup',
    link: 'https://www.anthropic.com',
  },
  {
    id: 'claude-code-sonnet5',
    tool: 'Claude Code',
    toolType: 'cli',
    model: 'Sonnet 5',
    provider: 'Anthropic',
    tasks: ['web-app', 'shopify-app', 'mobile-app', 'directory', 'browser-extension', 'ai-agent', 'api-backend'],
    minSkill: 'ai-builder',
    pricing: 'subscription',
    monthlyLow: 20,
    monthlyHigh: 100,
    setup: 3,
    surface: 'terminal',
    pros: ['Agentic, edits across your whole repo', 'Terminal-native, scriptable', 'Also runs on pay-as-you-go Anthropic API billing instead of a subscription'],
    cons: ['Needs a bit of terminal comfort — the guide below walks you through it', 'Higher tiers get pricey under heavy use'],
    guide: 'claude-code-setup',
    link: 'https://www.anthropic.com',
  },
  {
    id: 'cursor-sonnet5',
    tool: 'Cursor',
    toolType: 'ide',
    model: 'Sonnet 5',
    provider: 'Anthropic (via Cursor)',
    tasks: ['web-app', 'landing-page', 'shopify-app', 'mobile-app', 'directory'],
    minSkill: 'ai-builder',
    pricing: 'subscription',
    monthlyLow: 20,
    monthlyHigh: 20,
    setup: 2,
    surface: 'editor',
    pros: ['Full IDE, inline edits + chat', 'Tab autocomplete is excellent', 'Model picker built in'],
    cons: ['Usage limits on the Pro plan', 'Editor lock-in (VS Code fork)'],
    guide: null,
    link: 'https://cursor.com',
  },
  {
    id: 'aider-deepseek',
    tool: 'Aider',
    toolType: 'cli',
    model: 'DeepSeek V4 Flash',
    provider: 'DeepSeek (BYOK)',
    tasks: ['web-app', 'directory', 'browser-extension', 'ai-agent', 'api-backend'],
    minSkill: 'technical',
    pricing: 'byok',
    monthlyLow: 2,
    monthlyHigh: 15,
    setup: 4,
    surface: 'terminal',
    pros: ['Extremely cheap on DeepSeek tokens', 'Git-native: every change is a commit', 'Open source, model-agnostic'],
    cons: ['Needs terminal comfort and your own API key — the guide covers both', 'You drive the architecture; no hand-holding'],
    guide: 'aider-setup',
    link: 'https://aider.chat',
  },
  {
    id: 'aider-sonnet5',
    tool: 'Aider',
    toolType: 'cli',
    model: 'Sonnet 5',
    provider: 'Anthropic (BYOK)',
    tasks: ['web-app', 'shopify-app', 'directory', 'browser-extension', 'ai-agent', 'api-backend'],
    minSkill: 'technical',
    pricing: 'byok',
    monthlyLow: 15,
    monthlyHigh: 60,
    setup: 4,
    surface: 'terminal',
    pros: ['Top-tier model, pay only for what you use', 'Git-native workflow', 'Open source'],
    cons: ['Token costs add up on big repos', 'You handle setup and key management yourself — the guide covers it'],
    guide: 'aider-setup',
    link: 'https://aider.chat',
  },
  {
    id: 'cline-deepseek',
    tool: 'Cline',
    toolType: 'extension',
    model: 'DeepSeek V4 Flash',
    provider: 'DeepSeek (BYOK)',
    tasks: ['web-app', 'browser-extension', 'ai-agent', 'landing-page', 'api-backend'],
    minSkill: 'ai-builder',
    pricing: 'byok',
    monthlyLow: 2,
    monthlyHigh: 20,
    setup: 3,
    surface: 'editor',
    pros: ['Runs inside VS Code, free extension', 'Cheap with DeepSeek', 'Sees your terminal + browser'],
    cons: ['You\'ll need your own DeepSeek API key to get started', 'Can burn tokens on long tasks'],
    guide: null,
    link: 'https://cline.bot',
  },
  {
    id: 'devin-desktop-sonnet5',
    tool: 'Devin Desktop',
    toolType: 'ide',
    model: 'Sonnet 5',
    provider: 'Anthropic (via Devin Desktop)',
    tasks: ['web-app', 'landing-page', 'mobile-app', 'directory'],
    minSkill: 'ai-builder',
    pricing: 'subscription',
    monthlyLow: 20,
    monthlyHigh: 20,
    setup: 2,
    surface: 'editor',
    pros: ['Full IDE (formerly Windsurf), now unified with Devin\'s cloud agents', 'Access to OpenAI, Claude, and Gemini frontier models', 'Handles multi-file changes well'],
    cons: ['Recently rebranded from Windsurf — quota specifics still vague', 'Editor lock-in'],
    guide: null,
    link: 'https://devin.ai',
  },
  {
    id: 'bolt-managed',
    tool: 'Bolt.new',
    toolType: 'browser',
    model: 'Managed (Anthropic)',
    provider: 'StackBlitz',
    tasks: ['web-app', 'landing-page', 'shopify-app', 'directory'],
    minSkill: 'reads-code',
    pricing: 'subscription',
    monthlyLow: 0,
    monthlyHigh: 20,
    setup: 1,
    surface: 'browser',
    pros: ['Runs entirely in the browser, zero install', 'Deploy in one click', 'Great for prototypes'],
    cons: ['Token credits run out fast', 'Not built for large existing codebases'],
    guide: null,
    link: 'https://bolt.new',
  },
  {
    id: 'lovable-managed',
    tool: 'Lovable',
    toolType: 'browser',
    model: 'Managed (Anthropic)',
    provider: 'Lovable',
    tasks: ['web-app', 'landing-page', 'directory'],
    minSkill: 'reads-code',
    pricing: 'subscription',
    monthlyLow: 0,
    monthlyHigh: 25,
    setup: 1,
    surface: 'browser',
    pros: ['No install, chat-to-app in the browser', 'Supabase + GitHub built in', 'Very beginner-friendly'],
    cons: ['Opinionated stack', 'Costs scale with edits'],
    guide: null,
    link: 'https://lovable.dev',
  },
  {
    id: 'continue-local',
    tool: 'Continue',
    toolType: 'extension',
    model: 'Qwen 2.5 Coder (local)',
    provider: 'Ollama (local)',
    tasks: ['web-app', 'browser-extension', 'ai-agent', 'landing-page', 'api-backend'],
    minSkill: 'technical',
    pricing: 'free',
    monthlyLow: 0,
    monthlyHigh: 0,
    setup: 5,
    surface: 'editor',
    pros: ['Fully free, runs offline on your machine', 'No data leaves your laptop', 'Open source'],
    cons: ['Needs a capable GPU/Mac', 'Local models trail the frontier', 'Setup takes real effort — expect some troubleshooting'],
    guide: null,
    link: 'https://continue.dev',
  },
  {
    id: 'github-copilot',
    tool: 'GitHub Copilot',
    toolType: 'extension',
    model: 'Multiple (GPT / Sonnet)',
    provider: 'GitHub',
    tasks: ['web-app', 'mobile-app', 'landing-page'],
    minSkill: 'reads-code',
    pricing: 'subscription',
    monthlyLow: 0,
    monthlyHigh: 10,
    setup: 2,
    surface: 'editor',
    pros: ['Free tier available', 'Lives in the editor you already use', 'Model picker in chat'],
    cons: ['Agent mode less autonomous than rivals', 'Best as an assistant, not a builder'],
    guide: null,
    link: 'https://github.com/features/copilot',
  },
];

function round2(n) { return Math.round(n * 100) / 100; }

// Scoring: given a user's picks, return matching combos ranked cheapest-first,
// with an estimated real monthly cost, a subscription-vs-API verdict note,
// and — for subscription combos — a `limitStatus` (see subscription-limits.js)
// describing whether this usage level runs into that plan's rate limit.
export function rankCombos({ task, hoursPerDay }) {
  const hoursPerMonth = hoursPerDay * WORKDAYS_PER_MONTH;

  return COMBOS
    .filter((c) => c.tasks.includes(task))
    .map((c) => {
      const notes = [];
      const apiEstimate = estimateApiCost(c.model, hoursPerMonth);
      let actualCost;
      let limitStatus = null;

      if (c.pricing === 'free') {
        actualCost = 0;
        notes.push('Runs free regardless of usage — no token costs.');
      } else if (c.pricing === 'byok' || c.pricing === 'usage') {
        actualCost = apiEstimate ?? (c.monthlyLow + c.monthlyHigh) / 2;
        if (apiEstimate != null) notes.push(`Estimated ~$${round2(apiEstimate)}/mo in raw API cost at your usage level.`);
      } else {
        // subscription — flat fee, but show what the same usage would cost on the raw API.
        actualCost = c.monthlyHigh;
        limitStatus = getLimitStatus(c, hoursPerDay);
        if (apiEstimate != null) {
          notes.push(apiEstimate > c.monthlyHigh
            ? `At your usage, raw ${c.model} API pricing would run ~$${round2(apiEstimate)}/mo — the $${c.monthlyHigh}/mo subscription is the cheaper route.`
            : `At your usage, raw ${c.model} API pricing would only run ~$${round2(apiEstimate)}/mo — you may be overpaying with this subscription.`);
        }
      }

      // Cheaper wins, with a small tie-break for easier setup.
      const score = -actualCost * 2 + (5 - c.setup) * 1.5;

      return { ...c, actualCost, apiEstimate, limitStatus, score, notes };
    })
    .sort((a, b) => b.score - a.score);
}
