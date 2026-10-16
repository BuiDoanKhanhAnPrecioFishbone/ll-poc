import { useMemo, useState } from 'react';
import type { ColumnSpec } from '../components/column-model';

/**
 * Which columns a grid shows, remembered per user.
 *
 * ASKED FOR by the VIQ UI Standard, 14 Oct 2026: "Columns button on every list
 * or grid with 3+ columns; key and editable columns 'always shown'. The choice
 * is saved per user." The list screens have had a chooser since August; the Run
 * Quotation grids, which are the widest in the product, had none — Review BoM
 * scrolls past ten columns and Quoting past twenty-one, and neither let the
 * user put any of them away.
 *
 * LOCKED = FROZEN, and that is not a shortcut. A frozen column is the one the
 * grid keeps on screen while the rest scroll, which is the same judgement as
 * "this is how you know which row you are reading" — the standard's "key
 * column". Deriving one from the other means they cannot disagree, and it
 * removes the failure where hiding column 3 of a 7-column frozen block leaves
 * the freeze counting a column that is no longer there.
 */
export function useColumnChoice<T>(
  columns: ColumnSpec<T>[],
  { locked, storageKey }: { locked: number; storageKey: string },
) {
  const key = (c: ColumnSpec<T>) => c.id ?? String(c.field);

  const [hidden, setHidden] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return new Set<string>(saved ? JSON.parse(saved) : []);
    } catch { return new Set<string>(); }   /* blocked storage, or someone's edit */
  });

  const persist = (next: Set<string>) => {
    setHidden(next);
    try { localStorage.setItem(storageKey, JSON.stringify([...next])); } catch { /* not worth failing for */ }
  };

  const shown = useMemo(
    () => columns.filter((c, i) => i < locked || !hidden.has(key(c))),
    [columns, hidden, locked],
  );

  const chooser = {
    columns: columns.map((c, i) => ({
      field: key(c),
      /* A column with no title is a control — the select checkbox, the row's
         view button. It is in the frozen block and therefore locked, so it
         never reaches the list, but name it rather than offer a blank row. */
      title: c.title || 'Select',
      on: i < locked || !hidden.has(key(c)),
      /* No `note` for the locked ones: ColumnChooser already prints "always
         shown" beside a required column, and passing it again rendered the
         words twice on one row. */
      required: i < locked,
    })),
    hiddenCount: hidden.size,
    onToggle: (field: string) => {
      const next = new Set(hidden);
      if (next.has(field)) next.delete(field); else next.add(field);
      persist(next);
    },
    onReset: () => persist(new Set<string>()),
  };

  return { shown, chooser };
}
