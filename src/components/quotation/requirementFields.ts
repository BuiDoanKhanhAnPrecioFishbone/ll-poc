import type { FieldDef } from './RecordField';
import type { Quotation } from '../../data/quotations';
import { CUSTOMER_OPTIONS, contactsFor, findCustomer } from '../../data/quotations';
import {
  PROJECT_TYPE, ORDER_TYPE, CUSTOMER_TYPE, APPLICATION, QUOTE_FOCUS,
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
 * Project Name is separate from HEADER because it renders in two places: as the
 * record's HEADING while reading, and as a field only while editing. Leaving it
 * in HEADER printed it twice on the same screen.
 *
 * It was previously only the heading — readable, never settable — even though it
 * is a field on the RFQ and the live form offers the customer's existing project
 * names for it.
 */
export const PROJECT_NAME_FIELD: FieldDef<Quotation> = {
  /* TYPED, with the customer's existing projects as suggestions — not a closed
     dropdown. The guideline is explicit ("Allows the user to enter the project
     name") and the dropdown broke the new-customer path outright: a customer
     who is not in Customer Management has no projects, so this required field
     offered an empty list and no way past it. */
  name: 'projectName', label: 'Project Name', kind: 'combo', required: true,
  optionsFor: (q: Quotation) => findCustomer(q.customer)?.projectNames ?? [],
  hint: 'An existing project for this customer, or a new assembly number.',
};

/**
 * The record header, GROUPED BY SUBJECT.
 *
 * These sit above the tabs on the live screen. An earlier pass moved them into
 * the Requirements tab because the header looked crowded, which was the wrong
 * trade — an estimator reads Project Type and Customer Type to decide whether
 * the RFQ is theirs to work at all, so burying them one click down costs a
 * decision that used to be free. Decision D1 returned them.
 *
 * They were then returned as ONE flat grid, which is the mistake this structure
 * fixes. Nine unrelated fields in a row give the eye nothing to navigate by, so
 * finding "who is the contact" means reading every label. Grouped by what the
 * fields are ABOUT, each group is a place to look:
 *
 *   who it is for  ->  Customer, Customer Contact, Customer Type
 *   what it is     ->  Project Name, Project Type, Order Type, Historical RFQ
 *   when and whose ->  Due Date, Created Date, Priority, Assigned To
 *
 * This follows the grouped-region pattern in the reviewed Customer Invoice
 * mockup (25 Aug 2026), which divides its header into Customer & references,
 * Invoice info, and Documents & shipping.
 */
export const HEADER: FieldDef<Quotation>[] = [
  /* Customer comes FIRST because four other fields are decided by it. Putting a
     dependent field above the one it depends on makes the form change under the
     user's cursor after they have already filled it in. */
  { name: 'customer', label: 'Customer', kind: 'lookup', required: true,
    optionsFor: () => CUSTOMER_OPTIONS,
    /* An RFQ created with "New Customer?" names someone who is not in Customer
       Management, so the dropdown cannot hold their name — it rendered as an
       empty control, silently discarding what the user typed on create the
       first time they pressed Edit. */
    freeTextWhen: (q: Quotation) => Boolean(q.newCustomer),
    placeholder: 'Customer name',
    hint: 'Sets the contact list, Customer Type and the ITAR flag, and suggests a markup.' },
  /* Filtered to the chosen customer, exactly as the live form does it. As free
     text this accepted a contact who does not work for the customer.

     A customer created through "New Customer?" is not in Customer Management,
     so `contactsFor` has nothing to offer — its contacts come from Add Contact
     and are held on the RFQ until the customer record exists. */
  { name: 'customerContact', label: 'Customer Contact', kind: 'lookup',
    optionsFor: (q: Quotation) =>
      (q.newCustomer ? q.newCustomerContacts ?? [] : contactsFor(q.customer)) },
  /**
   * ITAR — an ACCESS CONTROL flag, not a label.
   *
   * The customer's Testing Guideline: "If the RFQ is marked as ITAR = true,
   * only users whose account has ITAR = true can access and view it. Users
   * whose account has ITAR = false can view only RFQs with ITAR = false."
   *
   * So this one checkbox decides who can open the record at all. It sits on
   * the form between Project Name and Project Type, exactly where the live
   * screen puts it.
   *
   * Read-only because it follows the customer record — the live form writes it
   * from the customer's `isItar`. Marking a customer as export-controlled is a
   * decision made on the customer, not per RFQ.
   */
  { name: 'itar', label: 'ITAR', kind: 'flag', readOnly: true, derivedFrom: 'Customer' },
  { name: 'projectType', label: 'Project Type', kind: 'select', options: PROJECT_TYPE },
  { name: 'orderType', label: 'Order Type', kind: 'select', options: ORDER_TYPE, required: true },
  /* SELECTABLE, not derived. The live form writes this from the customer
     record's `custType` and never lets you change it, which is what this
     prototype copied. The Testing Guideline says otherwise — "Allows the user
     to select the appropriate customer type for the RFQ", and lists it among
     the seven required fields on create — and the guideline outranks the live
     system (docs/precedence.md).

     The customer record still supplies the DEFAULT, which is what selecting a
     customer does on create. That keeps the convenience of the derivation
     without making it a cage: a supply model can differ from the customer's
     usual one for a particular RFQ, and that is presumably why the customer
     wants it selectable.

     Whether this and the grid's "RFQ Type" are one field under two labels is
     open question 10. Both are kept until they say. */
  { name: 'customerType', label: 'Customer Type', kind: 'select', options: CUSTOMER_TYPE,
    required: true,
    hint: 'Defaults to the customer\u2019s usual supply model. Change it if this RFQ differs.' },
  { name: 'assignedTo', label: 'Assigned To', kind: 'people', required: true },
  /* Editable, and a dropdown rather than a star rating. The 25 Aug review:
     "priority indicator: unclear interaction -> change to a dropdown with
     dot+label options". It was read-only here, so the one field that says how
     urgent this RFQ is could be read and never set. */
  { name: 'priority', label: 'Priority', kind: 'priority', required: true },
];

const byName = (n: string) => HEADER.find(f => f.name === n)!;

export type HeaderGroup = {
  id: 'customer' | 'project' | 'schedule';
  title: string;
  /** Which of the shell's nav icons heads the group. */
  icon: string;
  fields: FieldDef<Quotation>[];
};

/**
 * Due Date — the record form's name for `dateNeeded`.
 *
 * Required per the Testing Guideline, and now editable. It spent this build
 * carrying a required marker with nothing behind it: the record page printed
 * it as static text in both modes, so the one field the guideline says the
 * user must set was the one field they could not.
 */
const DUE_DATE_FIELD: FieldDef<Quotation> = {
  name: 'dateNeeded', label: 'Due Date', kind: 'date', required: true,
  hint: 'When the customer needs the quotation back.',
};

/**
 * Created Date — stamped when the RFQ is saved, never typed.
 *
 * `readOnly`, which is what earns it the grey box while editing and a plain
 * white one while reading, per the customer's 25 Aug answer.
 */
const CREATED_DATE_FIELD: FieldDef<Quotation> = {
  name: 'createdDate', label: 'Created Date', kind: 'date', readOnly: true,
};

/**
 * The header's three regions. Field ORDER inside a group is unchanged from the
 * live screen; only the grouping is added, so nothing a user has learned moves
 * relative to anything else in its own section.
 */
export const HEADER_GROUPS: HeaderGroup[] = [
  {
    id: 'customer', title: 'Customer', icon: 'sell',
    fields: [byName('customer'), byName('customerContact'), byName('customerType')],
  },
  {
    id: 'project', title: 'Project', icon: 'parts',
    /* ITAR follows Project Name, as it does on the live form. */
    fields: [PROJECT_NAME_FIELD, byName('itar'), byName('projectType'), byName('orderType')],
  },
  {
    /* Everything that answers "is this on track, and whose is it". Kept together
       because they are read as a set: a due date means little without knowing
       who owns it and how urgent it is. */
    id: 'schedule', title: 'Schedule & ownership', icon: 'insight',
    fields: [byName('assignedTo'), byName('priority'), DUE_DATE_FIELD, CREATED_DATE_FIELD],
  },
];

/* =============================================================================
   THE FOUR SECTIONS OF THE SPECIFIC REQUIREMENTS TAB
   -----------------------------------------------------------------------------
   Names, membership and order read off the live form on 25 Aug 2026
   (docs/live-spec-25aug.md). The previous three groups — "Commercial",
   "Technical", "Inventory & options" — were invented, and their membership did
   not match the live screen either: Markup and Quantities To Quote sat under
   "Commercial" when the live form groups them with the other quoting inputs.

   The constants keep their old export names so nothing downstream has to move;
   only what they contain has changed.
   ========================================================================== */

/** QUOTE CONFIGURATION — what the quote optimises for and what it is marked up by. */
export const COMMERCIAL: FieldDef<Quotation>[] = [
  { name: 'quoteFocus', label: 'Quote Focus', kind: 'select', options: QUOTE_FOCUS, required: true,
    hint: 'What the sourcing engine optimises for when more than one part matches.' },
  { name: 'materialPackageType', label: 'Material Package Type', kind: 'select',
    options: MATERIAL_PACKAGE_TYPE, required: true },
  /* Defaults from the customer's `priceMarkup`, but stays editable: the live
     code only writes the default while markup is still unset, which is what an
     overridable default looks like. */
  { name: 'markup', label: 'Markup', kind: 'number', suffix: '%', min: 0, max: 100, required: true,
    hint: 'Applied to material and labour to produce the quoted total. Suggested from the customer.' },
  { name: 'leadTimeDays', label: 'Acceptable LeadTime In Day', kind: 'number', suffix: 'days',
    min: 1, required: true,
    hint: 'Parts quoted beyond this are flagged rather than silently accepted.' },
  /* A TEXTAREA in the live system, not a number: it holds the quantities
     themselves (a list of price breaks), not a count of them. */
  { name: 'quantitiesToQuote', label: 'Item Ant Quantities To Quote', kind: 'notes', required: true,
    hint: 'The quantities the customer wants priced, e.g. 100, 250, 500.' },
];

/** TECHNICAL SPECIFICATIONS — how it is built and what inventory rules apply. */
export const TECHNICAL: FieldDef<Quotation>[] = [
  /* There is no BUILD_REQUIREMENT metadata code. The live value observed was
     "System", which is an APPLICATION value, so this reuses that list —
     an inference, not a lookup, and still worth confirming with the business. */
  { name: 'buildRequirement', label: 'Build Requirement', kind: 'select', options: APPLICATION, required: true },
  { name: 'testRequirements', label: 'Test Requirements', kind: 'select', options: TEST_REQUIREMENTS, required: true },
  { name: 'assemblyTurnTime', label: 'Assembly Turn Time', kind: 'number', suffix: 'days', min: 1 },
  /* Lower-case "and", as the live form writes it. */
  /* Radio, not a dropdown — the live form shows all options at once, and the
     guideline says "allows the user to check one option" of each. */
  { name: 'excessAndMoq', label: 'Excess and MOQ', kind: 'radio', options: EXCESS_AND_MOQ, required: true },
  { name: 'netConsignedInventory', label: 'Net Consigned Inventory', kind: 'radio',
    options: NET_CONSIGNED_INVENTORY, required: true },
  /* "Rocket" is a real concept with its own metadata code (NET_ROCKET_INVENTORY),
     parallel to the consigned one. Not a typo — it is the customer's own
     part-number namespace, confirmed from the BoM comparison export. */
  { name: 'rocketConsignedInventory', label: 'Rocket Consigned Inventory', kind: 'radio',
    options: ROCKET_CONSIGNED_INVENTORY, required: true },
];

/** SPECIAL REQUIREMENTS & OPTIONS — three flags, none of them required. */
export const INVENTORY: FieldDef<Quotation>[] = [
  { name: 'conformalCoating', label: 'Conformal Coating', kind: 'flag' },
  /* One of the two corrections decision D2 kept: the live label reads
     "Provide Alt Aml For Out Stock", which mis-cases an acronym and drops a
     word. Everything else about it — Title Case, the "Alt" abbreviation — is
     house style and is left alone. */
  { name: 'provideAlternateAml', label: 'Provide Alt AML For Out of Stock', kind: 'flag' },
  { name: 'broker', label: 'Broker', kind: 'flag' },
];

/** ADDITIONAL NOTES. */
export const NOTES: FieldDef<Quotation>[] = [
  { name: 'customerNotes', label: 'Customer specific needs', kind: 'notes',
    hint: 'Visible to the customer if the quote is shared.' },
  /* Lower-case "notes", as the live form writes it. */
  { name: 'internalNotes', label: 'Internal notes', kind: 'notes',
    hint: 'Never leaves Linh Long.' },
];

/**
 * REMOVED, because the live record does not have them.
 *
 *   RFQ Type    — a grid column only; it is not on the form.
 *   Application — likewise a grid column only.
 *
 * Historical RFQ was on this list and should not have been. See below.
 */
export const NOT_ON_THE_RECORD = ['rfqType', 'application'] as const;

/**
 * Historical RFQ options, indexed by customer.
 *
 * The guideline scopes the list to "RFQs corresponding to the selected existing
 * customer" — offering every RFQ in the system would let someone copy details
 * across from a different customer's job.
 */
let HISTORICAL_BY_CUSTOMER: Record<string, string[]> = {};
export function setHistoricalRfqOptions(rows: { customer: string; no: string }[]) {
  const byCust: Record<string, string[]> = {};
  for (const r of rows) (byCust[r.customer] ??= []).push(`RFQ${r.no}`);
  HISTORICAL_BY_CUSTOMER = byCust;
}
export const historicalRfqsFor = (customer: string) =>
  ['', ...(HISTORICAL_BY_CUSTOMER[customer] ?? [])];

/**
 * Historical RFQ — shown only when Order Type is "Repeat".
 *
 * I removed this field on the evidence that it was absent from the record I
 * opened live. That record's Order Type was "New", so the field was correctly
 * hidden, and I read its absence as non-existence. The customer's Testing
 * Guideline is explicit:
 *
 *   "If selected value is Repeat, the Historical RFQ field is displayed below,
 *    allowing the user to select an existing RFQ associated with the selected
 *    customer in order to copy basic information from that RFQ and reduce
 *    re-entry effort."
 *   "Precondition: Displays when selected Order Type is Repeat."
 *   "The option list is populated with RFQs corresponding to the selected
 *    existing customer."
 *
 * So the options are scoped to the CUSTOMER, not to every RFQ in the system —
 * which is also why it is a lookup rather than free text.
 */
export const HISTORICAL_RFQ_FIELD: FieldDef<Quotation> = {
  name: 'historicalRfq', label: 'Historical RFQ', kind: 'lookup',
  optionsFor: (q: Quotation) => historicalRfqsFor(q.customer),
  hint: 'Copies basic information from the RFQ you pick, to save re-entry.',
};

/** True when the record should show Historical RFQ at all. */
export const showsHistoricalRfq = (q: Quotation) => q.orderType === 'Repeat';



/**
 * Every field the record form owns, and therefore every field validation and
 * change tracking see.
 *
 * DUE_DATE_FIELD and CREATED_DATE_FIELD are listed explicitly because they live
 * in HEADER_GROUPS rather than HEADER — they were rendered by hand before they
 * were declarations. Leaving them out here would have made Due Date carry a
 * required marker that nothing enforced: the Save button would arm with no due
 * date set, which is the same defect the marker exists to prevent, one step
 * further along.
 */
export const ALL_FIELDS = [
  PROJECT_NAME_FIELD, ...HEADER, DUE_DATE_FIELD, CREATED_DATE_FIELD,
  ...COMMERCIAL, ...TECHNICAL, ...INVENTORY, ...NOTES,
];

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
