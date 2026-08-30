import { Button } from '../../../ui/Button';
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
 * The seven columns are the guideline's, in its order: Action, Assembly Name,
 * Revision, Description, Build Qty, Attrition Set, Created Date. It calls the
 * rows read-only, so nothing here is editable — the only control is Continue.
 */
function draftColumns(onContinue: (d: DraftQuote) => void): ColumnSpec<DraftQuote>[] { return [
  /* Action leads, as specified. A named verb rather than an icon: this is the
     only control in the row and the row is otherwise inert, so there is nothing
     for an icon to be disambiguated against and nothing gained by making the
     user hover to learn what it does. */
  { field: 'id', title: 'Action', role: 'code', width: 104,
    widthNote: 'Holds the Continue button, which is wider than a code cell assumes.',
    render: d => (
      <Button variant="outlined" size="sm" onClick={() => onContinue(d)}>
        Continue
      </Button>
    ) },
  { field: 'assemblyName', title: 'Assembly Name', role: 'ident' },
  { field: 'revision', title: 'Revision', role: 'code',
    render: d => <span className="vy-code">{d.revision}</span> },
  { field: 'description', title: 'Description', role: 'text' },
  { field: 'buildQty', title: 'Build Qty', role: 'number',
    render: d => d.buildQty.toLocaleString() },
  { field: 'attritionSet', title: 'Attrition Set', role: 'number',
    render: d => d.attritionSet.toLocaleString() },
  /* Date AND time. The guideline says "the date and time when the draft
     quotation was created", and it is right to: drafts of one assembly are
     saved minutes apart, so a date alone cannot tell two of them apart. */
  { field: 'createdDate', title: 'Created Date', role: 'date',
    render: d => `${fmtDate(d.createdDate)} · ${d.createdDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` },
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
         there is none — which is what a first-time user sees every time. Saying
         where drafts come from beats an empty table, because the answer is a
         button two options up this same screen rather than anything the user
         must go elsewhere to do. */
      empty={
        <div className="vy-empty-inline">
          <strong>No saved drafts for {customer}.</strong> A draft is created when you press
          Save draft during quoting — on the Quoting or Summary step of Import New BoM or
          Load Existing Assembly. Drafts are held in this browser session only.
        </div>
      }
    />
  );
}
