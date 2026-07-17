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
//   pricing       "free" | "byok" | "subscription" | "usage"  (byok = bring your own API key)
//   monthlyLow    typical low end of monthly spend in USD (0 = free)
//   monthlyHigh   typical high end of monthly spend in USD
//   setup         1 (one click) … 5 (terminal + keys + config)
//   surface       "terminal" | "editor" | "app" | "browser"
//   pros          array of short strings
//   cons          array of short strings
//   guide         optional slug of an in-site setup guide
//   link          outbound reference

export const SKILL_LEVELS = [
  { id: 'beginner', label: 'New to coding', hint: 'You can read code but writing from scratch is hard.' },
  { id: 'intermediate', label: 'Comfortable', hint: 'You ship features, git is second nature.' },
  { id: 'pro', label: 'Experienced', hint: 'You architect systems and review AI output critically.' },
];

export const BUDGETS = [
  { id: 'free', label: 'Free only', cap: 0, hint: 'No spend. Free tiers and local models.' },
  { id: 'low', label: 'Up to $25/mo', cap: 25, hint: 'One subscription or light API use.' },
  { id: 'mid', label: 'Up to $75/mo', cap: 75, hint: 'A serious daily driver.' },
  { id: 'high', label: 'No cap', cap: Infinity, hint: 'Whatever ships fastest.' },
];

export const TASKS = [
  { id: 'shopify-app', label: 'Build a Shopify app', blurb: 'Embedded app, Polaris UI, webhooks, billing.' },
  { id: 'web-app', label: 'Build a web app', blurb: 'Full-stack React/Next, auth, a database.' },
  { id: 'landing-page', label: 'Landing page / marketing site', blurb: 'Static, fast, SEO-friendly.' },
  { id: 'automation', label: 'Scripts & automation', blurb: 'Glue code, data pulls, scheduled jobs.' },
  { id: 'data-analysis', label: 'Data analysis & notebooks', blurb: 'Pandas, SQL, charts, exploration.' },
  { id: 'legacy-refactor', label: 'Refactor an existing codebase', blurb: 'Large repo, careful edits, tests.' },
  { id: 'mobile-app', label: 'Build a mobile app', blurb: 'React Native / Expo, native features.' },
  { id: 'learn', label: 'Learn to code', blurb: 'Explanations, guardrails, small steps.' },
];

export const COMBOS = [
  {
    id: 'claude-cowork-sonnet5',
    tool: 'Claude Cowork',
    toolType: 'desktop',
    model: 'Sonnet 5',
    provider: 'Anthropic',
    tasks: ['web-app', 'shopify-app', 'automation', 'data-analysis', 'legacy-refactor', 'learn'],
    minSkill: 'beginner',
    pricing: 'subscription',
    monthlyLow: 20,
    monthlyHigh: 20,
    setup: 1,
    surface: 'app',
    pros: ['Desktop app, works alongside your files', 'Handles multi-step tasks with little steering', 'Flat monthly price, no token math'],
    cons: ['Subscription, no free tier', 'Less control than a raw CLI'],
    guide: 'claude-cowork-setup',
    link: 'https://www.anthropic.com',
  },
  {
    id: 'claude-code-sonnet5',
    tool: 'Claude Code',
    toolType: 'cli',
    model: 'Sonnet 5',
    provider: 'Anthropic',
    tasks: ['web-app', 'shopify-app', 'automation', 'legacy-refactor', 'mobile-app', 'data-analysis'],
    minSkill: 'intermediate',
    pricing: 'subscription',
    monthlyLow: 20,
    monthlyHigh: 100,
    setup: 3,
    surface: 'terminal',
    pros: ['Agentic, edits across your whole repo', 'Terminal-native, scriptable', 'Strong on large refactors'],
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
    tasks: ['web-app', 'landing-page', 'shopify-app', 'legacy-refactor', 'mobile-app'],
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
    tasks: ['web-app', 'automation', 'legacy-refactor', 'data-analysis'],
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
    tasks: ['web-app', 'legacy-refactor', 'automation', 'shopify-app'],
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
    tasks: ['web-app', 'automation', 'landing-page', 'data-analysis'],
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
    tasks: ['web-app', 'landing-page', 'mobile-app', 'legacy-refactor'],
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
    tasks: ['web-app', 'landing-page', 'shopify-app'],
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
    tasks: ['web-app', 'landing-page'],
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
    tasks: ['automation', 'data-analysis', 'learn', 'landing-page'],
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
    tasks: ['web-app', 'automation', 'legacy-refactor', 'learn', 'mobile-app'],
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
export function rankCombos({ task, skill, budgetCap }) {
  const skillOrder = { beginner: 0, intermediate: 1, pro: 2 };
  const userSkill = skillOrder[skill];

  return COMBOS
    .filter((c) => c.tasks.includes(task))
    .filter((c) => c.monthlyLow <= budgetCap)
    .map((c) => {
      let score = 0;
      const notes = [];

      // Skill fit: penalise combos above the user's level, reward a clean match.
      const gap = skillOrder[c.minSkill] - userSkill;
      if (gap <= 0) score += 30;
      if (gap === 1) { score += 5; notes.push('A step above your level — doable, but expect a learning curve.'); }
      if (gap >= 2) { score -= 20; notes.push('Aimed at experienced developers; likely frustrating at your level.'); }

      // Budget fit: reward staying comfortably under the cap.
      if (c.monthlyHigh <= budgetCap) score += 20;
      else if (c.monthlyLow <= budgetCap) { score += 8; notes.push(`Can exceed your budget under heavy use (up to $${c.monthlyHigh}/mo).`); }

      // Ease of setup matters more for beginners.
      const easeWeight = skill === 'beginner' ? 4 : skill === 'intermediate' ? 2 : 1;
      score += (5 - c.setup) * easeWeight;

      // Free is a bonus when the user cares about budget.
      if (c.pricing === 'free' && budgetCap < Infinity) score += 6;

      return { ...c, score, notes };
    })
    .sort((a, b) => b.score - a.score);
}
