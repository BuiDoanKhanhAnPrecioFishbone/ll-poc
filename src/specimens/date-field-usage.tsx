import { useState } from 'react';
import { DateField, DateRangeField } from '../ui/Inputs';
import { FieldRow, ReadValue } from '../ui/FieldRow';
import type { Example } from './types';

const d = (s: string) => new Date(s);

function Range() {
  const [from, setFrom] = useState<Date | null>(d('2026-10-01T00:00:00'));
  const [to, setTo] = useState<Date | null>(d('2026-10-31T00:00:00'));
  return <DateRangeField id="dodont-range" label="Date Needed"
                         from={from} to={to} onFrom={setFrom} onTo={setTo} />;
}

function Picked() {
  const [v, setV] = useState<Date | null>(d('2026-10-13T00:00:00'));
  return <DateField label="Ship Date" value={v} onChange={setV} />;
}

function Written() {
  const [v, setV] = useState<Date | null>(d('2026-11-18T09:42:00'));
  return <DateField label="Last run" withTime value={v} onChange={setV} />;
}

/**
 * The Date field page's USAGE tab, drawn.
 *
 * Two rules off `docs/components/date-field.md`. The first is hers and she
 * drew it rather than wrote it — two boxes, 8px apart — so a card is the
 * closest this documentation gets to showing her drawing.
 */
export const examples: Example[] = [
  {
    title: 'A range is two boxes',
    note: 'Her drawing, not one box with a two-month popup. Two boxes survive a narrow column and a phone; one box and a two-month calendar does not.',
    compare: [
      {
        verdict: 'do',
        caption: 'From and To, each a date in its own right, each typeable and each with its own calendar.',
        render: () => <Range />,
      },
      {
        verdict: 'dont',
        caption: 'One box holding two dates. It cannot be typed into, the popup needs the width of two months, and half the value cannot be changed on its own. Drawn by hand.',
        render: () => (
          <label className="vy-field-control">
            <span className="vy-field-label">Date Needed</span>
            <input className="vy-input" defaultValue="10/01/2026 – 10/31/2026" readOnly />
          </label>
        ),
      },
    ],
  },
  {
    title: 'Only a date a person chooses',
    note: 'A timestamp the system wrote is read-only text, formatted by `fmtDateTime`.',
    compare: [
      {
        verdict: 'do',
        caption: 'Ship Date is somebody’s decision, so it gets a control. Last run is a fact, so it gets a row.',
        render: () => (
          <div>
            <Picked />
            <FieldRow label="Last run" note="set by the system">
              <ReadValue>18 Nov 2026, 09:42</ReadValue>
            </FieldRow>
          </div>
        ),
      },
      {
        verdict: 'dont',
        caption: 'A calendar on a timestamp invites an edit the system will overwrite, and a user who tries it learns the screen lies.',
        render: () => <Written />,
      },
    ],
  },
];
