import { Card, SplitCard } from '../ui/Card';
import { Group, SectionHeading } from '../ui/Group';
import { ReadValue } from '../ui/FieldRow';
import type { Example } from './types';

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="vy-field-control">
      <span className="vy-field-label">{label}</span>
      <ReadValue>{value}</ReadValue>
    </div>
  );
}

export const examples: Example[] = [
  {
    title: 'Card',
    note: 'Border, radius, a header band — and no shadow. A shadow says a thing floats above the page, and this system spends that on popups, where it means "this will go away".',
    render: () => (
      <Card title="Cost Estimation" aside={<strong>$1,820.34</strong>}>
        <Group columns={2}>
          <Fact label="Material" value="$1,402.10" />
          <Fact label="Labour" value="$418.24" />
        </Group>
      </Card>
    ),
  },
  {
    title: 'Split card: two halves, no divider',
    note: 'The 28px gap is already separating them. A rule down the middle makes two cards pretending to be one — at which point they should be two cards.',
    render: () => (
      <SplitCard title="Quick Quote">
        <div>
          <SectionHeading>BoM Options</SectionHeading>
          <Fact label="Source" value="Franchised only" />
        </div>
        <div>
          <SectionHeading>Assembly</SectionHeading>
          <Fact label="Line" value="SMT 2" />
        </div>
      </SplitCard>
    ),
  },
];
