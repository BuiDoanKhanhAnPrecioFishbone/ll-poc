import { CollapsibleGroup, Group } from '../ui/Group';
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
 * The Group page's USAGE tab, drawn.
 *
 * Three rules off `docs/components/group.md`. The first is the one this page
 * makes an argument for and cannot show: at 12px a heading and a field label
 * are the same size, and only the rule beside the heading tells them apart.
 * Side by side it takes no argument at all.
 */
export const examples: Example[] = [
  {
    title: 'The rule is not decoration',
    note: 'At 12px a heading and a field label are the same size. The line is what says which is which.',
    compare: [
      {
        verdict: 'do',
        caption: 'The rule runs out from the heading, so the eye reads a section title and then the fields under it.',
        render: () => (
          <Group title="Order Info" columns={2}>
            <Fact label="Order Date" value="10/02/2026" />
            <Fact label="Terms" value="Net 30" />
          </Group>
        ),
      },
      {
        verdict: 'dont',
        caption: 'The same 12px at 600 with no rule beside it IS a field label — this card is drawn with one — so “Order Info” reads as a label whose field has gone missing.',
        render: () => (
          <section className="vy-group">
            <span className="vy-field-label" style={{ display: 'block', marginBottom: 'var(--vy-space-6)' }}>
              Order Info
            </span>
            <div className="vy-group-fields" data-columns={2}>
              <Fact label="Order Date" value="10/02/2026" />
              <Fact label="Terms" value="Net 30" />
            </div>
          </section>
        ),
      },
    ],
  },
  {
    title: 'Not for one field',
    note: 'A heading over a single field says the heading twice.',
    compare: [
      {
        verdict: 'do',
        caption: 'Three fields that belong together, under one name.',
        render: () => (
          <Group title="Shipping" columns={3}>
            <Fact label="Incoterm" value="DDP" />
            <Fact label="Destination" value="Hanoi" />
            <Fact label="Carrier" value="DHL" />
          </Group>
        ),
      },
      {
        verdict: 'dont',
        caption: 'The heading and the label say the same thing, one above the other, and the reader looks for the second field that is not there.',
        render: () => (
          <Group title="Incoterm" columns={1}>
            <Fact label="Incoterm" value="DDP" />
          </Group>
        ),
      },
    ],
  },
  {
    title: 'Collapsible groups open',
    note: 'A decision, not a default. A collapsed group hides fields from someone who does not know they are there.',
    compare: [
      {
        verdict: 'do',
        caption: 'Shut is right for Advanced Settings, which is her own example — a reader who needs it knows to look.',
        render: () => (
          <CollapsibleGroup title="Advanced Settings" columns={2} defaultOpen={false}>
            <Fact label="Rounding" value="2 decimals" />
            <Fact label="Tolerance" value="±5%" />
          </CollapsibleGroup>
        ),
      },
      {
        verdict: 'dont',
        caption: 'Shut over fields the user has to fill in, and the form is saved with them empty by someone who never saw them.',
        render: () => (
          <CollapsibleGroup title="Customer" columns={2} defaultOpen={false}>
            <Fact label="Customer" value="—" />
            <Fact label="Customer Type" value="—" />
          </CollapsibleGroup>
        ),
      },
    ],
  },
];
