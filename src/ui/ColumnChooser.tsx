import * as Popover from '@radix-ui/react-popover';
import { Button } from './Button';

/**
 * Which columns the grid shows.
 *
 * Replaces a "Show 2 more columns" button, which the 25 Aug review flagged as a
 * confusing label and asked to become a checklist. Two problems with the old
 * control, beyond the wording:
 *
 *   - it named its effect on one particular state, so it read as a different
 *     control depending on what was already on;
 *   - it had two states only — the shipped set, or the shipped set plus
 *     everything. Wanting one extra column meant taking all of them, and a
 *     column you never use could not be turned off.
 *
 * A checklist has neither problem, and it also SHOWS what is available. The old
 * button hid the existence of the extra columns behind a count.
 */
export function ColumnChooser({ columns, hiddenCount, onToggle, onReset }: {
  columns: { field: string; title: string; on: boolean; note?: string }[];
  hiddenCount: number;
  onToggle: (field: string) => void;
  onReset: () => void;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant={hiddenCount > 0 ? 'tonal' : 'outlined'}>
          Columns{hiddenCount > 0 && ` (${columns.length - hiddenCount}/${columns.length})`}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="vy-popover" align="end" sideOffset={6}>
          <div className="vy-popover-head">
            <strong>Columns</strong>
            <Button size="sm" variant="text" onClick={onReset}>Reset</Button>
          </div>
          <ul className="vy-column-list">
            {columns.map(c => (
              <li key={c.field}>
                <label>
                  <input type="checkbox" checked={c.on} onChange={() => onToggle(c.field)} />
                  <span>{c.title}</span>
                </label>
                {/* Why a column ships hidden — the reason a reviewer would
                    otherwise have to ask for. */}
                {c.note && <span className="vy-column-note">{c.note}</span>}
              </li>
            ))}
          </ul>
          <Popover.Arrow className="vy-popover-arrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
