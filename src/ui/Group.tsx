import { useId, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * Her **Group**: a heading, a rule beside it, and fields under it.
 *
 * "No box, no fill" is the whole specification, and it is the reason this is
 * not a [Card]. A group divides ONE surface into readable parts; a card is a
 * surface of its own. Reaching for a card where a group belongs is how a form
 * ends up as a column of boxes inside a box.
 */
export function Group({ title, columns = 3, children }: {
  title?: ReactNode;
  /** Her layout is three columns, 28px apart. One or two for a narrow form. */
  columns?: 1 | 2 | 3;
  children: ReactNode;
}) {
  return (
    <section className="vy-group">
      {title && <SectionHeading>{title}</SectionHeading>}
      <div className="vy-group-fields" data-columns={columns}>{children}</div>
    </section>
  );
}

/**
 * The same heading on its own — her **Section heading**, which she specifies
 * as "As Group heading" and nothing more. Title Case, a rule to the right.
 *
 * The rule is not decoration: it is what stops a 12px heading from reading as
 * a field label, which at this size it otherwise would.
 */
export function SectionHeading({ children }: { children: ReactNode }) {
  return <h3 className="vy-section-heading">{children}</h3>;
}

/**
 * Her **Collapsible group**: a group whose heading carries ▸ / ▾.
 *
 * Open by default, and that is a decision rather than a default. A collapsed
 * group hides fields from someone who does not know they are there — fine for
 * *Advanced Settings*, her own example, and wrong for anything a user has to
 * fill in. Call sites that want it shut say so.
 */
export function CollapsibleGroup({ title, columns = 3, defaultOpen = true, children }: {
  title: ReactNode;
  columns?: 1 | 2 | 3;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <section className="vy-group">
      {/* A real button, so it is reachable and announced as expandable. The
          heading element stays outside it: a heading that IS a button is
          announced as a button and lost from the heading outline. */}
      <h3 className="vy-section-heading vy-section-heading--toggle">
        <button type="button" className="vy-group-toggle"
                aria-expanded={open} aria-controls={id}
                onClick={() => setOpen(v => !v)}>
          <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden
               className="vy-group-caret" data-open={open || undefined}>
            <path d="M4 2.5 8 6l-4 3.5" fill="none" stroke="currentColor"
                  strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {title}
        </button>
      </h3>
      <div id={id} className="vy-group-fields" data-columns={columns} hidden={!open}>
        {children}
      </div>
    </section>
  );
}
