import type { FieldDef } from './RecordField';
import type { Quotation } from '../../data/quotations';
import {
  PROJECT_TYPE, ORDER_TYPE, RFQ_TYPE, CUSTOMER_TYPE, APPLICATION, QUOTE_FOCUS,
  MATERIAL_PACKAGE_TYPE, TEST_REQUIREMENTS, EXCESS_AND_MOQ,
  NET_CONSIGNED_INVENTORY, ROCKET_CONSIGNED_INVENTORY,
} from '../../data/metadata';

/* One declaration per field, grouped as the screen groups them. These drive
   both the read view and the edit form, so the two cannot drift apart.

   Option lists are the real enumerations observed on the live screen. Where a
   label was corrected, the original is recorded in LABEL_FIXES in
   data/quotations.ts rather than silently changed. */

export const COMMERCIAL: FieldDef<Quotation>[] = [
  { name: 'projectType', label: 'Project type', kind: 'select', options: PROJECT_TYPE },
  { name: 'orderType', label: 'Order type', kind: 'select', options: ORDER_TYPE },
  { name: 'rfqType', label: 'RFQ type', kind: 'select', options: RFQ_TYPE },
  /* The live system carries BOTH "Customer Type" (header) and "RFQ Type" (list
     grid), and both hold Consigned/Turnkey/Mixed. They may be the same field
     twice or two genuinely different ones — that is a question for the
     business, not something to resolve by guessing, so both are kept. */
  { name: 'customerType', label: 'Customer type', kind: 'select', options: CUSTOMER_TYPE,
    hint: 'A different list from RFQ type — "Consign" rather than "Consigned", plus TBD and Hybrid.' },
  { name: 'customerContact', label: 'Customer contact', kind: 'text' },
  { name: 'historicalRfq', label: 'Previous RFQ', kind: 'text',
    hint: 'The RFQ this one is re-quoting, if any.' },
  { name: 'markup', label: 'Markup', kind: 'number', suffix: '%', min: 0, max: 100,
    hint: 'Applied to material and labour to produce the quoted total.' },
  /* A TEXTAREA in the live system, not a number: it holds the quantities
     themselves (a list of price breaks), not a count of them. This mockup had
     it as "how many price breaks", which was a misreading of the label. */
  { name: 'quantitiesToQuote', label: 'Quantities to quote', kind: 'notes',
    hint: 'The quantities the customer wants priced, e.g. 100, 250, 500.' },
  { name: 'quoteFocus', label: 'Quote focus', kind: 'select', options: QUOTE_FOCUS,
    hint: 'What the sourcing engine optimises for when more than one part matches.' },
];

export const TECHNICAL: FieldDef<Quotation>[] = [
  { name: 'application', label: 'Application', kind: 'select', options: APPLICATION },
  /* There is no BUILD_REQUIREMENT metadata code. The live value observed was
     "System", which is an APPLICATION value, so this reuses that list —
     an inference, not a lookup, and the one option list here still worth
     confirming with the business. */
  { name: 'buildRequirement', label: 'Build requirement', kind: 'select', options: APPLICATION },
  /* A fixed list, not free text — this mockup previously had it as an input. */
  { name: 'testRequirements', label: 'Test requirements', kind: 'select', options: TEST_REQUIREMENTS },
  { name: 'materialPackageType', label: 'Material packaging', kind: 'select', options: MATERIAL_PACKAGE_TYPE },
  { name: 'assemblyTurnTime', label: 'Assembly turn time', kind: 'number', suffix: 'days', min: 1 },
  { name: 'leadTimeDays', label: 'Acceptable lead time', kind: 'number', suffix: 'days', min: 1,
    hint: 'Parts quoted beyond this are flagged rather than silently accepted.' },
];

export const INVENTORY: FieldDef<Quotation>[] = [
  { name: 'excessAndMoq', label: 'Excess and MOQ', kind: 'select', options: EXCESS_AND_MOQ },
  { name: 'netConsignedInventory', label: 'Net consigned inventory', kind: 'select', options: NET_CONSIGNED_INVENTORY },
  /* "Rocket" is a real concept with its own metadata code (NET_ROCKET_INVENTORY),
     parallel to the consigned one. Not a typo. */
  { name: 'rocketConsignedInventory', label: 'Rocket consigned inventory', kind: 'select', options: ROCKET_CONSIGNED_INVENTORY },
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
