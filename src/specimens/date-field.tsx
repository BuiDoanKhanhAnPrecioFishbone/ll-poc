import { useState } from 'react';
import { DateField, DateRangeField } from '../ui/Inputs';
import type { Example } from './types';

const d = (s: string) => new Date(s);

function Single() {
  const [v, setV] = useState<Date | null>(d('2026-10-13T00:00:00'));
  return <DateField label="Ship Date" value={v} onChange={setV} />;
}

function WithTime() {
  const [v, setV] = useState<Date | null>(d('2026-10-13T10:30:00'));
  return <DateField label="Pickup Time" withTime value={v} onChange={setV}
                    hint="24-hour here; the BA's examples read 10:30 AM. Open with her." />;
}

function Range() {
  const [from, setFrom] = useState<Date | null>(d('2026-10-01T00:00:00'));
  const [to, setTo] = useState<Date | null>(d('2026-10-31T00:00:00'));
  return <DateRangeField id="specimen-range" label="Date Needed"
                         from={from} to={to} onFrom={setFrom} onTo={setTo} />;
}

function Empty() {
  const [v, setV] = useState<Date | null>(null);
  return <DateField label="Ship Date" value={v} onChange={setV}
                    hint="The placeholder is the pattern, so an empty box says what shape it wants." />;
}

export const examples: Example[] = [
  {
    title: 'Date',
    note: 'Open the calendar. The pattern follows the region setting — switch to German and the order changes with it.',
    render: () => <Single />,
  },
  {
    title: 'Datetime',
    render: () => <WithTime />,
  },
  {
    title: 'Date range: two boxes, 8px apart',
    note: 'Her drawing, not Kendo’s single-box range picker — two boxes survive a narrow column, one box and a two-month popup does not.',
    render: () => <Range />,
  },
  {
    title: 'Empty',
    render: () => <Empty />,
  },
];
