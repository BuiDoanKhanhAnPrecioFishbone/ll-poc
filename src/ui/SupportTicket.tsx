import { useState } from 'react';
import { Dialog } from './Overlays';
import { Button } from './Button';
import { TextArea } from './Field';
import { fmtDateTime } from './regional';

/**
 * Send a Support Ticket — the way out of an error that is not "try again".
 *
 * THE CUSTOMER'S SCREEN, 29 Oct. Our error state ended at Reload, which is the
 * right first answer and the wrong only one: a user whose screen fails twice
 * has nowhere to go, and the thing they would have to do by hand — find
 * someone, describe what broke, remember which screen it was — is exactly what
 * a program can do for them.
 *
 * WHAT IT ATTACHES, AND WHY THAT IS THE POINT. Error ID, screen, time and
 * browser go on the ticket without being asked for. Those four are what a
 * support engineer needs and what a cost estimator has no reason to know; the
 * one question left is the one only the person can answer — what were you
 * doing. The block is headed "Added for you" rather than hidden, because a
 * ticket that quietly collects details about the sender is a different thing
 * from one that shows them what it is sending.
 *
 * THE SEND IS NOT REAL, and this prototype has no helpdesk behind it. An asked
 * for it faked for now — the number is drawn here and no request leaves the
 * browser. The copy stays hers so the flow can be demonstrated whole; what
 * stands between this and a real ticket is one POST and the answer to "where
 * does it go", which is open question 12.
 */
export function SupportTicketDialog({ open, errorId, screen, onClose, onSent }: {
  open: boolean;
  errorId: string;
  /** The screen that failed, in the user's words — it prefills the subject. */
  screen: string;
  onClose: () => void;
  onSent: (ticketNo: string) => void;
}) {
  const [subject, setSubject] = useState(`Screen stopped loading: ${screen}`);
  const [detail, setDetail] = useState('');

  return (
    <Dialog
      open={open} onClose={onClose} size="md"
      title="Send a Support Ticket"
      actions={<>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="filled" disabled={!subject.trim()}
                title={subject.trim() ? undefined : 'A ticket needs a subject'}
                onClick={() => { onSent(ticketNumber()); onClose(); }}>
          Send Ticket
        </Button>
      </>}
    >
      <div className="vy-ticket">
        {/* The asterisk is the app's own required marker, red because the
            customer's Testing Guideline says red — a `required` attribute
            alone marks the field for the browser and for nobody looking at
            it. */}
        <label className="vy-field-control">
          <span className="vy-field-label">
            Subject<span className="vy-required" aria-hidden>*</span>
          </span>
          <input className="vy-input" required value={subject}
                 onChange={e => setSubject(e.target.value)} />
        </label>
        <TextArea label="What were you doing?" rows={3} value={detail}
                  onChange={e => setDetail(e.target.value)}
                  placeholder="For example: opened a quote from Project Requirement RFQ0000000329" />

        <section className="vy-ticket-auto">
          <h3>Added for you</h3>
          <dl>
            <dt>Error ID</dt><dd><span className="vy-code">{errorId}</span></dd>
            <dt>Screen</dt><dd>{screen}</dd>
            <dt>Time</dt><dd>{fmtDateTime(new Date())}</dd>
            <dt>Browser</dt><dd>{browserName()}</dd>
          </dl>
        </section>
      </div>
    </Dialog>
  );
}

/**
 * The browser, by the four names a support engineer acts on.
 *
 * EVERY ONE OF THEM CLAIMS TO BE THE OTHERS. Edge's user agent contains
 * "Chrome" and "Safari"; Chrome's contains "Safari". So the test runs from the
 * most specific to the least, and Safari — which claims nothing — is last.
 */
export function browserName(ua = navigator.userAgent): string {
  if (/Edg\//.test(ua)) return 'Edge';
  if (/Chrome\//.test(ua)) return 'Chrome';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/Safari\//.test(ua)) return 'Safari';
  return 'Other';
}

/** `HD-1056`, in her format. Drawn here because nothing issues one yet. */
const ticketNumber = () => `HD-${1040 + Math.floor(Math.random() * 60)}`;

/**
 * `VIQ-7F3A2C` — one per failure, so two people reporting the same screen are
 * not reporting the same incident.
 *
 * Uppercase hex without the vowel-shaped digits is deliberate: this number gets
 * read down a phone line, and 0/O and 1/I are where that goes wrong. `crypto`
 * where it exists, because two users failing in the same millisecond is not a
 * reason to hand them one id.
 */
export function newErrorId(): string {
  const bytes = new Uint8Array(3);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < 3; i++) bytes[i] = Math.floor(Math.random() * 256);
  const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  return `VIQ-${hex}`;
}
