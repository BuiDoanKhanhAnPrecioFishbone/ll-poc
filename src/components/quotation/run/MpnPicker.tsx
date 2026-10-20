import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import type { NexarLookup } from '../../../data/bom';

/**
 * The official manufacturer part number, chosen from what the provider returned.
 *
 * ASKED FOR by the customer's Quoting BoM mockup of 16 Oct. Its rule, in their
 * own words: "The BoM value stays. The pick is saved as an alias for this
 * customer."
 *
 * WHY THE FILE'S VALUE IS NEVER OVERWRITTEN. A customer's BoM says
 * `PCA9517ATP`; the catalogue has `PCA9517ATP,118` and `PCA9517ATPZ`, which are
 * tape and tray of the same die and different orderable parts. Replacing their
 * value would lose what they asked for, and the next revision of their file
 * would then read as a change they did not make. So the cell keeps showing
 * theirs, the `*` says a catalogue list exists behind it, and the pick travels
 * with the quote.
 *
 * TWO STATES WORTH TELLING APART, and they are not both problems:
 *
 *   matched     the system resolved it. The `*` is an invitation, not a
 *               warning, and the cell is ordinary.
 *   unmatched   the file's value is close to several and identical to none.
 *               Red, because the quote cannot be finished until somebody says
 *               which one — and no guess by us is better than the question.
 */
export function MpnPicker({ bomValue, lookup, onPick, label }: {
  /** What the customer's file says. Shown, always, whatever is picked. */
  bomValue: string;
  lookup: NexarLookup;
  onPick: (candidate: number) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const chosen = lookup.picked ?? lookup.matched;
  const candidate = chosen != null ? lookup.candidates[chosen] : undefined;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button type="button" className="vy-mpn-pick" aria-label={label}
                data-picked={lookup.picked != null || undefined}
                data-unmatched={chosen == null || undefined}
                /* The manufacturer's own name may end in a stop — "NXP USA
                   Inc." — and a sentence after it should not read "Inc.." */
                title={candidate
                  ? `Catalogue: ${candidate.mpn} · ${candidate.mfg.replace(/\.$/, '')}. Click to change.`
                  : 'The provider returned several close matches. Click to pick the official part.'}>
          <span className="vy-mpn-value">{bomValue}</span>
          {/* THE MARKER IS A GLYPH AND A TOOLTIP, never colour alone — the
              legend under the grid names it too (WCAG 1.4.1). */}
          <span className="vy-mpn-star" aria-hidden>*</span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="vy-popover vy-mpn-menu" align="start" sideOffset={4}>
          <table className="vy-mpn-table">
            <thead><tr><th>MPN</th><th>Manufacturer</th></tr></thead>
            <tbody>
              {lookup.candidates.map((c, i) => (
                <tr key={c.mpn} aria-selected={i === chosen || undefined}
                    data-on={i === chosen || undefined}>
                  <td>
                    <button type="button" onClick={() => { onPick(i); setOpen(false); }}>
                      {c.mpn}
                    </button>
                  </td>
                  <td>{c.mfg}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="vy-mpn-foot">
            The BoM keeps <strong>{bomValue}</strong>. The pick is saved as an alias for this
            customer.
          </p>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
