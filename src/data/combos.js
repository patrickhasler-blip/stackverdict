// The comparison database. Each entry is a Tool × Model pairing.
// Keep this file the single source of truth — the wizard, the compare
// pages, and the SEO guides all read from it.
//
// Fields:
//   id            unique slug
//   tool          the coding agent / IDE
//   toolType      "cli" | "ide" | "desktop" | "extension"
//   model         the LLM it runs on (for this recommended pairing)
//   provider      who serves the model
//   tasks         array of task ids this pairing is good at (see TASKS)
//   minSkill      "beginner" | "intermediate" | "pro" — floor to be productive
//                 (shown on compare pages; no longer asked in the wizard)
//   pricing       "free" | "byok" | "subscription" | "usage"  (byok = bring your own API key)
//   monthlyLow    typical low end of monthly spend in USD (0 = free)
//   monthlyHigh   typical high end of monthly spend in USD
//   setup         1 (one click) … 5 (terminal + keys + config)
//   surface       "terminal" | "editor" | "app" | "browser"
//   pros          array of short strings
//   cons          array of short strings
//   guide         optional slug of an in-site setup guide
//   link          outbound reference

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

export const BUDGETS = [
  { id: 'free', label: 'Free / self-hosted', cap: 0, hint: 'Local models or free tiers only — zero token spend.' },
  { id: 'low', label: 'Up to $25/mo in tokens', cap: 25, hint: 'A side project or first MVP.' },
  { id: 'mid', label: 'Up to $75/mo in tokens', cap: 75, hint: 'A daily driver with real usage volume.' },
  { id: 'high', label: 'No cap', cap: Infinity, hint: 'Scale the tokens to ship faster.' },
];

export const COMBOS = [
  {
    id: 'claude-cowork-sonnet5',
    tool: 'Claude Cowork',
    toolType: 'desktop',
    model: 'Sonnet 5',
    provider: 'Anthropic',
    tasks: ['web-app', 'shopify-app', 'directory', 'ai-agent', 'landing-page'],
    minSkill: 'beginner',
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
    minSkill: 'intermediate',
    pricing: 'subscription',
    monthlyLow: 20,
    monthlyHigh: 100,
    setup: 3,
    surface: 'terminal',
    pros: ['Agentic, edits across your whole repo', 'Terminal-native, scriptable', 'Also runs on pay-as-you-go Anthropic API billing instead of a subscription'],
    cons: ['Terminal comfort required', 'Higher tiers get pricey under heavy use'],
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
    minSkill: 'intermediate',
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
    model: 'DeepSeek V3',
    provider: 'DeepSeek (BYOK)',
    tasks: ['web-app', 'directory', 'browser-extension', 'ai-agent', 'api-backend'],
    minSkill: 'pro',
    pricing: 'byok',
    monthlyLow: 2,
    monthlyHigh: 15,
    setup: 4,
    surface: 'terminal',
    pros: ['Extremely cheap on DeepSeek tokens', 'Git-native: every change is a commit', 'Open source, model-agnostic'],
    cons: ['Terminal + API keys required', 'You drive the architecture; no hand-holding'],
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
    minSkill: 'pro',
    pricing: 'byok',
    monthlyLow: 15,
    monthlyHigh: 60,
    setup: 4,
    surface: 'terminal',
    pros: ['Top-tier model, pay only for what you use', 'Git-native workflow', 'Open source'],
    cons: ['Token costs add up on big repos', 'Setup and key management on you'],
    guide: 'aider-setup',
    link: 'https://aider.chat',
  },
  {
    id: 'cline-deepseek',
    tool: 'Cline',
    toolType: 'extension',
    model: 'DeepSeek V3',
    provider: 'DeepSeek (BYOK)',
    tasks: ['web-app', 'browser-extension', 'ai-agent', 'landing-page', 'api-backend'],
    minSkill: 'intermediate',
    pricing: 'byok',
    monthlyLow: 2,
    monthlyHigh: 20,
    setup: 3,
    surface: 'editor',
    pros: ['Runs inside VS Code, free extension', 'Cheap with DeepSeek', 'Sees your terminal + browser'],
    cons: ['BYOK setup needed', 'Can burn tokens on long tasks'],
    guide: null,
    link: 'https://cline.bot',
  },
  {
    id: 'windsurf-sonnet5',
    tool: 'Windsurf',
    toolType: 'ide',
    model: 'Sonnet 5',
    provider: 'Anthropic (via Windsurf)',
    tasks: ['web-app', 'landing-page', 'mobile-app', 'directory'],
    minSkill: 'intermediate',
    pricing: 'subscription',
    monthlyLow: 15,
    monthlyHigh: 15,
    setup: 2,
    surface: 'editor',
    pros: ['Agentic IDE with a clean flow', 'Good free tier to start', 'Handles multi-file changes well'],
    cons: ['Credit system can be confusing', 'Editor lock-in'],
    guide: null,
    link: 'https://windsurf.com',
  },
  {
    id: 'bolt-managed',
    tool: 'Bolt.new',
    toolType: 'browser',
    model: 'Managed (Anthropic)',
    provider: 'StackBlitz',
    tasks: ['web-app', 'landing-page', 'shopify-app', 'directory'],
    minSkill: 'beginner',
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
    minSkill: 'beginner',
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
    minSkill: 'pro',
    pricing: 'free',
    monthlyLow: 0,
    monthlyHigh: 0,
    setup: 5,
    surface: 'editor',
    pros: ['Fully free, runs offline on your machine', 'No data leaves your laptop', 'Open source'],
    cons: ['Needs a capable GPU/Mac', 'Local models trail the frontier', 'Fiddly setup'],
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
    minSkill: 'beginner',
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

// Scoring: given a user's picks, return matching combos ranked best-first.
export function rankCombos({ task, budgetCap }) {
  return COMBOS
    .filter((c) => c.tasks.includes(task))
    .filter((c) => c.monthlyLow <= budgetCap)
    .map((c) => {
      let score = 0;
      const notes = [];

      // Budget fit: reward staying comfortably under the cap.
      if (c.monthlyHigh <= budgetCap) score += 20;
      else if (c.monthlyLow <= budgetCap) { score += 8; notes.push(`Can exceed your budget under heavy use (up to $${c.monthlyHigh}/mo).`); }

      // Ease of setup — this audience is assumed technical, so weight it lightly.
      score += (5 - c.setup) * 2;

      // Pricing model: reward API-native pricing, penalise flat subscriptions —
      // this site is built for builders who work with API access, not bundled seats.
      if (c.pricing === 'byok' || c.pricing === 'usage') {
        score += 15;
      } else if (c.pricing === 'free') {
        score += 10;
      } else if (c.pricing === 'subscription') {
        score -= 15;
        notes.push('Flat subscription — you pay the same whether you ship one feature or fifty.');
      }

      return { ...c, score, notes };
    })
    .sort((a, b) => b.score - a.score);
}
