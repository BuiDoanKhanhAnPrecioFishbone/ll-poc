import { useState } from 'react';
import { Button } from '../../ui/Button';
import { TextArea } from '../../ui/Field';
import { Checkbox } from '../../ui/Overlays';
import { useToast } from '../../ui/Toast';
import type { Comment, Quotation } from '../../data/quotations';

const when = (d: Date) => d.toLocaleString('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

/**
 * Conversations.
 *
 * The live tab opens with a rich-text editor and "No comments yet. Be the first
 * to comment!" — cheerful copy on a screen whose useful content is usually why
 * a quote stalled. The thread reads oldest-first like a conversation, and the
 * email toggle says what it does rather than being a bare switch.
 */
export function ConversationsTab({ q }: { q: Quotation }) {
  const [draft, setDraft] = useState('');
  const [email, setEmail] = useState(false);
  /* Posting works against local state. It was previously the one control that
     looked interactive, enabled itself once you typed, then did nothing — the
     most misleading kind of dead button. Session-only, and the toast says so. */
  const [posted, setPosted] = useState<Comment[]>([]);
  const toast = useToast();

  const comments = [...q.comments, ...posted];

  function post() {
    const body = draft.trim();
    if (!body) return;
    setPosted(p => [...p, {
      id: `local-${p.length}`, author: 'Huyen NTN', initials: 'HN',
      at: new Date(), body, emailed: email,
    }]);
    setDraft('');
    setEmail(false);
    toast.success(email
      ? 'Comment posted and queued to email the customer contact. Held in this browser session only.'
      : 'Comment posted. Held in this browser session only.');
  }

  return (
    <div className="vy-conv">
      {comments.length === 0 ? (
        <div className="vy-empty-inline">
          No comments on this RFQ yet. Notes here are visible to everyone assigned to it, and
          are the record of why decisions were made.
        </div>
      ) : (
        <ol className="vy-thread">
          {comments.map(c => (
            <li key={c.id} className="vy-comment">
              <span className="vy-avatar vy-avatar--sm">{c.initials}</span>
              <div className="vy-comment-body">
                <div className="vy-comment-meta">
                  <strong>{c.author}</strong>
                  <span>{when(c.at)}</span>
                  {c.emailed && <span className="vy-pill" title="Also sent to the customer by email">emailed</span>}
                </div>
                <p>{c.body}</p>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="vy-composer">
        <TextArea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          rows={3}
          aria-label="Add a comment"
          placeholder="Add a note — what changed, what you are waiting on, what the customer said"
        />
        <div className="vy-composer-foot">
          <Checkbox checked={email} onCheckedChange={setEmail}
                    label="Also email this to the customer contact" />
          <Button variant="filled" disabled={!draft.trim()} onClick={post}>Post comment</Button>
        </div>
      </div>
    </div>
  );
}
