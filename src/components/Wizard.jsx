import { useState, useMemo, useEffect, useRef } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { TASKS, VOLUME_LEVELS, rankCombos } from '../data/combos.js';
import { trackEvent } from '../lib/analytics.js';

const STEPS = ['task', 'volume', 'results'];

function formatCost(n) {
  if (n === 0) return 'Free';
  return n < 10 ? `$${n.toFixed(2)}/mo` : `$${Math.round(n)}/mo`;
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
  const [state, formspreeSubmit] = useForm(formId);

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
  const [volume, setVolume] = useState(null);
  const startedRef = useRef(false);

  const results = useMemo(() => {
    if (!task || !volume) return [];
    return rankCombos({ task, volume });
  }, [task, volume]);

  const canNext = [task, volume][step] != null;
  const current = STEPS[step];

  useEffect(() => {
    if (current === 'results') trackEvent('calculator_completed');
  }, [step]);

  const selectTask = (id) => {
    if (!startedRef.current) { startedRef.current = true; trackEvent('calculator_started'); }
    setTask(id);
  };

  const reset = () => { setStep(0); setTask(null); setVolume(null); };

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

      {current === 'volume' && (
        <fieldset className="wiz-step">
          <legend>How much do you actually use AI coding tools?</legend>
          <div className="opt-grid opt-grid-2">
            {VOLUME_LEVELS.map((v) => (
              <button key={v.id} className={`opt ${volume === v.id ? 'is-sel' : ''}`}
                onClick={() => setVolume(v.id)}>
                <span className="opt-title">{v.label}</span>
                <span className="opt-blurb">{v.hint}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {current === 'results' && (
        <div className="wiz-results">
          <div className="wiz-results-head">
            <h2>{results.length} match{results.length === 1 ? '' : 'es'} for your build</h2>
            <button className="btn btn-ghost" onClick={reset}>Start over</button>
          </div>
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
