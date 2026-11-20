import { useState } from 'react';
import { NumberField } from '../ui/Inputs';
import type { Example } from './types';

function Num({ kind, label, start }: { kind: 'integer' | 'decimal' | 'currency' | 'percent'; label: string; start: number }) {
  const [v, setV] = useState<number | null>(start);
  return <NumberField kind={kind} label={label} value={v} onChange={setV} />;
}

/**
 * The Number field page's USAGE tab, drawn.
 *
 * Two rules off `docs/components/number-field.md`, both of them hers, and
 * both about the same thing from different ends: a number box should not ask
 * the user to type around it, and it should not quietly round away the part
 * of the value the business depends on.
 */
export const examples: Example[] = [
  {
    title: 'The unit goes in the label',
    note: 'Her examples are written that way — “Markup (%)”, “Unit Price (USD)” — and the reason stands on its own.',
    compare: [
      {
        verdict: 'do',
        caption: 'The box holds the number and nothing else. The user types 12 and is finished.',
        render: () => <Num kind="percent" label="Markup (%)" start={12} />,
      },
      {
        verdict: 'dont',
        caption: 'A suffix inside the box is something to type around, and a user who types 12% into a field already showing % has made an error the field invented. Drawn by hand.',
        render: () => (
          <label className="vy-field-control">
            <span className="vy-field-label">Markup</span>
            <span style={{ position: 'relative', display: 'block' }}>
              <input className="vy-input" defaultValue="12.00" style={{ paddingInlineEnd: 'var(--vy-space-11)' }} />
              <span style={{ position: 'absolute', insetInlineEnd: 'var(--vy-space-5)', insetBlockStart: '50%',
                             transform: 'translateY(-50%)', color: 'var(--vy-on-surface-muted)' }}>%</span>
            </span>
          </label>
        ),
      },
    ],
  },
  {
    title: 'Currency keeps six places',
    note: 'A unit price in this business can be $0.000012. Her own example is written to six places, and `fmtMoney` already carried the same note.',
    compare: [
      {
        verdict: 'do',
        caption: 'Six decimals. The price of a resistor is a real number here, not a rounding error.',
        render: () => <Num kind="currency" label="Unit Price (USD)" start={0.000012} />,
      },
      {
        verdict: 'dont',
        caption: 'Two decimals is the shop-front habit, and it turns a quotable price into $0.00 — the one figure the whole quotation is built on.',
        render: () => <Num kind="decimal" label="Unit Price (USD)" start={0.000012} />,
      },
    ],
  },
];
