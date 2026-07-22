// Fires a Plausible custom event if Plausible is loaded (see Base.astro — the
// script only loads when PUBLIC_PLAUSIBLE_DOMAIN is set, so this is a no-op
// in local dev). Never throws, so a missing/blocked analytics script can't
// break the calculator.
export function trackEvent(name, props) {
  if (typeof window === 'undefined' || typeof window.plausible !== 'function') return;
  window.plausible(name, props ? { props } : undefined);
}
