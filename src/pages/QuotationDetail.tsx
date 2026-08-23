import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';
import { Rating } from '@progress/kendo-react-inputs';
import { StatusBadge } from '../components/StatusBadge';
import { fmtDate } from '../components/StandardGrid';
import { generateQuotations, daysUntil } from '../data/quotations';
import { ChecklistsTab } from '../components/quotation/ChecklistsTab';
import { ResultTab } from '../components/quotation/ResultTab';
import { ConversationsTab } from '../components/quotation/ConversationsTab';
import { ActivityTab } from '../components/quotation/ActivityTab';
import { BomComparisonDialog } from '../components/quotation/BomComparisonDialog';
import { RunQuotationDialog } from '../components/quotation/RunQuotationDialog';
import { useToast } from '../components/Toast';

/**
 * Quotation record.
 *
 * Three deliberate departures from the production screen:
 *
 * 1. It is a PAGE, not a modal Kendo Window. The live detail opens in a
 *    `k-window` over the app, so the record has no URL, no back button and no
 *    breadcrumb — you cannot send someone a link to an RFQ.
 * 2. Read mode renders VALUES, not disabled inputs. The live screen puts every
 *    field in a read-only `Input`, so a record you are merely looking at reads
 *    as a broken form. Editing is an explicit mode.
 * 3. The header answers "what is this and what does it need" before any detail:
 *    identity, status, owner and due date, in that order.
 */
export function QuotationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [bomOpen, setBomOpen] = useState(false);
  const [runOpen, setRunOpen] = useState(false);
  const toast = useToast();
  const q = useMemo(() => generateQuotations(330).find(x => x.id === id), [id]);

  if (!q) {
    return (
      <div className="vy-page">
        <div className="vy-empty-state">
          <strong>No RFQ with that reference</strong>
          <p>It may have been deleted, or the link may be stale.</p>
          <Button themeColor="primary" onClick={() => navigate('/sales-management/quotation')}>
            Back to Quotations
          </Button>
        </div>
      </div>
    );
  }

  const due = daysUntil(q.dateNeeded);
  const closed = q.status === 'Completed' || q.status === 'Cancelled';
  /* Tab labels carry counts so the record's state is legible without opening
     each tab. The live TabStrip gives five bare nouns. */
  const checklistOutstanding =
    [...Object.values(q.programChecklist), ...Object.values(q.engineeringChecklist)]
      .filter(v => v === 'Not started' || v === 'In progress').length;

  return (
    <div className="vy-page vy-page--record">
      <div className="vy-record-bar">
        <div className="vy-record-id">
          <span className="vy-ident vy-record-no">RFQ{q.no}</span>
          <StatusBadge value={q.status} />
          {q.itar && <span className="vy-flag" title="Subject to ITAR export control">ITAR</span>}
        </div>
        <div className="vy-page-actions">
          <Button themeColor="base" onClick={() => navigate('/sales-management/quotation')}>Back</Button>
          <Button themeColor="base" onClick={() => setBomOpen(true)}>BoM Comparison</Button>
          <Button themeColor="base"
                  onClick={() => toast.notImplemented('unlock the header and requirements fields for editing')}>
            Edit
          </Button>
          <Button themeColor="primary" onClick={() => setRunOpen(true)}>Run Quotation</Button>
        </div>
      </div>

      <h1 className="vy-record-title">{q.projectName}</h1>

      {/* The four facts an estimator needs before anything else. */}
      <div className="vy-record-summary">
        <Fact label="Customer" value={q.customer} />
        <Fact label="Assigned to" value={q.assignedTo} />
        <Fact
          label="Date needed"
          value={<>
            {fmtDate(q.dateNeeded)}
            {!closed && (
              <span className="vy-due-rel" data-tone={due < 0 ? 'overdue' : due <= 3 ? 'soon' : 'none'}>
                {due < 0 ? `${-due} days late` : `in ${due} days`}
              </span>
            )}
          </>}
        />
        <Fact label="Priority" value={<Rating value={q.priority} max={3} readonly aria-label={`Priority ${q.priority} of 3`} />} />
      </div>

      {/* animation={false} is not cosmetic: with animation on, Kendo wraps tab
          content in `.k-animation-container`, which is `display: inline-block`
          and collapses the panel to its intrinsic width — 338px inside a 984px
          tab strip, so the three-column field layout never gets the room to
          form. Turning animation off removes the wrapper entirely. */}
      <TabStrip selected={tab} onSelect={e => setTab(e.selected)} animation={false} className="vy-tabs">
        <TabStripTab title="Requirements">
          <div className="vy-field-groups">
            <FieldGroup title="Commercial">
              <Field label="Project type" value={q.projectType} />
              <Field label="Order type" value={q.orderType} />
              <Field label="RFQ type" value={q.rfqType} />
              <Field label="Customer contact" value={q.customerContact} />
              <Field label="Previous RFQ" value={q.historicalRfq ? `RFQ${q.historicalRfq}` : undefined} />
              <Field label="Markup" value={`${q.markup}%`} />
              <Field label="Quantities to quote" value={q.quantitiesToQuote} />
              <Field label="Quote focus" value={q.quoteFocus} />
            </FieldGroup>

            <FieldGroup title="Technical">
              <Field label="Application" value={q.application} />
              <Field label="Build requirement" value={q.buildRequirement} />
              <Field label="Test requirements" value={q.testRequirements === 'NA' ? undefined : q.testRequirements} />
              <Field label="Material packaging" value={q.materialPackageType} />
              <Field label="Assembly turn time" value={`${q.assemblyTurnTime} days`} />
              <Field label="Acceptable lead time" value={`${q.leadTimeDays} days`} />
            </FieldGroup>

            <FieldGroup title="Inventory & options">
              <Field label="Excess and MOQ" value={q.excessAndMoq} />
              <Field label="Net consigned inventory" value={q.netConsignedInventory} />
              <Field label="Rocket consigned inventory" value={q.rocketConsignedInventory} />
              <Flags items={[
                ['Conformal coating', q.conformalCoating],
                ['Provide alternate AML for out-of-stock', q.provideAlternateAml],
                ['Broker sourcing permitted', q.broker],
              ]} />
            </FieldGroup>
          </div>

          <div className="vy-notes">
            <Note title="Customer notes" body={q.customerNotes} />
            <Note title="Internal notes" body={q.internalNotes} />
          </div>
        </TabStripTab>

        <TabStripTab title={`Checklists${checklistOutstanding ? ` (${checklistOutstanding})` : ''}`}>
          <ChecklistsTab q={q} />
        </TabStripTab>
        <TabStripTab title={`Result${q.results.length ? ` (${q.results.length})` : ''}`}>
          <ResultTab q={q} onRun={() => setRunOpen(true)} />
        </TabStripTab>
        <TabStripTab title={`Conversations${q.comments.length ? ` (${q.comments.length})` : ''}`}>
          <ConversationsTab q={q} />
        </TabStripTab>
        <TabStripTab title="Activity"><ActivityTab q={q} /></TabStripTab>
      </TabStrip>

      {bomOpen && <BomComparisonDialog onClose={() => setBomOpen(false)} />}
      {runOpen && <RunQuotationDialog q={q} onClose={() => setRunOpen(false)} />}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="vy-fact">
      <div className="vy-fact-label">{label}</div>
      <div className="vy-fact-value">{value}</div>
    </div>
  );
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="vy-field-group">
      <h2 className="vy-field-group-title">{title}</h2>
      <dl className="vy-field-list">{children}</dl>
    </section>
  );
}

/** Renders a value. An empty field says so once, quietly, rather than showing
 *  an empty disabled input that reads as broken. */
function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  const empty = value === undefined || value === '' || value === null;
  return (
    <div className="vy-field">
      <dt>{label}</dt>
      <dd className={empty ? 'is-empty' : undefined}>{empty ? 'Not set' : value}</dd>
    </div>
  );
}

function Flags({ items }: { items: [string, boolean][] }) {
  return (
    <div className="vy-flags">
      {items.map(([label, on]) => (
        <div key={label} className="vy-flag-row" data-on={on}>
          <span className="vy-flag-mark" aria-hidden>{on ? '✓' : '–'}</span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function Note({ title, body }: { title: string; body: string }) {
  return (
    <section className="vy-note">
      <h3>{title}</h3>
      <p className={body ? undefined : 'is-empty'}>{body || 'None recorded'}</p>
    </section>
  );
}

