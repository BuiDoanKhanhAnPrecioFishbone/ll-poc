import { Button } from './Button';
import { RocketJourney } from './RocketJourney';

/**
 * The third state.
 *
 * Audit finding T5 says loading, empty and error are three distinct states and
 * that the live system conflates the first two. This prototype had the same
 * gap from the other end: `app.css` has carried a comment block headed
 * `--- Error state ---` since the loading state was built, with the sentence
 * "The third of the three" under it and **no rule beneath it at all**. The
 * state was asserted in a comment for weeks and never drawn.
 *
 * WHY THE SAME ROCKET. It is stopped, not a different picture: engine out,
 * crosses for eyes, two puffs of smoke, the destination dimmed. The reader
 * has already met this craft on the way in, so the failure is legible before
 * the sentence is read — and a separate illustration for failure would be a
 * second thing to learn at the worst possible moment.
 *
 * WHY IT SAYS WHAT BROKE. "Something went wrong" is the error message that
 * tells the user to try the thing that just failed, with nothing to go on. The
 * three slots here are the three questions a person actually has: what failed,
 * what it means for them, and what they can do next. Only the first is ours to
 * fill in generically; the other two belong to the caller.
 */
export function ErrorState({
  title, body, step = 0, onRetry, retryLabel = 'Try again', children,
}: {
  /** What failed, in the user's words. Not an exception message. */
  title: string;
  /** What it means for them, and what it does not mean. */
  body: string;
  /** How far the journey got, when the failure happened during one. */
  step?: number;
  onRetry?: () => void;
  retryLabel?: string;
  /** A second way out — a link back, a support address. */
  children?: React.ReactNode;
}) {
  return (
    /* `role="alert"` rather than `status`: this one interrupts. It is announced
       as soon as it renders, because a person who cannot see it has otherwise
       been left on a screen that stopped responding for no stated reason. */
    <div className="vy-errorstate" role="alert">
      <RocketJourney step={step} state="error" />
      <h2 className="vy-errorstate-title">{title}</h2>
      <p className="vy-errorstate-body">{body}</p>
      <div className="vy-errorstate-actions">
        {onRetry && <Button variant="filled" onClick={onRetry}>{retryLabel}</Button>}
        {children}
      </div>
    </div>
  );
}
