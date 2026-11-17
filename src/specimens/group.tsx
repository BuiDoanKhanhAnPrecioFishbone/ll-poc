import { CollapsibleGroup, Group, SectionHeading } from '../ui/Group';
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
    title: 'Group: no box, no fill',
    note: 'Her whole specification for it. A group divides one surface into readable parts; a card is a surface of its own.',
    render: () => (
      <Group title="Order Info">
        <Fact label="Order Date" value="10/02/2026" />
        <Fact label="Terms" value="Net 30" />
        <Fact label="Incoterm" value="DDP" />
      </Group>
    ),
  },
  {
    title: 'Two groups in a row',
    note: 'The rule beside each heading is what stops a 12px heading from reading as a field label, which at this size it otherwise would.',
    /* One element, not a fragment: the specimen stage lays its children out
       in a row, so two sibling sections would sit side by side and collapse
       into each other. */
    render: () => (
      <div className="vy-specimen-stack">
        <Group title="Order Info" columns={2}>
          <Fact label="Order Date" value="10/02/2026" />
          <Fact label="Terms" value="Net 30" />
        </Group>
        <Group title="Shipping" columns={2}>
          <Fact label="Ship Via" value="Air" />
          <Fact label="Dock" value="3" />
        </Group>
      </div>
    ),
  },
  {
    title: 'Section heading on its own',
    render: () => <SectionHeading>Order Lines</SectionHeading>,
  },
  {
    title: 'Collapsible group',
    note: 'Open by default, which is a decision rather than a default: a collapsed group hides fields from someone who does not know they are there.',
    render: () => (
      <CollapsibleGroup title="Advanced Settings" columns={2} defaultOpen={false}>
        <Fact label="Attrition" value="2.5%" />
        <Fact label="MOQ Override" value="None" />
      </CollapsibleGroup>
    ),
  },
];
