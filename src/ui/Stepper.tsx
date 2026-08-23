/**
 * Wizard stepper. Steps are buttons: a user who realises they mis-mapped a
 * column on step 1 should be able to go straight back to it, not press Back
 * three times. Completed steps show a check, so "where am I and what is left"
 * is answerable at a glance.
 */
export function Stepper({ steps, value, onChange }: {
  steps: { label: string; text?: string }[];
  value: number;
  onChange?: (i: number) => void;
}) {
  return (
    <ol className="vy-stepper">
      {steps.map((s, i) => {
        const state = i < value ? 'done' : i === value ? 'current' : 'todo';
        return (
          <li key={s.label} className="vy-step" data-state={state}>
            <button type="button" className="vy-step-btn" data-state-layer
                    aria-current={state === 'current' ? 'step' : undefined}
                    disabled={!onChange || i > value}
                    onClick={() => onChange?.(i)}>
              <span className="vy-step-dot" aria-hidden>
                {state === 'done'
                  ? <svg viewBox="0 0 16 16" width="12" height="12"><path d="M3 8.5 6.2 11.5 13 4.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  : i + 1}
              </span>
              <span className="vy-step-labels">
                <span className="vy-step-label">{s.label}</span>
                {s.text && <span className="vy-step-text">{s.text}</span>}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
