// Fires a GoatCounter custom event if GoatCounter is loaded (see Base.astro —
// the script only loads when PUBLIC_GOATCOUNTER_URL is set, so this is a
// no-op in local dev). The script loads `async`, so window.goatcounter may
// not exist yet on the very first call — poll briefly, then give up quietly
// (e.g. an ad-blocker killed it) so a missing/blocked script can never break
// the calculator.
const POLL_MS = 100;
const MAX_ATTEMPTS = 20; // ~2s

function isReady() {
  return typeof window.goatcounter === 'object' && typeof window.goatcounter.count === 'function';
}

export function trackEvent(name) {
  if (typeof window === 'undefined') return;

  if (isReady()) {
    window.goatcounter.count({ path: name, event: true });
    return;
  }

  let attempts = 0;
  const timer = setInterval(() => {
    attempts += 1;
    if (isReady()) {
      clearInterval(timer);
      window.goatcounter.count({ path: name, event: true });
    } else if (attempts >= MAX_ATTEMPTS) {
      clearInterval(timer);
    }
  }, POLL_MS);
}
