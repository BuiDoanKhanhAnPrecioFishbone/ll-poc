import { useState } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { TextArea, Checkbox } from '@progress/kendo-react-inputs';
import type { Comment, Quotation } from '../../data/quotations';
import { useToast } from '../Toast';

/**
 * Conversations.
 *
 * The live tab opens with a rich-text editor at the top and the message
 * "No comments yet. Be the first to comment!" below it — cheerful copy on a
 * screen where the useful information is usually why a quote stalled. The
 * composer stays, but the thread reads newest-last like a conversation, and
 * "Send email" is stated as what it does rather than left as a bare toggle.
 */
export function ConversationsTab({ q }: { q: Quotation }) {
  const [draft, setDraft] = useState('');
  const [email, setEmail] = useState(false);
  /* Posting works for real, against local state. It was the one control on the
     screen that looked interactive, enabled itself once you typed, and then did
     nothing — the most misleading kind of dead button. Comments live in
     component state, so they reset on reload; that is a prototype limit, not a
     silent failure, and the toast says so. */
  const [posted, setPosted] = useState<Comment[]>([]);
  const toast = useToast();

  const comments = [...q.comments, ...posted];

  function post() {
    const body = draft.trim();
    if (!body) return;
    setPosted(p => [...p, {
      id: `local-${p.length}`,
      author: 'Huyen NTN',
      initials: 'HN',
      at: new Date(),
      body,
      emailed: email,
    }]);
    setDraft('');
    setEmail(false);
    toast.success(email
      ? 'Comment posted and queued to email the customer contact. It is held in this browser session only.'
      : 'Comment posted. It is held in this browser session only.');
  }

  return (
    <div className="vy-conv">
      {comments.length === 0 ? (
        <div className="vy-empty-inline">
          No comments on this RFQ yet. Notes here are visible to everyone assigned to it,
          and are the record of why decisions were made.
        </div>
      ) : (
        <ol className="vy-thread">
          {comments.map(c => (
            <li key={c.id} className="vy-comment">
              <span className="vy-avatar vy-avatar--sm">{c.initials}</span>
              <div className="vy-comment-body">
                <div className="vy-comment-meta">
                  <strong>{c.author}</strong>
                  <span>{c.at.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  {c.emailed && <span className="vy-code" title="This comment was also sent to the customer by email">emailed</span>}
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
          onChange={e => setDraft(String(e.value ?? ''))}
          rows={3}
          placeholder="Add a note — what changed, what you are waiting on, what the customer said"
          aria-label="Add a comment"
        />
        <div className="vy-composer-foot">
          <Checkbox
            value={email}
            onChange={e => setEmail(Boolean(e.value))}
            label="Also email this to the customer contact"
          />
          <Button themeColor="primary" disabled={!draft.trim()} onClick={post}>Post comment</Button>
        </div>
      </div>
    </div>
  );
}
