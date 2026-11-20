import { FieldRow, ReadValue } from '../ui/FieldRow';
import { Checkbox } from '../ui/Overlays';
import type { Example } from './types';

/**
 * The Field row page's USAGE tab, drawn.
 *
 * Two rules off `docs/components/field-row.md`. The first is the one this
 * component makes structural — the presence of the reason IS the lock — and
 * seeing the two rows together is what makes "reads as broken" concrete.
 */
export const examples: Example[] = [
  {
    title: 'A locked row says why',
    note: 'There is no `locked` prop. The note is what marks it, because a row that cannot produce a reason has no business being locked.',
    compare: [
      {
        verdict: 'do',
        caption: 'Three reasons exist in this product, and each says something different: set by the system, follows Customer, computed not stored.',
        render: () => (
          <div>
            <FieldRow label="Customer Type" note="follows Customer">
              <ReadValue>Consigned</ReadValue>
            </FieldRow>
            <FieldRow label="Extended Cost" note="computed, not stored">
              <ReadValue>$1,820.34</ReadValue>
            </FieldRow>
          </div>
        ),
      },
      {
        verdict: 'dont',
        caption: 'Locked with nothing beside it reads as broken, or as a permission the user does not have — and they go and ask about the wrong one.',
        render: () => (
          <div>
            <FieldRow label="Customer Type">
              <ReadValue>Consigned</ReadValue>
            </FieldRow>
            <FieldRow label="Extended Cost">
              <ReadValue>$1,820.34</ReadValue>
            </FieldRow>
          </div>
        ),
      },
    ],
  },
  {
    title: 'Not over a control that labels itself',
    note: 'A checkbox carries its own words. Omit the label and the row holds the control alone.',
    compare: [
      {
        verdict: 'do',
        caption: 'One set of words. The box and its sentence are a single target.',
        render: () => (
          <FieldRow>
            <Checkbox checked onCheckedChange={() => {}} label="Conformal Coating" />
          </FieldRow>
        ),
      },
      {
        verdict: 'dont',
        caption: 'The words twice, once as a heading and once beside the box — and a screen reader announces both.',
        render: () => (
          <FieldRow label="Conformal Coating">
            <Checkbox checked onCheckedChange={() => {}} label="Conformal Coating" />
          </FieldRow>
        ),
      },
    ],
  },
];
