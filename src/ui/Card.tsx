import type { ReactNode } from 'react';

/**
 * A titled box. The BA's principles of 16 Nov 2026 give it a border, a
 * radius, a header band — and **no shadow**, which is the line that makes it
 * a card rather than a panel.
 *
 * That rule is worth keeping deliberately. A card sits IN the page; a shadow
 * says a thing floats ABOVE the page, and this system spends that signal on
 * popups, where it means "this will go away". A card that borrows it is
 * promising something it cannot do.
 */
export function Card({ title, aside, children, className = '' }: {
  title: ReactNode;
  /** Pinned to the right of the header — a total, a count, one small button. */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`vy-card ${className}`.trim()}>
      <header className="vy-card-head">
        <h3 className="vy-card-title">{title}</h3>
        {aside && <div className="vy-card-aside">{aside}</div>}
      </header>
      <div className="vy-card-body">{children}</div>
    </section>
  );
}

/**
 * Her **Split card**: one card holding two halves, each with its own group
 * heading, 28px apart and **no divider**.
 *
 * No divider is the interesting half of that. The gap is already doing the
 * separating, and a rule down the middle of a card makes two cards that are
 * pretending to be one — at which point they should be two cards.
 */
export function SplitCard({ title, aside, children, className = '' }: {
  title: ReactNode; aside?: ReactNode;
  /** Exactly two children: the halves. */
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card title={title} aside={aside} className={`vy-card--split ${className}`.trim()}>
      {children}
    </Card>
  );
}
