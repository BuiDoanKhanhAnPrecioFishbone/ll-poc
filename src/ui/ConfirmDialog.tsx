import { Dialog } from './Overlays';
import { Button } from './Button';

/**
 * One question, one consequence, two verbs.
 *
 * `docs/modal-patterns.md` already describes this shape — "a confirmation is
 * `md` because it holds one sentence" — and every confirmation in the app was
 * still being assembled by hand from `Dialog` + two `Button`s. Two more arrived
 * with the RFQ's Confirm and Cancel actions, which made four hand-built copies
 * of the same three rules, so the rules live here now:
 *
 * 1. THE BUTTON SAYS THE VERB. Not "Yes"/"OK" — a dialog answered by "Yes" has
 *    to be re-read to find out what was agreed to, and the answer is usually
 *    read second. `Cancel RFQ` and `Confirm RFQ` are unambiguous on their own.
 * 2. THE BODY STATES THE CONSEQUENCE, not the action. The title already says
 *    what is about to happen; the sentence below it is for what happens next
 *    and what it costs.
 * 3. DISMISS IS "Keep editing"-shaped, never a bare "Cancel". On a dialog whose
 *    confirm button is itself the word Cancel, a second Cancel is a coin toss.
 */
export function ConfirmDialog({
  title, body, confirmLabel, dismissLabel = 'Go back', tone = 'default',
  onConfirm, onClose,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  dismissLabel?: string;
  tone?: 'default' | 'danger';
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog
      open
      size="md"
      title={title}
      onClose={onClose}
      actions={<>
        <Button onClick={onClose}>{dismissLabel}</Button>
        <Button variant={tone === 'danger' ? 'danger' : 'filled'} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </>}
    >
      <p className="vy-dialog-lead">{body}</p>
    </Dialog>
  );
}
