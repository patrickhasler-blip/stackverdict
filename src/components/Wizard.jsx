import { useState, useMemo, useEffect, useRef } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { TASKS, INTENSITY_HOURS_PER_DAY, rankCombos } from '../data/combos.js';
import { trackEvent } from '../lib/analytics.js';

const STEPS = ['task', 'intensity', 'results'];

function formatCost(n) {
  if (n === 0) return 'Free';
  return n < 10 ? `$${n.toFixed(2)}/mo` : `$${Math.round(n)}/mo`;
}
function round1(n) { return Math.round(n * 10) / 10; }

function confidenceNote(confidence) {
  return {
    verified: 'Provider-confirmed figure.',
    estimated: "Unofficial estimate — the provider doesn't publish an exact number.",
    vague: "Provider's own info is unclear or inconsistent — treat this as a rough guess.",
  }[confidence] ?? '';
}

function Meter({ label, value, max, unit }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="meter">
      <div className="meter-head">
        <span>{label}</span>
        <span className="meter-val">{unit}</span>
      </div>
      <div className="meter-track"><div className="meter-fill" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function LimitPanel({ status, combo }) {
  if (!status) return null;

  if (status.confidence === 'unverifiable') {
    return (
      <div className="rescard-limit rescard-limit-unverifiable">
        <p><strong>Limit unverifiable.</strong> {status.basis}{' '}
          <a href={status.sourceUrl} target="_blank" rel="noopener">Check current plans →</a></p>
      </div>
    );
  }

  if (status.thresholdHoursPerDay == null) {
    return (
      <div className="rescard-limit rescard-limit-vague">
        <p><strong>Limit unclear.</strong> {status.basis}{' '}
          <a href={status.sourceUrl} target="_blank" rel="noopener">Check current limit →</a></p>
      </div>
    );
  }

  const thresholdLabel = `~${round1(status.thresholdHoursPerDay)} hrs/day`;
  const note = confidenceNote(status.confidence);

  if (!status.overLimit) {
    return (
      <div className="rescard-limit rescard-limit-ok">
        <p>Comfortably within this plan's typical limit at your intensity — roughly good up to <strong>{thresholdLabel}</strong>. {note}</p>
      </div>
    );
  }

  return (
    <div className="rescard-limit rescard-limit-warn">
      <p className="rescard-limit-headline">⚠ At your intensity, you'll likely outrun this plan's limit — roughly good up to <strong>{thresholdLabel}</strong>. {note}</p>
      <div className="rescard-limit-cols">
        <div>
          <span className="rescard-limit-label">Wait time</span>
          {status.wait
            ? <p>Roughly <strong>~{status.wait.timesPerWeek}×/week</strong>, blocked for about <strong>{round1(status.wait.hoursLow)}–{round1(status.wait.hoursHigh)}h</strong> until the window resets.</p>
            : <p>No hard block — this plan just lets the cost rise instead (see next).</p>}
        </div>
        <div>
          <span className="rescard-limit-label">Extra cost to avoid waiting</span>
          {status.extraCostUsd != null
            ? <p>{status.overage.label}: roughly <strong>~${round1(status.extraCostUsd)}/mo</strong> more.</p>
            : <p>{status.overage?.label ?? 'Unclear — check the source.'}</p>}
        </div>
      </div>
      <p className="rescard-limit-source"><a href={status.sourceUrl} target="_blank" rel="noopener">Check {combo.tool}'s current limit →</a></p>
    </div>
  );
}

function ResultCard({ combo, rank }) {
  const isEstimate = combo.pricing === 'byok' || combo.pricing === 'usage';
  const cost = `${isEstimate && combo.actualCost > 0 ? '~' : ''}${formatCost(combo.actualCost)}`;

  return (
    <article className={`rescard ${rank === 0 ? 'is-top' : ''}`}>
      {rank === 0 && <div className="rescard-flag">✓ Our verdict</div>}
      <div className="rescard-main">
        <div className="rescard-id">
          <h3>{combo.tool}</h3>
          <p className="rescard-model">running {combo.model} · {combo.provider}</p>
        </div>
        <div className="rescard-price">
          <span className="rescard-price-val">{cost}</span>
          <span className="rescard-price-lab">{labelFor(combo.pricing)}</span>
        </div>
      </div>

      <div className="rescard-meters rescard-meters-single">
        <Meter label="Setup effort" value={combo.setup} max={5} unit={setupWord(combo.setup)} />
      </div>

      <div className="rescard-cols">
        <ul className="rescard-pros">
          {combo.pros.map((p) => <li key={p}>{p}</li>)}
        </ul>
        <ul className="rescard-cons">
          {combo.cons.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </div>

      {combo.notes.length > 0 && (
        <div className="rescard-notes">
          {combo.notes.map((n) => <p key={n}>{n}</p>)}
        </div>
      )}

      <LimitPanel status={combo.limitStatus} combo={combo} />

      <div className="rescard-foot">
        {combo.guide
          ? <a className="btn btn-primary" href={`/guides/${combo.guide}`}>Setup guide →</a>
          : <a className="btn btn-primary" href={combo.link} target="_blank" rel="noopener">Visit {combo.tool} →</a>}
        <a className="btn btn-ghost" href={`/compare/${combo.id}`}>Details</a>
      </div>
    </article>
  );
}

function EmailCapture() {
  const formId = import.meta.env.PUBLIC_FORMSPREE_FORM_ID;
  // useForm() throws if given a falsy id, so it needs a harmless placeholder
  // when unconfigured — the early return below means it's never submitted.
  const [state, formspreeSubmit] = useForm(formId || '_unconfigured');

  if (!formId) return null; // not configured (e.g. local dev) — don't show a dead-end form

  function handleSubmit(e) {
    trackEvent('email_submitted');
    formspreeSubmit(e);
  }

  if (state.succeeded) {
    return (
      <div className="email-capture">
        <p className="email-capture-done">Thanks — we'll be in touch once the deep-dive report is ready.</p>
      </div>
    );
  }

  return (
    <div className="email-capture">
      <form onSubmit={handleSubmit}>
        <h3>Want the deep-dive report?</h3>
        <p>Your optimal model mix per task, and your subscription-vs-API break-even point — as a PDF, once it's ready. This isn't built yet; leave your email and we'll notify you.</p>
        <div className="email-capture-row">
          <input type="email" name="email" required placeholder="you@example.com" aria-label="Email address" />
          <input type="hidden" name="source" value="stackverdict-calculator" />
          <button type="submit" className="btn btn-primary" disabled={state.submitting}>
            {state.submitting ? 'Sending…' : "I'm interested"}
          </button>
        </div>
        <ValidationError prefix="Email" field="email" errors={state.errors} />
        <label className="email-capture-consent">
          <input type="checkbox" required />
          I agree StackVerdict may email me when the deep-dive report is ready. See the <a href="/privacy">privacy policy</a>.
        </label>
      </form>
    </div>
  );
}

function labelFor(p) {
  return { free: 'free', byok: 'bring your own key', subscription: 'subscription', usage: 'pay per use' }[p];
}
function setupWord(n) { return ['', 'one click', 'quick', 'moderate', 'involved', 'advanced'][n]; }

export default function Wizard() {
  const [step, setStep] = useState(0);
  const [task, setTask] = useState(null);
  const [hoursPerDay, setHoursPerDay] = useState(INTENSITY_HOURS_PER_DAY.default);
  const startedRef = useRef(false);

  const results = useMemo(() => {
    if (!task) return [];
    return rankCombos({ task, hoursPerDay });
  }, [task, hoursPerDay]);

  const canNext = step === 0 ? task != null : true;
  const current = STEPS[step];

  useEffect(() => {
    if (current === 'results') trackEvent('calculator_completed');
  }, [step]);

  const selectTask = (id) => {
    if (!startedRef.current) { startedRef.current = true; trackEvent('calculator_started'); }
    setTask(id);
  };

  const reset = () => { setStep(0); setTask(null); setHoursPerDay(INTENSITY_HOURS_PER_DAY.default); };

  return (
    <div className="wizard">
      <ol className="wiz-progress" aria-label="Progress">
        {['Task', 'Usage', 'Matches'].map((l, i) => (
          <li key={l} className={i === step ? 'is-active' : i < step ? 'is-done' : ''}>
            <span className="wiz-dot">{i < step ? '✓' : i + 1}</span>{l}
          </li>
        ))}
      </ol>

      {current === 'task' && (
        <fieldset className="wiz-step">
          <legend>What are you building?</legend>
          <div className="opt-grid">
            {TASKS.map((t) => (
              <button key={t.id} className={`opt ${task === t.id ? 'is-sel' : ''}`}
                onClick={() => selectTask(t.id)}>
                <span className="opt-title">{t.label}</span>
                <span className="opt-blurb">{t.blurb}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {current === 'intensity' && (
        <fieldset className="wiz-step">
          <legend>How many hours a day do you actively use AI coding tools?</legend>
          <div className="wiz-slider">
            <input type="range" className="wiz-slider-input"
              min={INTENSITY_HOURS_PER_DAY.min} max={INTENSITY_HOURS_PER_DAY.max} step={INTENSITY_HOURS_PER_DAY.step}
              value={hoursPerDay} onChange={(e) => setHoursPerDay(Number(e.target.value))}
              aria-label="Hours per day of active AI coding tool use" />
            <div className="wiz-slider-value">{hoursPerDay} hrs/day</div>
            <p className="wiz-slider-hint">Active, hands-on-keyboard time with the tool — not just "it was open." A rough gut estimate is fine.</p>
          </div>
        </fieldset>
      )}

      {current === 'results' && (
        <div className="wiz-results">
          <div className="wiz-results-head">
            <h2>{results.length} match{results.length === 1 ? '' : 'es'} for your build</h2>
            <button className="btn btn-ghost" onClick={reset}>Start over</button>
          </div>
          <p className="wiz-limit-disclaimer">
            Subscription limits below are estimates — providers rarely publish exact numbers, and
            they change often. Treat them as ballpark guidance, not guarantees, and check the linked
            source before deciding.
          </p>
          {results.map((c, i) => <ResultCard key={c.id} combo={c} rank={i} />)}
          {results.length > 0 && <EmailCapture />}
        </div>
      )}

      {current !== 'results' && (
        <div className="wiz-nav">
          <button className="btn btn-ghost" disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}>Back</button>
          <button className="btn btn-primary" disabled={!canNext}
            onClick={() => setStep((s) => s + 1)}>
            {step === 1 ? 'See matches' : 'Next'}
          </button>
        </div>
      )}
    </div>
  );
}
