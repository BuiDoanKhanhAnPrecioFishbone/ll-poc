import { useState } from 'react';
import { Dialog, Tabs } from '../ui/Overlays';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/Badge';
import { useToast } from '../ui/Toast';
import { SmartIcon } from './quotation/SmartButtons';
import { fmtDate } from '../ui/renderCell';
import type { Part } from '../data/parts';

/**
 * Part Master Detail — the deck's "Data Form View" archetype.
 *
 * TWO SOURCES, EACH USED FOR WHAT IT ACTUALLY SPECIFIES.
 *
 * The kick-off deck's slide 14 gives the SHAPE: a small caption over a large
 * identifier, a row of status chips, action buttons on the left with reference
 * links on the right, tabs, and three-column field sections beneath. Its
 * screenshot is a Manufacturer Part Number record, but its job in that deck is
 * to name an archetype for master-data records, not to specify one screen.
 *
 * The Testing Guideline gives the CONTENT, and it is specific: "Part Number -
 * Part Revision, Part Source, Description, Part Class, Part Type, ABC, Package,
 * Material Type, General Info, Quantity Info", with "QR code generator, Edit,
 * Approve", and "Information cannot be edited in the action when seeing the Part
 * detail".
 *
 * So this is the deck's archetype carrying the guideline's fields. Building the
 * MPN record from the screenshot instead would have meant inventing an MPN data
 * model — the ten-column AML mapping, stock report and the rest — which
 * `docs/testing/part-master-mfg-mpn-assessment.md` records as absent and which
 * is a package of its own.
 *
 * IT SHOWS A LOT OF EMPTY FIELDS, AND THAT IS THE POINT. `abc` is blank on every
 * record and class and type on 55% of them, because that is what production
 * holds — measured, and recorded in `data/parts.ts`. A detail screen that hid
 * its empty fields would make the data look better than it is, which is the
 * opposite of what a screen built to review the data should do.
 */
export function PartDetail({ part, onClose }: { part: Part; onClose: () => void }) {
  const toast = useToast();
  const [tab, setTab] = useState('general');
  const available = part.onHand - part.allocated;

  /* The guideline gates these two on part source: BoM for MAKE and MAKE/PHAN,
     Where PN Used for BUY and MAKE sub-assemblies. Only MAKE and BUY exist in
     the data today — the other four values are the gap noted in the assessment —
     so the rule is expressed for the two that do, and will widen with the type
     rather than needing to be found again. */
  const isMake = part.partSource === 'MAKE';

  return (
    <Dialog
      open
      size="xl"
      onClose={onClose}
      title={`${part.partNumber}${part.rev ? ` - ${part.rev}` : ''}`}
      subtitle={part.description}
      actions={<>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={() => toast.notImplemented('generate a QR code for this part')}>QR Code</Button>
        <Button onClick={() => toast.notImplemented('approve this part')}>Approve</Button>
        {/* Says what it would do rather than closing the dialog, which is what
            it used to do — a button that appears to act and instead dismisses
            the thing you were reading. */}
        <Button variant="filled" onClick={() => toast.notImplemented('open this part for editing')}>
          Edit part
        </Button>
      </>}
    >
      <div className="vy-datarec">
        {/* ---- Identity ---------------------------------------------------
            Caption above, identifier below, states beneath — the deck's order.
            The identifier is the largest thing on the screen because it is what
            the reader came to confirm. */}
        <header className="vy-datarec-head">
          <div className="vy-datarec-ident">
            <span className="vy-datarec-caption">Part number</span>
            <strong>{part.partNumber}{part.rev ? <span className="vy-datarec-rev"> - {part.rev}</span> : null}</strong>
            <div className="vy-datarec-chips">
              <StatusBadge value={part.status} />
              <span className="vy-pill">{part.partSource}</span>
              {part.materialType && <span className="vy-pill">{part.materialType}</span>}
            </div>
          </div>

          {/* Reference links, right — the deck puts them opposite the actions
              because they GO somewhere and the actions DO something. Same
              distinction, and the same shape, as the RFQ record's smart buttons. */}
          <nav className="vy-smart-buttons" aria-label="Related records">
            <button type="button" className="vy-smart-btn"
                    onClick={() => toast.notImplemented(
                      isMake ? `open the BoM for ${part.partNumber}`
                             : `show where ${part.partNumber} is used`)}>
              <SmartIcon name={isMake ? 'quote' : 'doc'} />
              <span>{isMake ? 'BoM' : 'Where used'}</span>
            </button>
            <button type="button" className="vy-smart-btn" data-empty={part.onHand === 0 || undefined}
                    onClick={() => toast.notImplemented(`open the stock report for ${part.partNumber}`)}>
              <SmartIcon name="log" />
              <span className="vy-smart-n">{part.onHand.toLocaleString()}</span>
              <span>On hand</span>
            </button>
          </nav>
        </header>

        <Tabs
          value={tab}
          onValueChange={setTab}
          tabs={[
            {
              value: 'general', label: 'General Info',
              content: (
                <div className="vy-field-groups">
                  <Section title="Part identification" rows={[
                    ['Part Number', part.partNumber],
                    ['Part Revision', part.rev],
                    ['Description', part.description],
                    ['Customer', part.customer],
                    ['Part Source', part.partSource],
                  ]} />
                  <Section title="Classification" rows={[
                    ['Part Class', part.partClass],
                    ['Part Type', part.partType],
                    ['ABC', part.abc],
                  ]} />
                  <Section title="Handling" rows={[
                    ['Package', part.packageType],
                    ['Material Type', part.materialType],
                    ['Unit of measure', part.uom],
                  ]} />
                </div>
              ),
            },
            {
              value: 'quantity', label: 'Quantity Info',
              content: (
                <div className="vy-field-groups">
                  <Section title="Stock" rows={[
                    ['On Hand', part.onHand.toLocaleString()],
                    ['Allocated', part.allocated.toLocaleString()],
                    /* Derived, and said so. A number with no source on a screen
                       of stored values invites someone to go looking for the
                       field it came from. */
                    ['Available', `${available.toLocaleString()}  (On Hand − Allocated)`],
                  ]} />
                  <Section title="Cost" rows={[
                    ['Unit Cost', part.unitCost.toLocaleString('en-GB', { style: 'currency', currency: 'USD' })],
                  ]} />
                  <Section title="History" rows={[
                    ['Last Changed', fmtDate(part.lastChange)],
                  ]} />
                </div>
              ),
            },
          ]}
        />
      </div>
    </Dialog>
  );
}

/** One titled column of label/value pairs, read-only as the guideline requires. */
function Section({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <section>
      <h3 className="vy-field-group-title">{title}</h3>
      <dl className="vy-record-fields">
        {rows.map(([label, value]) => (
          <div className="vy-field" key={label}>
            <dt>{label}</dt>
            {/* "Not set" rather than an empty box. Half these fields are blank
                on a real record, and an empty bordered box reads as a control
                that failed to load rather than a value nobody entered. */}
            <dd className={value ? undefined : 'is-empty'}>{value || 'Not set'}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
