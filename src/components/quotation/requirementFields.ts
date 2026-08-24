import type { FieldDef } from './RecordField';
import type { Quotation } from '../../data/quotations';
import { CUSTOMER_OPTIONS, contactsFor, findCustomer, PEOPLE } from '../../data/quotations';
import {
  PROJECT_TYPE, ORDER_TYPE, RFQ_TYPE, CUSTOMER_TYPE, APPLICATION, QUOTE_FOCUS,
  MATERIAL_PACKAGE_TYPE, TEST_REQUIREMENTS, EXCESS_AND_MOQ,
  NET_CONSIGNED_INVENTORY, ROCKET_CONSIGNED_INVENTORY,
} from '../../data/metadata';

/* One declaration per field, grouped as the screen groups them. These drive
   both the read view and the edit form, so the two cannot drift apart.

   Option lists are the real enumerations observed on the live screen.

   LABELS ARE VERBATIM. Decision D2 (24 Aug 2026): users have learned these
   names, so only genuine errors are corrected — a misspelling, a mangled word.
   Case, plurals, abbreviations and phrasing stay exactly as the live system
   writes them, even where a style guide would disagree. The two corrections
   that remain are recorded in LABEL_FIXES in data/quotations.ts. */

/**
 * The record header. These sit ABOVE the tabs on the live screen, and an
 * earlier pass moved them into the Requirements tab because the header looked
 * crowded. That was the wrong trade: an estimator reads Project Type and
 * Customer Type to decide whether the RFQ is even theirs to work, so burying
 * them one click down costs a decision that used to be free.
 *
 * Decision D1 (24 Aug 2026) returns them. Verified present on the live header:
 * Customer Contact, Project Type, Order Type, Customer Type.
 */
/**
 * Project Name is separate from HEADER because it renders in two places: as the
 * record's HEADING while reading, and as a field only while editing. Leaving it
 * in HEADER printed it twice on the same screen.
 *
 * It was previously only the heading — readable, never settable — even though it
 * is a field on the RFQ and the live form offers the customer's existing project
 * names for it.
 */
export const PROJECT_NAME_FIELD: FieldDef<Quotation> = {
  name: 'projectName', label: 'Project Name', kind: 'lookup',
  optionsFor: (q: Quotation) => findCustomer(q.customer)?.projectNames ?? [],
  hint: 'An existing project for this customer, or a new assembly number.',
};

export const HEADER: FieldDef<Quotation>[] = [
  /* Customer comes FIRST because four other fields are decided by it. Putting a
     dependent field above the one it depends on makes the form change under the
     user's cursor after they have already filled it in. */
  { name: 'customer', label: 'Customer', kind: 'lookup', optionsFor: () => CUSTOMER_OPTIONS,
    hint: 'Sets the contact list, Customer Type and the ITAR flag, and suggests a markup.' },
  /* Filtered to the chosen customer, exactly as the live form does it. As free
     text this accepted a contact who does not work for the customer. */
  { name: 'customerContact', label: 'Customer Contact', kind: 'lookup',
    optionsFor: (q: Quotation) => contactsFor(q.customer) },
  { name: 'projectType', label: 'Project Type', kind: 'select', options: PROJECT_TYPE },
  { name: 'orderType', label: 'Order Type', kind: 'select', options: ORDER_TYPE },
  /* Derived: the live form writes this from the customer record's `custType`.
     The live system carries BOTH "Customer Type" (header) and "RFQ Type" (list
     grid), and both hold Consigned/Turnkey/Mixed. They may be the same field
     twice or two genuinely different ones — that is a question for the
     business, not something to resolve by guessing, so both are kept. */
  { name: 'customerType', label: 'Customer Type', kind: 'select', options: CUSTOMER_TYPE,
    readOnly: true, derivedFrom: 'Customer' },
  { name: 'assignedTo', label: 'Assigned To', kind: 'select', options: PEOPLE },
];

export const COMMERCIAL: FieldDef<Quotation>[] = [
  { name: 'rfqType', label: 'RFQ Type', kind: 'select', options: RFQ_TYPE },
  /* Carried live as the pair `rfqParentName` + `rfqParentGuid` — a reference to
     another RFQ, not a string. Free text let you cite an RFQ that never existed. */
  { name: 'historicalRfq', label: 'Historical RFQ', kind: 'lookup',
    optionsFor: () => HISTORICAL_RFQ_OPTIONS,
    hint: 'The RFQ this one re-quotes, if any.' },
  /* Defaults from the customer's `priceMarkup`, but stays editable: the live
     code only writes the default while markup is still unset, which is what an
     overridable default looks like. */
  { name: 'markup', label: 'Markup', kind: 'number', suffix: '%', min: 0, max: 100,
    hint: 'Applied to material and labour to produce the quoted total. Suggested from the customer.' },
  /* A TEXTAREA in the live system, not a number: it holds the quantities
     themselves (a list of price breaks), not a count of them. This mockup had
     it as "how many price breaks", which was a misreading of the label. */
  { name: 'quantitiesToQuote', label: 'Item Ant Quantities To Quote', kind: 'notes',
    hint: 'The quantities the customer wants priced, e.g. 100, 250, 500.' },
  { name: 'quoteFocus', label: 'Quote Focus', kind: 'select', options: QUOTE_FOCUS,
    hint: 'What the sourcing engine optimises for when more than one part matches.' },
];

export const TECHNICAL: FieldDef<Quotation>[] = [
  { name: 'application', label: 'Application', kind: 'select', options: APPLICATION },
  /* There is no BUILD_REQUIREMENT metadata code. The live value observed was
     "System", which is an APPLICATION value, so this reuses that list —
     an inference, not a lookup, and the one option list here still worth
     confirming with the business. */
  { name: 'buildRequirement', label: 'Build Requirement', kind: 'select', options: APPLICATION },
  /* A fixed list, not free text — this mockup previously had it as an input. */
  { name: 'testRequirements', label: 'Test Requirements', kind: 'select', options: TEST_REQUIREMENTS },
  { name: 'materialPackageType', label: 'Material Package Type', kind: 'select', options: MATERIAL_PACKAGE_TYPE },
  { name: 'assemblyTurnTime', label: 'Assembly Turn Time', kind: 'number', suffix: 'days', min: 1 },
  { name: 'leadTimeDays', label: 'Acceptable LeadTime In Day', kind: 'number', suffix: 'days', min: 1,
    hint: 'Parts quoted beyond this are flagged rather than silently accepted.' },
];

export const INVENTORY: FieldDef<Quotation>[] = [
  { name: 'excessAndMoq', label: 'Excess And MOQ', kind: 'select', options: EXCESS_AND_MOQ },
  { name: 'netConsignedInventory', label: 'Net Consigned Inventory', kind: 'select', options: NET_CONSIGNED_INVENTORY },
  /* "Rocket" is a real concept with its own metadata code (NET_ROCKET_INVENTORY),
     parallel to the consigned one. Not a typo. */
  { name: 'rocketConsignedInventory', label: 'Rocket Consigned Inventory', kind: 'select', options: ROCKET_CONSIGNED_INVENTORY },
  { name: 'conformalCoating', label: 'Conformal Coating', kind: 'flag' },
  { name: 'provideAlternateAml', label: 'Provide Alt AML For Out of Stock', kind: 'flag' },
  { name: 'broker', label: 'Broker', kind: 'flag' },
];

export const NOTES: FieldDef<Quotation>[] = [
  { name: 'customerNotes', label: 'Customer specific needs', kind: 'notes',
    hint: 'Visible to the customer if the quote is shared.' },
  { name: 'internalNotes', label: 'Internal Notes', kind: 'notes',
    hint: 'Never leaves Linh Long.' },
];

/**
 * Populated once at module load from the generated RFQs, so Historical RFQ can
 * offer real references. A lookup whose options are made up is only a text box
 * with extra steps.
 */
export let HISTORICAL_RFQ_OPTIONS: string[] = [];
export function setHistoricalRfqOptions(all: string[]) { HISTORICAL_RFQ_OPTIONS = all; }

export const ALL_FIELDS = [PROJECT_NAME_FIELD, ...HEADER, ...COMMERCIAL, ...TECHNICAL, ...INVENTORY, ...NOTES];

/**
 * Fields the live form does not let you type into.
 *
 * `readOnly` above is the per-field claim; these are the record-level ones that
 * have no FieldDef because they render in the record bar rather than the form.
 * Both kinds exist because the live system has both, and an edit mode that
 * unlocked everything would invite changes the real system would reject.
 */
export const SYSTEM_FIELDS = [
  { label: 'RFQ No', why: 'Assigned when the RFQ is created.' },
  { label: 'Created Date', why: 'Stamped by the system.' },
  { label: 'Status', why: 'Moves as the quote progresses, not by typing.' },
  { label: 'ITAR', why: 'Follows the customer record.' },
];
