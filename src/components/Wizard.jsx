import { useState, useMemo } from 'react';
import { TASKS, BUDGETS, rankCombos } from '../data/combos.js';

const STEPS = ['task', 'budget', 'results'];

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

function ResultCard({ combo, rank, budgetCap }) {
  const cost = combo.monthlyLow === 0 && combo.monthlyHigh === 0
    ? 'Free'
    : combo.monthlyLow === combo.monthlyHigh
      ? `$${combo.monthlyLow}/mo`
      : `$${combo.monthlyLow}–${combo.monthlyHigh}/mo`;

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

function labelFor(p) {
  return { free: 'free', byok: 'bring your own key', subscription: 'subscription', usage: 'pay per use' }[p];
}
function setupWord(n) { return ['', 'one click', 'quick', 'moderate', 'involved', 'advanced'][n]; }

export default function Wizard() {
  const [step, setStep] = useState(0);
  const [task, setTask] = useState(null);
  const [budget, setBudget] = useState(null);

  const budgetCap = budget ? BUDGETS.find((b) => b.id === budget).cap : Infinity;

  const results = useMemo(() => {
    if (!task || !budget) return [];
    return rankCombos({ task, budgetCap });
  }, [task, budget, budgetCap]);

  const canNext = [task, budget][step] != null;
  const current = STEPS[step];

  const reset = () => { setStep(0); setTask(null); setBudget(null); };

  return (
    <div className="wizard">
      <ol className="wiz-progress" aria-label="Progress">
        {['Task', 'Budget', 'Matches'].map((l, i) => (
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
                onClick={() => setTask(t.id)}>
                <span className="opt-title">{t.label}</span>
                <span className="opt-blurb">{t.blurb}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {current === 'budget' && (
        <fieldset className="wiz-step">
          <legend>How much API spend can you take per month?</legend>
          <div className="opt-grid opt-grid-2">
            {BUDGETS.map((b) => (
              <button key={b.id} className={`opt ${budget === b.id ? 'is-sel' : ''}`}
                onClick={() => setBudget(b.id)}>
                <span className="opt-title">{b.label}</span>
                <span className="opt-blurb">{b.hint}</span>
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
          {results.length === 0
            ? <p className="wiz-empty">Nothing fits those constraints yet. Try raising your budget or picking a different task.</p>
            : results.map((c, i) => <ResultCard key={c.id} combo={c} rank={i} budgetCap={budgetCap} />)}
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
