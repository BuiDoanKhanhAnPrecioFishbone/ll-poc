import { useState } from 'react';
import { Button } from '../../ui/Button';
import { RichText } from '../../ui/RichText';
import { useToast } from '../../ui/Toast';
import type { Comment, Quotation } from '../../data/quotations';

const when = (d: Date) => d.toLocaleString('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

/**
 * Conversations.
 *
 * The live tab offers a CHOICE between "Comment" and "Send Email", then a rich
 * text editor with undo, redo, bold, italic, underline, strikethrough, both
 * list types, indent and outdent.
 *
 * This had a plain textarea and an "also email this" CHECKBOX, which was the
 * wrong shape twice over. A comment written in the real system can contain
 * formatting, so a plain box shows a formatted note as unstyled text. And
 * emailing is not a modifier on a comment — an internal note and a message to
 * the customer are different acts with different consequences, and a checkbox
 * makes the second look like a variation on the first.
 *
 * The empty state also differs. The live copy is "No comments yet. Be the first
 * to comment!" — cheerful, on a tab whose useful content is usually why a quote
 * stalled. It says what the space is for instead.
 */
type Mode = 'comment' | 'email';

export function ConversationsTab({ q }: { q: Quotation }) {
  const [draft, setDraft] = useState('');
  const [mode, setMode] = useState<Mode>('comment');
  const email = mode === 'email';
  /* Posting works against local state. It was previously the one control that
     looked interactive, enabled itself once you typed, then did nothing — the
     most misleading kind of dead button. Session-only, and the toast says so. */
  const [posted, setPosted] = useState<Comment[]>([]);
  const toast = useToast();

  const comments = [...q.comments, ...posted];

  /* Strips tags to decide whether anything was actually typed. An editor left
     empty still holds "<br>" or "<p></p>", so a length check on the HTML would
     enable the button on a blank note. */
  const hasText = draft.replace(/<[^>]*>/g, '').trim().length > 0;

  function post() {
    if (!hasText) return;
    setPosted(p => [...p, {
      id: `local-${p.length}`, author: 'Huyen NTN', initials: 'HN',
      at: new Date(), body: draft, emailed: email,
    }]);
    setDraft('');
    /* The mode does NOT reset. Someone corresponding with a customer sends
       several messages in a row, and silently dropping back to "Comment" after
       each one is how an intended email becomes an internal note nobody sees. */
    toast.success(email
      ? `Queued to ${q.customerContact || 'the customer contact'}. Held in this browser session only.`
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
                {/* Comments may carry formatting from the rich editor. */}
                <div className="vy-comment-text" dangerouslySetInnerHTML={{ __html: c.body }} />
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="vy-composer" data-mode={mode}>
        {/* Two modes, not a checkbox. The choice comes FIRST because it changes
            who reads what you are about to write. */}
        <div className="vy-conv-modes" role="tablist" aria-label="What to send">
          {(['comment', 'email'] as Mode[]).map(m => (
            <button key={m} type="button" role="tab" className="vy-conv-mode"
                    aria-selected={mode === m} onClick={() => setMode(m)}>
              {m === 'comment' ? 'Comment' : 'Send Email'}
            </button>
          ))}
        </div>

        {/* Who sees it, stated before it is written rather than after it is
            sent. An internal note and a customer email look identical in a
            thread; the moment to be clear is now. */}
        <p className="vy-conv-audience">
          {email
            ? <>Goes to <strong>{q.customerContact || 'the customer contact'}</strong> at {q.customer}, and is recorded here.</>
            : <>Visible to everyone assigned to this RFQ. Not sent to the customer.</>}
        </p>

        <RichText
          value={draft}
          onChange={setDraft}
          ariaLabel={email ? 'Email to the customer' : 'Add a comment'}
          placeholder={email
            ? 'Write to the customer — what you need from them, or what you are confirming'
            : 'Add a note — what changed, what you are waiting on, what the customer said'}
        />

        <div className="vy-composer-foot">
          <Button variant="filled" disabled={!hasText} onClick={post}>
            {email ? 'Send email' : 'Post comment'}
          </Button>
        </div>
      </div>
    </div>
  );
}
