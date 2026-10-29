import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { Icon } from './icons';
import { RocketLaunch } from './RocketLaunch';
import { SupportTicketDialog } from './SupportTicket';

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
 * WHY THE SAME ROCKET. It is the craft the reader met on the way in, back on
 * the pad: tilted, cracked, one fin lying beside it, smoking. The failure is
 * legible before the sentence is read — and a separate illustration for
 * failure would be a second thing to learn at the worst possible moment.
 *
 * WHY IT SAYS WHAT BROKE. "Something went wrong" is the error message that
 * tells the user to try the thing that just failed, with nothing to go on. The
 * three slots here are the three questions a person actually has: what failed,
 * what it means for them, and what they can do next.
 *
 * THREE WAYS OUT, NOT ONE — the customer's redesign of 29 Oct. Reload is the
 * first answer and was the only one; a screen that fails twice left the user
 * with a button that had already not worked. Back to Home lets them carry on
 * elsewhere, and the ticket turns "it is broken" into something with an id on
 * it. The error id is shown whether or not they send one, because the first
 * thing a colleague asks is which error.
 */
export function ErrorState({
  title, body, step = 0, errorId, screen = 'Voyager IQ',
  onRetry, retryLabel = 'Try again', children,
}: {
  /** What failed, in the user's words. Not an exception message. */
  title: string;
  /** What it means for them, and what it does not mean. */
  body: string;
  /** How far the launch got, when the failure happened during one. */
  step?: number;
  /** This failure's own id — `newErrorId()` at the point of catching it. */
  errorId?: string;
  /** The screen that failed, for the ticket's subject. */
  screen?: string;
  onRetry?: () => void;
  retryLabel?: string;
  /** A further way out, where a caller has one. */
  children?: React.ReactNode;
}) {
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketNo, setTicketNo] = useState('');
  const [copied, setCopied] = useState(false);

  return (
    /* `role="alert"` rather than `status`: this one interrupts. It is announced
       as soon as it renders, because a person who cannot see it has otherwise
       been left on a screen that stopped responding for no stated reason. */
    <div className="vy-errorstate" role="alert">
      <RocketLaunch step={step} state="error" />
      <h2 className="vy-errorstate-title">{title}</h2>
      <p className="vy-errorstate-body">{body}</p>
      <div className="vy-errorstate-actions">
        {onRetry && <Button variant="filled" onClick={onRetry}>{retryLabel}</Button>}
        {/* A route, not a reload: the rest of the app is still running, and
            reloading the whole document to leave one broken screen throws away
            everything else the user has open. */}
        <Button asChild><Link to="/">Back to Home</Link></Button>
        {children}
      </div>

      {errorId && (
        <div className="vy-errorstate-support">
          {ticketNo ? (
            /* The confirmation replaces the offer rather than joining it —
               two lines, one saying "send a ticket" and one saying "ticket
               sent", is a screen arguing with itself. */
            <p className="vy-errorstate-sent">
              <span className="vy-ok-dot" aria-hidden="true"><Icon name="check" size={11} /></span>
              Ticket <strong>{ticketNo}</strong> sent. You’ll get updates by email.
            </p>
          ) : (
            <p className="vy-errorstate-help">
              Still not working?
              <button type="button" className="vy-link" onClick={() => setTicketOpen(true)}>
                Send a support ticket
              </button>
            </p>
          )}

          <p className="vy-errorstate-eid">
            Error ID <strong className="vy-code">{errorId}</strong>
            {/* Copy rather than select-and-drag, because this number's whole
                job is to be pasted into a message to someone else. */}
            <button type="button" className="vy-link"
                    onClick={() => {
                      navigator.clipboard?.writeText(errorId).catch(() => {});
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </p>

          <SupportTicketDialog
            open={ticketOpen} errorId={errorId} screen={screen}
            onClose={() => setTicketOpen(false)}
            onSent={setTicketNo}
          />
        </div>
      )}
    </div>
  );
}
