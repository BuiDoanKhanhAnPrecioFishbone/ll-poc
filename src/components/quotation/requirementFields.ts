import type { FieldDef } from './RecordField';
import type { Quotation } from '../../data/quotations';

/* One declaration per field, grouped as the screen groups them. These drive
   both the read view and the edit form, so the two cannot drift apart.

   Option lists are the real enumerations observed on the live screen. Where a
   label was corrected, the original is recorded in LABEL_FIXES in
   data/quotations.ts rather than silently changed. */

export const COMMERCIAL: FieldDef<Quotation>[] = [
  { name: 'projectType', label: 'Project type', kind: 'select',
    options: ['Production', 'Prototype', 'NPI', 'Re-quote'] },
  { name: 'orderType', label: 'Order type', kind: 'select', options: ['New', 'Repeat'] },
  { name: 'rfqType', label: 'RFQ type', kind: 'select', options: ['Consigned', 'Turnkey', 'Mixed'] },
  /* The live system carries BOTH "Customer Type" (header) and "RFQ Type" (list
     grid), and both hold Consigned/Turnkey/Mixed. They may be the same field
     twice or two genuinely different ones — that is a question for the
     business, not something to resolve by guessing, so both are kept. */
  { name: 'customerType', label: 'Customer type', kind: 'select', options: ['Consigned', 'Turnkey', 'Mixed'],
    hint: 'Held separately from RFQ type in the current system.' },
  { name: 'customerContact', label: 'Customer contact', kind: 'text' },
  { name: 'historicalRfq', label: 'Previous RFQ', kind: 'text',
    hint: 'The RFQ this one is re-quoting, if any.' },
  { name: 'markup', label: 'Markup', kind: 'number', suffix: '%', min: 0, max: 100,
    hint: 'Applied to material and labour to produce the quoted total.' },
  { name: 'quantitiesToQuote', label: 'Quantities to quote', kind: 'number', min: 1,
    hint: 'How many price breaks the customer has asked for.' },
  { name: 'quoteFocus', label: 'Quote focus', kind: 'select',
    options: ['Stock-High cost', 'Lead time', 'Lowest cost', 'Balanced'],
    hint: 'What the sourcing engine optimises for when more than one part matches.' },
];

export const TECHNICAL: FieldDef<Quotation>[] = [
  { name: 'application', label: 'Application', kind: 'select',
    options: ['System', 'PCBA', 'Sub-assy Box Build'] },
  { name: 'buildRequirement', label: 'Build requirement', kind: 'select',
    options: ['System', 'PCBA only', 'Box build', 'Turnkey assembly'] },
  { name: 'testRequirements', label: 'Test requirements', kind: 'text' },
  { name: 'materialPackageType', label: 'Material packaging', kind: 'select',
    options: ['Cut Tape', 'Full Reel', 'Tube', 'Tray'] },
  { name: 'assemblyTurnTime', label: 'Assembly turn time', kind: 'number', suffix: 'days', min: 1 },
  { name: 'leadTimeDays', label: 'Acceptable lead time', kind: 'number', suffix: 'days', min: 1,
    hint: 'Parts quoted beyond this are flagged rather than silently accepted.' },
];

export const INVENTORY: FieldDef<Quotation>[] = [
  { name: 'excessAndMoq', label: 'Excess and MOQ', kind: 'select', options: ['None', 'Low', 'OK'] },
  { name: 'netConsignedInventory', label: 'Net consigned inventory', kind: 'select',
    options: ['No', 'Yes-No Charge'] },
  { name: 'rocketConsignedInventory', label: 'Rocket consigned inventory', kind: 'select',
    options: ['No', 'Yes-No Charge', 'Yes-Charge'] },
  { name: 'conformalCoating', label: 'Conformal coating', kind: 'flag' },
  { name: 'provideAlternateAml', label: 'Provide alternate AML for out-of-stock', kind: 'flag' },
  { name: 'broker', label: 'Broker sourcing permitted', kind: 'flag' },
];

export const NOTES: FieldDef<Quotation>[] = [
  { name: 'customerNotes', label: 'Customer notes', kind: 'notes',
    hint: 'Visible to the customer if the quote is shared.' },
  { name: 'internalNotes', label: 'Internal notes', kind: 'notes',
    hint: 'Never leaves Linh Long.' },
];

export const ALL_FIELDS = [...COMMERCIAL, ...TECHNICAL, ...INVENTORY, ...NOTES];
