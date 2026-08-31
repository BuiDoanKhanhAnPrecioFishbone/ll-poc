import { useMemo, useState } from 'react';
import { Dialog, Tabs } from '../ui/Overlays';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { RecordField, RequiredMark, isMissing } from './quotation/RecordField';
import {
  PART_IDENTITY, PART_CLASSIFICATION, PART_HANDLING,
  PART_SALES_PURCHASE, PART_REQUESTS, PART_DIMENSIONS,
  PART_REORDERING, PART_DEMAND, PART_LEAD_TIME,
} from './partFields';
import { PART_CLASS_TYPES } from '../data/partMetadata';
import { addCreatedPart, partExists, nextPartId } from '../data/createdParts';
import type { Part } from '../data/parts';
import type { FieldDef } from './quotation/RecordField';

/**
 * Add Part Master Detail — Create New Part.
 *
 * "Create New Part allows users to manually add a new part to the system when
 * it doesn't already exist and file import is not used." Fifteen numbered
 * sub-steps, thirty-odd fields, six sections across two tabs.
 *
 * THE SHEET'S OWN STRUCTURE IS THE SCREEN. Identification above the tabs
 * (2.1–2.7), then General Info and Quantity Info, each holding three named
 * sections. Thirty fields in one modal is a wall to be worked through; the same
 * thirty in the customer's grouping is six short jobs, and the grouping is also
 * what the specification asks for. Nothing here needed inventing.
 *
 * ONE FORM, THREE MODES, AND THIS BUILDS ONE OF THEM. The sheet is explicit
 * that the same form serves all three — "Display the 'Add Part Master Detail'
 * form, user can view or edit". `PartDetail` is the view; this is the create.
 * They share `partFields.ts` so the two cannot list different fields, but they
 * are not yet one component: making the record view editable in place is a
 * change to a screen that has been reviewed and signed off, and is its own
 * piece of work rather than a side effect of this one.
 */
export function AddPartDialog({ open, parts, onClose, onCreated }: {
  open: boolean;
  /** Everything already in the system, for the uniqueness check. */
  parts: readonly Part[];
  onClose: () => void;
  /** Hands the created part back so the list can open its detail. */
  onCreated: (p: Part) => void;
}) {
  const toast = useToast();
  const [draft, setDraft] = useState<Part>(blankPart);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState('general');

  /* "Only valid Part Type options mapped to the selected Part Class are
     displayed", so the Part Type field is re-declared per class rather than
     rendering the full list and rejecting the wrong ones afterwards. Before a
     class is chosen there is nothing valid to offer, which the hint says
     instead of presenting an empty dropdown. */
  const typeField = useMemo<FieldDef<Part>>(() => {
    const options = PART_CLASS_TYPES[draft.partClass] ?? [];
    const base = PART_CLASSIFICATION.find(f => f.name === 'partType')!;
    return {
      ...base, options,
      hint: draft.partClass
        ? `Types valid for ${draft.partClass}.`
        : 'Choose a Part Class first — Part Type is a sub-classification within it.',
    } as FieldDef<Part>;
  }, [draft.partClass]);

  function setField(name: string, v: unknown) {
    setDraft(d => {
      const next = { ...d, [name]: v } as Part;

      /* "Changing the Part Class will clear the previously selected Part Type
         (if not applicable), then system require user to re-select the valid
         one." IF NOT APPLICABLE is the whole rule: a type that survives the
         change is kept, because clearing a still-valid answer makes the user
         retype what they already told us. ELEC-PAS is valid for both COMPONENT
         and CONSUMABLE, so switching between those two keeps it. */
      if (name === 'partClass') {
        const valid = PART_CLASS_TYPES[String(v)] ?? [];
        if (next.partType && !valid.includes(next.partType)) next.partType = '';
      }

      /* "When selecting a value in the Customer, system auto adds the Customer
         Code as a prefix to the Part Number (if not already included)."

         The code is the first token of the customer label — "00848 - KT
         Controls Ltd" — which is the form every part number in the catalogue
         already takes: 00848-1AB851429. IF NOT ALREADY INCLUDED is checked
         against the prefix specifically rather than anywhere in the string, so
         a part number that merely contains the digits does not skip the rule.

         Only the prefix is replaced when the customer changes, so choosing the
         wrong customer and correcting it does not leave both codes stacked up. */
      if (name === 'customer') {
        const code = String(v).split(' ')[0];
        if (code) next.partNumber = withPrefix(next.partNumber, code, d.customer);
      }
      return next;
    });
  }

  const markTouched = (name: string) => setTouched(t => new Set(t).add(name));

  const required = [...PART_IDENTITY, ...PART_CLASSIFICATION].filter(f => f.required);
  const missing = required.filter(f => isMissing(f, draft[f.name]));

  /* The uniqueness rule is over the PAIR, so it belongs to neither field and is
     checked here. Live rather than on submit: the part number is the first
     thing typed, and finding out it is taken after filling in thirty fields is
     the worst possible moment to be told. */
  const duplicate = draft.partNumber.trim() !== '' &&
    partExists(parts, draft.partNumber, draft.rev);

  function save() {
    if (missing.length || duplicate) {
      setTouched(new Set(required.map(f => f.name)));
      toast.error(duplicate
        ? `${draft.partNumber}${draft.rev ? ` - ${draft.rev}` : ''} already exists. Part Number and Part Revision must be unique together.`
        : `${missing.length} required ${missing.length === 1 ? 'field is' : 'fields are'} still empty.`);
      return;
    }
    const created: Part = {
      ...draft,
      id: nextPartId(parts),
      partNumber: draft.partNumber.trim(),
      rev: draft.rev.trim(),
      description: draft.description.trim(),
      lastChange: new Date(),
    };
    addCreatedPart(created);
    onClose();
    /* "Create the new Part successfully" and "Display the details of the newly
       created part" — two separate Expected lines, so both happen. */
    toast.success(`${created.partNumber} created. Held in this browser session only.`);
    onCreated(created);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xl"
      title="Add Part Master Detail"
      subtitle={<>A new part in Part Master. Nothing is saved until you choose Save.</>}
      actions={
        /* Disabled until the form can succeed, with the reason in the tooltip —
           a disabled button that will not say why is a dead end. */
        <Button variant="filled" onClick={save} disabled={missing.length > 0 || duplicate}
                title={duplicate
                  ? 'That Part Number and Revision already exist'
                  : missing.length
                    ? `Still needed: ${missing.map(f => f.label).join(', ')}`
                    : 'Create this part'}>
          Save
        </Button>
      }
    >
      <section className="vy-record-header">
        <p className="vy-hint">
          Fields marked <RequiredMark /> must be filled before saving. Everything else can be
          left empty and set later.
        </p>

        <div className="vy-field-groups">
          <section className="vy-field-group">
            <h2 className="vy-field-group-title">Part identification</h2>
            <dl className="vy-field-list">
              {PART_IDENTITY.map(def => (
                <RecordField key={def.name} def={def} value={draft[def.name]}
                             editing onChange={setField} row={draft}
                             touched={touched.has(def.name)} onBlur={markTouched} />
              ))}
            </dl>
            {duplicate && (
              <p className="vy-field-error" role="alert">
                <strong>{draft.partNumber}{draft.rev ? ` - ${draft.rev}` : ''}</strong> already
                exists. Part Number and Part Revision must be unique together — change either one.
              </p>
            )}
          </section>

          <section className="vy-field-group">
            <h2 className="vy-field-group-title">Classification</h2>
            <dl className="vy-field-list">
              {PART_CLASSIFICATION.map(def => (
                <RecordField key={def.name}
                             def={def.name === 'partType' ? typeField : def}
                             value={draft[def.name]}
                             editing onChange={setField} row={draft}
                             touched={touched.has(def.name)} onBlur={markTouched} />
              ))}
            </dl>
          </section>

          <section className="vy-field-group">
            <h2 className="vy-field-group-title">Handling</h2>
            <dl className="vy-field-list">
              {PART_HANDLING.map(def => (
                <RecordField key={def.name} def={def} value={draft[def.name]}
                             editing onChange={setField} row={draft}
                             touched={touched.has(def.name)} onBlur={markTouched} />
              ))}
            </dl>
          </section>
        </div>
      </section>

      <Tabs
        value={tab}
        onValueChange={setTab}
        tabs={[
          {
            value: 'general', label: 'General Info',
            content: (
              <div className="vy-field-groups">
                <Group title="Sales & Purchase" defs={PART_SALES_PURCHASE}
                       draft={draft} touched={touched} onChange={setField} onBlur={markTouched} />
                <Group title="Requests & Controls" defs={PART_REQUESTS}
                       draft={draft} touched={touched} onChange={setField} onBlur={markTouched} />
                <Group title="Dimensions & Packages" defs={PART_DIMENSIONS}
                       draft={draft} touched={touched} onChange={setField} onBlur={markTouched} />
              </div>
            ),
          },
          {
            value: 'quantity', label: 'Quantity Info',
            content: (
              <div className="vy-field-groups">
                <Group title="Reordering rule" defs={PART_REORDERING}
                       draft={draft} touched={touched} onChange={setField} onBlur={markTouched} />
                <Group title="Demand & forecast planning" defs={PART_DEMAND}
                       draft={draft} touched={touched} onChange={setField} onBlur={markTouched} />
                <Group title="Lead time & Policies" defs={PART_LEAD_TIME}
                       draft={draft} touched={touched} onChange={setField} onBlur={markTouched} />
              </div>
            ),
          },
          {
            value: 'attachments', label: 'Attachments',
            content: (
              <div className="vy-empty-state vy-empty-state--tab">
                <strong>No files attached</strong>
                <p>
                  Drawings, specifications and certificates attached here are the single
                  reference for every department that uses this part.
                </p>
                <Button onClick={() => toast.notImplemented('attach files to a new part')}>
                  Upload File(s)
                </Button>
              </div>
            ),
          },
        ]}
      />
    </Dialog>
  );
}

/** One titled section of editable fields. */
function Group({ title, defs, draft, touched, onChange, onBlur }: {
  title: string; defs: FieldDef<Part>[]; draft: Part; touched: Set<string>;
  onChange: (name: string, v: unknown) => void; onBlur: (name: string) => void;
}) {
  return (
    <section className="vy-field-group">
      <h2 className="vy-field-group-title">{title}</h2>
      <dl className="vy-field-list">
        {defs.map(def => (
          <RecordField key={def.name} def={def} value={draft[def.name]}
                       editing onChange={onChange} row={draft}
                       touched={touched.has(def.name)} onBlur={onBlur} />
        ))}
      </dl>
    </section>
  );
}

/**
 * Put `code-` on the front, taking off the previous customer's code first.
 *
 * Exported for the test of the rule that matters most here: choosing customer A
 * then customer B must leave one prefix, not two.
 */
export function withPrefix(partNumber: string, code: string, previousCustomer: string): string {
  let base = partNumber;
  const oldCode = previousCustomer.split(' ')[0];
  if (oldCode && base.startsWith(`${oldCode}-`)) base = base.slice(oldCode.length + 1);
  if (base.startsWith(`${code}-`)) return base;
  return base ? `${code}-${base}` : `${code}-`;
}

function blankPart(): Part {
  return {
    id: 0, partNumber: '', customer: '', rev: '', description: '',
    partSource: '', partClass: '', partType: '', abc: '', uom: '',
    packageType: '', materialType: '',
    onHand: 0, allocated: 0, unitCost: 0,
    lastChange: new Date(),
    /* "Active" is not a field on this form — the sheet never offers a status on
       create — so a new part takes the one status that means it may be used. */
    status: 'Active',
  };
}
