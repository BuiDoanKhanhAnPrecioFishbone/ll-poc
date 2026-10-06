import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/icons';
import { fmtDate } from '../../ui/renderCell';
import { draftQuotesFor, type DraftQuote } from '../../data/draftQuotes';

/**
 * Run Quotation, with the drafts hanging off it.
 *
 * WHY A SPLIT BUTTON. Resuming a draft used to be the third option inside step 1
 * of the wizard, beside "Import New BoM" and "Load Existing Assembly". Those two
 * answer *what am I quoting*; resuming answers *where was I* — a different
 * question, asked before the wizard opens rather than inside it. Choosing it
 * also replaced both of step 1's working sections with a table, so a third of
 * that screen existed in order to be hidden.
 *
 * It is not in the Quotation Result tab either: that tab is for quote runs that
 * finished. A draft is unfinished work, and filing it with the results would say
 * the opposite.
 *
 * So the entry point sits beside the action it continues: the main button runs a
 * new quote, the chevron lists the drafts this customer has. The chevron appears
 * only when there is at least one — a menu that opens on "no drafts" is a
 * control that exists to disappoint.
 */
export function RunQuotationButton({ customer, onRun, onResume }: {
  customer: string;
  onRun: () => void;
  onResume: (d: DraftQuote) => void;
}) {
  const [open, setOpen] = useState(false);
  const drafts = draftQuotesFor(customer);

  if (!drafts.length) {
    return <Button variant="filled" onClick={onRun}>Run Quotation</Button>;
  }

  return (
    <span className="vy-split">
      <Button variant="filled" onClick={onRun}>Run Quotation</Button>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          {/* Its own name, because "Run Quotation ▾" read aloud is one control
              with two jobs. The count is in the label for the same reason the
              KPI tiles carry theirs: it answers "is it worth opening". */}
          <button type="button" className="vy-split-more"
                  aria-label={`Resume a saved draft (${drafts.length})`}
                  title={`${drafts.length} saved ${drafts.length === 1 ? 'draft' : 'drafts'} for this customer`}>
            <Icon name="chevron-down" size={16} />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="vy-popover vy-draft-menu" align="end" sideOffset={6}>
            <p className="vy-popover-title">Resume draft</p>
            <ul className="vy-draft-list">
              {drafts.map(d => (
                <li key={d.id}>
                  <button type="button" onClick={() => { setOpen(false); onResume(d); }}>
                    <span className="vy-ident">{d.assemblyName}</span>
                    <span className="vy-draft-meta">
                      Rev {d.revision} · {d.buildQty.toLocaleString()} boards · saved {fmtDate(d.createdDate)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="vy-draft-note">Opens at Quoting, where the draft was saved.</p>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </span>
  );
}
