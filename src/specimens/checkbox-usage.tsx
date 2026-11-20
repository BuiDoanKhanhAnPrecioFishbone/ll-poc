import { Checkbox } from '../ui/Overlays';
import type { Example } from './types';

/**
 * The Checkbox page's USAGE tab, drawn.
 *
 * Two rules off `docs/components/checkbox.md`, both of them about the shape
 * of the question rather than the look of the control — which is exactly
 * where a reader needs the two versions side by side.
 */
export const examples: Example[] = [
  {
    title: 'Independent, not exclusive',
    note: 'Checkboxes are independent yes/nos. One choice among several is a radio group.',
    compare: [
      {
        verdict: 'do',
        caption: 'Three options that have nothing to do with each other. Any combination is a legal answer.',
        render: () => (
          <div>
            <Checkbox checked onCheckedChange={() => {}} label="Conformal Coating" />
            <Checkbox checked={false} onCheckedChange={() => {}} label="Provide Alt AML For Out of Stock" />
            <Checkbox checked={false} onCheckedChange={() => {}} label="Include inactive parts" />
          </div>
        ),
      },
      {
        verdict: 'dont',
        caption: 'One answer dressed as three. Nothing stops the user ticking two, and nothing on screen says they may not.',
        render: () => (
          <div>
            <Checkbox checked onCheckedChange={() => {}} label="Consigned" />
            <Checkbox checked={false} onCheckedChange={() => {}} label="Turnkey" />
            <Checkbox checked={false} onCheckedChange={() => {}} label="Partial Turnkey" />
          </div>
        ),
      },
    ],
  },
  {
    title: 'Some is a third state',
    note: 'A select-all box over a part-selected page is indeterminate — the state Kendo’s own component has no prop for, and the reason this one is a class.',
    compare: [
      {
        verdict: 'do',
        caption: 'The dash says some, not all. Pressing it is a decision the user can make knowing where they stand.',
        render: () => (
          <label className="vy-check">
            <input type="checkbox" className="k-checkbox k-checkbox-lg"
                   ref={el => { if (el) el.indeterminate = true; }} readOnly />
            <span>Select all 20 on this page</span>
          </label>
        ),
      },
      {
        verdict: 'dont',
        caption: 'Empty, with six rows ticked below it. The box says nothing is selected and the page says otherwise.',
        render: () => (
          <label className="vy-check">
            <input type="checkbox" className="k-checkbox k-checkbox-lg" checked={false} readOnly />
            <span>Select all 20 on this page</span>
          </label>
        ),
      },
    ],
  },
];
