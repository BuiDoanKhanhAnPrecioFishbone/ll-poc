import type { ReactNode } from 'react';

/**
 * Her **Conversation** and **Notes**, which she specifies as the same shape —
 * *"Notes: As Conversation"* — differing only in what sits above the list.
 *
 * One component for both, because the day they drift is the day a user has
 * to learn two reading patterns for the same thing.
 */

/**
 * Initials in a circle, 28px — her size.
 *
 * The CLASS is `vy-avatar`, which this system already had and five files
 * already use; this is the first shared component for it. `PeoplePicker` has
 * a private one of its own that predates this and is left alone.
 */
export function Avatar({ name }: { name: string }) {
  /* First letter of the first two words: "Quality Lead" → QL, her example.
     A single-word name gives one letter rather than two from one word, which
     reads as a typo. */
  const initials = name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return <span className="vy-avatar" aria-hidden>{initials}</span>;
}

export function Message({ author, time, children, email, outside }: {
  author: string;
  /** "03:20 PM" in her example; whatever the region's clock gives here. */
  time: ReactNode;
  children: ReactNode;
  /** An email rather than a message: To and Subject sit above the body. */
  email?: { to: string; subject: string };
  /** The sender is outside this company — her warning tint, as a tag. */
  outside?: boolean;
}) {
  return (
    <article className="vy-msg">
      <Avatar name={author} />
      <div className="vy-msg-body">
        <p className="vy-msg-head">
          <span className="vy-msg-author">{author}</span>
          <span className="vy-msg-time">{time}</span>
          {outside && <span className="vy-msg-outside">Outside sender</span>}
        </p>
        {email && (
          <p className="vy-msg-email">
            <span>To: {email.to}</span>
            <span>Subject: {email.subject}</span>
          </p>
        )}
        <div className="vy-msg-text">{children}</div>
      </div>
    </article>
  );
}

/**
 * A status change, which she draws as "small grey lines" rather than as a
 * message. They are not something anyone said, so giving them an avatar and
 * a name would make the thread look busier than the conversation was.
 */
export function StatusLine({ children }: { children: ReactNode }) {
  return <p className="vy-msg-status">{children}</p>;
}

export function Conversation({ toolbar, children }: {
  /** The editor and its buttons — Send Message, New Email — or Add Note. */
  toolbar?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="vy-conversation">
      {toolbar && <div className="vy-conversation-top">{toolbar}</div>}
      <div className="vy-conversation-list">{children}</div>
    </section>
  );
}
