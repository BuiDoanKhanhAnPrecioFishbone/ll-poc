import { Button } from '../../../ui/Button';
import { fmtTime } from '../../../ui/regional';
import { MiniTable } from '../../../ui/MiniTable';
import { fmtDate } from '../../../ui/renderCell';
import type { ColumnSpec } from '../../column-model';
import type { DraftQuote } from '../../../data/draftQuotes';

/**
 * "Continue from drafts" — the one thing Resume Draft Quote adds.
 *
 * The rest of that sheet is Quick Quote's steps 3 and 4 word for word; this
 * table and the jump it performs are the whole of the new flow.
 *
 * SEVEN COLUMNS, HERS AND NOT THE GUIDELINE'S — Action, Assembly Name,
 * Description, Build Qty, Attrition Set, Quote Focus, Created Date. The
 * guideline's seven put Revision third and had no Quote Focus; her 16 Oct
 * prototype makes the swap, and it is the better one for a table whose job is
 * "which of these was I working on": two drafts of one assembly differ by what
 * was being quoted FOR, not by a revision letter they usually share. Revision
 * has not gone anywhere — it is in the strip at the top of every step, and in
 * the Resume menu on the record.
 *
 * Both documents call the rows read-only, so nothing here is editable — the
 * only control is Continue.
 */
function draftColumns(onContinue: (d: DraftQuote) => void): ColumnSpec<DraftQuote>[] { return [
  /* Action leads, as specified. A named verb rather than an icon: this is the
     only control in the row and the row is otherwise inert, so there is nothing
     for an icon to be disambiguated against and nothing gained by making the
     user hover to learn what it does. */
  { field: 'id', title: 'Action', role: 'code', width: 104, sortable: false,
    widthNote: 'Holds the Continue button, which is wider than a code cell assumes.',
    render: d => (
      <Button variant="outlined" size="sm" onClick={() => onContinue(d)}>
        Continue
      </Button>
    ) },
  { field: 'assemblyName', title: 'Assembly Name', role: 'ident' },
  { field: 'description', title: 'Description', role: 'text' },
  { field: 'buildQty', title: 'Build Qty', role: 'number',
    render: d => d.buildQty.toLocaleString() },
  { field: 'attritionSet', title: 'Attrition Set', role: 'number',
    render: d => d.attritionSet.toLocaleString() },
  { field: 'quoteFocus', title: 'Quote Focus', role: 'text', width: 150 },
  /* Date AND time. The guideline says "the date and time when the draft
     quotation was created", and it is right to: drafts of one assembly are
     saved minutes apart, so a date alone cannot tell two of them apart. */
  { field: 'createdDate', title: 'Created Date', role: 'date',
    render: d => `${fmtDate(d.createdDate)} · ${fmtTime(d.createdDate)}` },
]; }

export function DraftsTable({ drafts, customer, onContinue }: {
  drafts: readonly DraftQuote[];
  customer: string;
  onContinue: (d: DraftQuote) => void;
}) {
  return (
    <MiniTable
      data={[...drafts]}
      columns={draftColumns(onContinue)}
      /* The guideline opens with "Pre-condition: at least one previously saved
         draft quotation available", and then says nothing about the case where
         there is none — which is what a first-time user sees every time.

         AND THIS IS THE FIRST DAY ANYONE CAN READ IT. Step 1 hid the whole
         section when the table was empty, so the one message explaining where
         drafts come from was kept from the only person who needs it. Which is
         also how it went stale unnoticed: it said "Import New BoM", a label
         the Action dropped on 16 Oct, exactly like the step-1 banner did. */
      empty={
        <div className="vy-empty-inline">
          <strong>No saved drafts for {customer}.</strong> A draft is created when you press
          Save draft during quoting — on the Quoting or Summary step, in either Action.
          Drafts are held in this browser session only.
        </div>
      }
    />
  );
}
