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

/**
 * The Card page's USAGE tab, drawn.
 *
 * Three rules off `docs/components/card.md`, and all three are about an edge
 * that should not be there. A boundary is the hardest thing to argue about in
 * words, because the sentence describing a box and the sentence describing no
 * box are the same length.
 */
export const examples: Example[] = [
  {
    title: 'Card, or group',
    note: 'A card is a surface of its own. A group divides ONE surface into readable parts — her words are “no box, no fill”.',
    compare: [
      {
        verdict: 'do',
        caption: 'One card, two groups inside it. The card says “this block stands apart”; the groups say “these fields belong together”.',
        render: () => (
          <Card title="Cost Estimation" aside={<strong>$1,820.34</strong>}>
            <Group title="Material" columns={2}>
              <Fact label="Components" value="$1,402.10" />
              <Fact label="Consumables" value="$61.00" />
            </Group>
            <Group title="Labour" columns={2}>
              <Fact label="Assembly" value="$418.24" />
              <Fact label="Test" value="$39.00" />
            </Group>
          </Card>
        ),
      },
      {
        verdict: 'dont',
        caption: 'Cards inside a card. Every edge asks the reader to work out what it separates, and three of them separate nothing.',
        render: () => (
          <Card title="Cost Estimation" aside={<strong>$1,820.34</strong>}>
            <Card title="Material">
              <Fact label="Components" value="$1,402.10" />
            </Card>
            <Card title="Labour">
              <Fact label="Assembly" value="$418.24" />
            </Card>
          </Card>
        ),
      },
    ],
  },
  {
    title: 'No shadow',
    note: 'A shadow says a thing floats above the page, and this system spends that signal on popups, where it means “this will go away”.',
    compare: [
      {
        verdict: 'do',
        caption: 'Flat, with a border. It sits on the page, which is what it does.',
        render: () => (
          <Card title="Quick Quote">
            <Fact label="Lead time" value="12 days" />
          </Card>
        ),
      },
      {
        verdict: 'dont',
        caption: 'Lifted, it promises to go away when dismissed — and a card cannot be dismissed. Drawn by hand: the component has no way to do this.',
        render: () => (
          <div style={{ boxShadow: 'var(--vy-elev-2)', borderRadius: 'var(--vy-radius-lg)' }}>
            <Card title="Quick Quote">
              <Fact label="Lead time" value="12 days" />
            </Card>
          </div>
        ),
      },
    ],
  },
  {
    title: 'A split card has no divider',
    note: 'The 28px gap is already separating the two halves.',
    compare: [
      {
        verdict: 'do',
        caption: 'Two halves, each with its own heading, and nothing drawn between them.',
        render: () => (
          <SplitCard title="Requirement">
            <div>
              <SectionHeading>Customer</SectionHeading>
              <Fact label="Name" value="KT Controls Ltd" />
            </div>
            <div>
              <SectionHeading>Project</SectionHeading>
              <Fact label="Type" value="Test Development" />
            </div>
          </SplitCard>
        ),
      },
      {
        verdict: 'dont',
        caption: 'A rule down the middle makes two cards pretending to be one — at which point they should be two cards.',
        render: () => (
          <SplitCard title="Requirement">
            <div>
              <SectionHeading>Customer</SectionHeading>
              <Fact label="Name" value="KT Controls Ltd" />
            </div>
            <div style={{ borderLeft: '1px solid var(--vy-border)', paddingLeft: 'var(--vy-space-10)' }}>
              <SectionHeading>Project</SectionHeading>
              <Fact label="Type" value="Test Development" />
            </div>
          </SplitCard>
        ),
      },
    ],
  },
];
