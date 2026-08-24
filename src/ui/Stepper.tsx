/**
 * Wizard stepper.
 *
 * Steps are buttons, not decoration. Someone who realises on step 3 that they
 * mis-mapped a column on step 1 should be able to go straight back to it rather
 * than pressing Back twice and losing their place.
 *
 * Forward movement is bounded by `furthest` — the highest step reached so far.
 * You can jump back and forth across work you have already done, but you cannot
 * skip ahead into a step whose inputs do not exist yet. A stepper that lets you
 * land on "Summary" before a BoM is uploaded is offering a dead end.
 *
 * Each step states its own status to screen readers, so "where am I and what is
 * left" does not depend on seeing the tick marks.
 */
export function Stepper({ steps, value, furthest = value, onChange, numbered = true }: {
  steps: { label: string; text?: string }[];
  value: number;
  /** Highest step reached. Steps beyond this are not yet reachable. */
  furthest?: number;
  onChange?: (i: number) => void;
  /**
   * Set false when the labels already carry their own numbers, as Run Quotation's
   * do ("1 - Config BoM"). Otherwise the dot repeats the label and every step
   * reads "① 1 - …", which looks like a rendering fault rather than a design.
   */
  numbered?: boolean;
}) {
  return (
    <ol className="vy-stepper">
      {steps.map((s, i) => {
        /* Completion is measured against `furthest`, not `value`. Deriving it
           from the current step meant that stepping BACK re-marked finished
           work as "todo" — the stepper appeared to forget what you had done
           the moment you went to check something. */
        const state = i === value ? 'current' : i < furthest ? 'done' : 'todo';
        const reachable = Boolean(onChange) && i <= furthest && i !== value;
        return (
          <li key={s.label} className="vy-step" data-state={state}>
            <button
              type="button"
              className="vy-step-btn"
              data-state-layer={reachable ? '' : undefined}
              data-reachable={reachable || undefined}
              aria-current={state === 'current' ? 'step' : undefined}
              disabled={!reachable}
              onClick={() => reachable && onChange?.(i)}
              title={
                i === value ? `Current step: ${s.label}`
                  : reachable ? `Go back to ${s.label}`
                  : `${s.label} — not reached yet`
              }
            >
              <span className="vy-step-dot" aria-hidden>
                {state === 'done'
                  ? <svg viewBox="0 0 16 16" width="12" height="12">
                      <path d="M3 8.5 6.2 11.5 13 4.5" fill="none" stroke="currentColor"
                            strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  : numbered ? i + 1 : <span className="vy-step-pip" />}
              </span>
              <span className="vy-step-labels">
                <span className="vy-step-label">{s.label}</span>
                {s.text && <span className="vy-step-text">{s.text}</span>}
              </span>
              <span className="vy-sr-only">
                {state === 'done' ? ' — completed' : state === 'current' ? ' — current step' : ' — not reached yet'}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
