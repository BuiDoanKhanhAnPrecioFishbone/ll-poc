import type { Part } from './parts';
import type { ViewField } from '../ui/views';

/**
 * The Part Master filter fields.
 *
 * MY JUDGEMENT, and labelled as such per `docs/precedence.md` tier 3. The
 * guideline asks for "Multi-Criteria Filtering, Customizable column visibility,
 * Flexible sorting" on this screen and does not name the fields, and I have no
 * reading of the live Part Master filter toolbar to take them from — unlike
 * Project Requirements, whose eleven controls were read off the live screen on
 * 25 Aug. If that reading is taken later and disagrees, the live one wins.
 *
 * Chosen on the same rule the live toolbar follows elsewhere: every field is a
 * PICKER over values the data actually holds, so a filter can never return
 * nothing through a typo. The seven here are the categorical columns of the
 * part record — the questions that narrow 2,000 parts to a workable set.
 * Numeric columns (On Hand, Allocated, Unit Cost) are deliberately absent:
 * they want ranges and operators, and `docs/filter-spec.md` records that this
 * system has no operators anywhere.
 */
export function partFilterFields(rows: Part[]): ViewField<Part>[] {
  const uniq = (xs: string[]) => [...new Set(xs)].filter(Boolean).sort();

  return [
    { field: 'customer', label: 'Customer', kind: 'select',
      options: uniq(rows.map(p => p.customer)),
      value: p => p.customer },

    { field: 'partSource', label: 'Part Source', kind: 'select',
      /* Two values today. The guideline lists six — BUY, CONSG, FLSTK, MAKE,
         MAKE/BUY, MAKE/PHAN — and `Part.partSource` carries only MAKE and BUY,
         which is recorded in docs/testing/part-master-mfg-mpn-assessment.md as
         a gap that blocks two source-gated behaviours. Reading the options off
         the rows rather than hard-coding the pair means this picker grows on
         its own when the type is widened, instead of becoming a second place
         that has to be found and corrected. */
      options: uniq(rows.map(p => p.partSource)),
      value: p => p.partSource },

    { field: 'partClass', label: 'Part Class', kind: 'select',
      options: uniq(rows.map(p => p.partClass)),
      value: p => p.partClass },

    { field: 'partType', label: 'Part Type', kind: 'select',
      options: uniq(rows.map(p => p.partType)),
      value: p => p.partType },

    { field: 'abc', label: 'ABC', kind: 'select',
      options: uniq(rows.map(p => p.abc)),
      value: p => p.abc },

    { field: 'uom', label: 'UoM', kind: 'select',
      options: uniq(rows.map(p => p.uom)),
      value: p => p.uom },

    { field: 'status', label: 'Status', kind: 'select',
      options: ['Active', 'Inactive', 'Obsolete', 'Pending'],
      value: p => p.status },

    /* The one range. "parts touched since X" is the question a buyer actually
       brings to this screen, and a date range is two inputs rather than an
       operator, so it stays inside the no-operators rule. */
    { field: 'lastChange', label: 'Last Changed', kind: 'date-range',
      value: p => p.lastChange },
  ];
}
