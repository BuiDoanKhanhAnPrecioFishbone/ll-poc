import type { Quotation } from '../../data/quotations';
import { showsHistoricalRfq } from './requirementFields';
import { Icon } from '../../ui/icons';

/**
 * Smart buttons — navigation to OTHER records this one is linked to.
 *
 * Flagged as missing in the 25 Aug review: "In leading ERP systems, every record
 * must have related navigation." The live Voyager RFQ has none either, so this
 * is an addition rather than a restoration — but it is the addition the reviewer
 * asked for, and the Customer Invoice mockup carries the same row.
 *
 * WHAT THIS ROW IS FOR, AND WHAT IT IS NOT FOR
 *
 * It carried six buttons, and five of them went to a TAB on this same page,
 * measured 469px below the row: Quote versions, Checklist tasks, Documents,
 * Conversations, Activity entries. Their counts were read from the very arrays
 * those tabs render, and the tab strip already prints the counts itself. The
 * row was a second, smaller copy of the tab strip.
 *
 * The pattern it was borrowed from does not work that way:
 *
 *   - Odoo's smart buttons count records in ANOTHER model and open that model
 *     filtered to this record.
 *   - SAP S/4HANA's document flow shows the documents BEFORE and AFTER this one
 *     in the chain.
 *   - Salesforce's own guidance is that showing a related list twice on one
 *     record "isn't very efficient".
 *   - And the kick-off deck's own example (slide 14) is three other records:
 *     `Linkage parts (1) · Open POs (0) · On hand (0)`.
 *
 * So the rule is now explicit, and it is the one the deck already used:
 *
 *   THE ROW IS FOR RECORDS WITH THEIR OWN SCREEN. THE TABS ARE FOR CONTENT THIS
 *   RECORD OWNS.
 *
 * Everything that went to a tab has been removed from the row; the tab strip
 * carries the count instead (Activity Logs gained the one it was missing).
 *
 * Two rules from the 25 Aug review survive unchanged:
 *
 * 1. They are NOT action buttons and must not look like them. An action button
 *    does something TO this record and may be irreversible; a smart button just
 *    goes somewhere. Giving both the same shape teaches users to hesitate before
 *    every click in the header.
 *
 * 2. Each carries a COUNT, so it answers "is there anything there" without being
 *    pressed. A zero stays visible rather than being hidden — "no payments yet"
 *    is a fact worth knowing, and a row whose buttons come and go cannot be
 *    learned by position. A button that points at ONE record takes no count:
 *    "1 Customer" would imply there could be two.
 *
 * WHAT IS NOT HERE YET, AND WHY
 *
 * The live audit log names the RFQ's real neighbours — `CreateBomFromRFQ`,
 * `MapBomPart`, `UnmapPartForRFQ`, `AddMPNMapping`, `CreateSaleOrder`,
 * `UpdateCustomerForRFQ`. Three of those cannot be linked honestly today:
 *
 *   - Customer and Sales Order have no screen in this prototype, and inventing
 *     a destination for a navigation button is worse than admitting it has none.
 *   - BoM and Part DO have screens, but nothing keys a BoM or a part back to an
 *     RFQ — on the list screens and in the live system's own BoM list, a BoM
 *     carries a customer, not an RFQ. A count built on the customer would say
 *     "9 BoMs" about BoMs belonging to other RFQs.
 *
 * All three are questions on the client document rather than guesses in here.
 */
export type SmartButton = {
  icon: string;
  /** Singular, used when the count is exactly 1. */
  label: string;
  plural: string;
  /** null means the destination is a single record, so a count is meaningless. */
  count: number | null;
  /**
   * Where it goes. Not optional any more.
   *
   * Every button used to end at a `notImplemented` toast, under a comment
   * promising each one "always GOES somewhere". Five of the six then got a tab,
   * which was a destination but the wrong kind. A button in this row now has a
   * route or it is not in this row.
   */
  to: string;
  /** Names the destination, because the label alone cannot say "filtered how". */
  title: string;
};

/**
 * @param customerRfqs how many Project Requirements this customer has, counted
 *   from the same rows the list screen shows — so the number on the button and
 *   the number of rows behind it cannot disagree.
 * @param historicalRfqId the record `historicalRfq` names, when it resolves.
 */
export function smartButtonsFor(
  q: Quotation,
  { customerRfqs, historicalRfqId }: { customerRfqs: number; historicalRfqId?: string },
): SmartButton[] {
  const out: SmartButton[] = [
    /* The customer's other work. Not the customer RECORD — that screen does not
       exist — but the question an estimator actually opens a customer for:
       what else is this customer asking us for. The count includes this RFQ,
       because the list it opens does too. */
    { icon: 'customer', label: 'Customer RFQ', plural: 'Customer RFQs',
      count: customerRfqs,
      to: `/sales-management/quotation?customer=${encodeURIComponent(q.customer)}`,
      title: `Project Requirements from ${q.customer}` },
  ];

  /* The predecessor document, in SAP's sense: a repeat order is quoted FROM an
     earlier RFQ, and the record already names it. It is the one cross-record
     link this prototype can resolve exactly, because both ends are RFQs. Shown
     only on repeat orders — on any other order type the field is not on the
     record either, so a button pointing at nothing would appear. */
  if (showsHistoricalRfq(q) && q.historicalRfq && historicalRfqId) {
    out.push({
      /* The stored value already reads `RFQ0000000312` — it is the option the
         lookup field offers, prefix and all. Naming the record IS the label:
         "Historical RFQ" would say what kind of link it is and not which. */
      icon: 'return', label: q.historicalRfq, plural: q.historicalRfq,
      count: null,
      to: `/sales-management/quotation/${historicalRfqId}`,
      title: 'The earlier RFQ this repeat order was quoted from',
    });
  }

  return out;
}


/**
 * The smart-button glyph.
 *
 * A thin wrapper over the one shared icon set rather than a second map — this
 * file used to carry its own, which duplicated six paths and silently drew a
 * document for any name it lacked.
 */
export function SmartIcon({ name }: { name: string }) {
  return <Icon name={name} size={15} />;
}
