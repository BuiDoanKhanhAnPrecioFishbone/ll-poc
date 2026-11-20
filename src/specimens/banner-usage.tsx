import { Banner } from '../ui/Banner';
import type { Example } from './types';

/**
 * The Banner page's USAGE tab, drawn.
 *
 * Three rules, all of them already on `docs/components/banner.md` — nothing
 * here is new guidance. These are the three whose cost a reader only sees
 * when the wrong version is in front of them.
 */
export const examples: Example[] = [
  {
    title: 'One at a time',
    note: 'Two banners stacked read as a band of noise, and the second is the one that gets skipped.',
    compare: [
      {
        verdict: 'do',
        caption: 'Say the one thing that changes what the reader does next.',
        render: () => <Banner kind="warning">2 parts have no supplier.</Banner>,
      },
      {
        verdict: 'dont',
        caption: 'Stack them and the reader learns to scroll past the whole region.',
        /* Wrapped, so the stage sees ONE child and gives it the full width —
           a banner that shrinks to its sentence is not the shape it has on a
           record, and the card would be arguing against a straw man. */
        render: () => (
          <div>
            <Banner>Prices follow the customer contract.</Banner>
            <Banner kind="warning">2 parts have no supplier.</Banner>
            <Banner>First order for this customer.</Banner>
          </div>
        ),
      },
    ],
  },
  {
    title: 'The words carry the meaning',
    note: 'The kind is colour in the markup, and colour is never allowed to be the only carrier. Turn the page greyscale: nothing should be lost.',
    compare: [
      {
        verdict: 'do',
        caption: 'A warning in any colour — the sentence itself says what is wrong.',
        render: () => <Banner kind="warning">2 parts have no supplier.</Banner>,
      },
      {
        verdict: 'dont',
        caption: 'A heading, not a message. Without the yellow it says nothing at all.',
        render: () => <Banner kind="warning">Supplier status</Banner>,
      },
    ],
  },
  {
    title: 'Not for what just happened',
    note: 'A banner has no beginning, so it reads as a standing fact about the record. A result belongs in a toast.',
    compare: [
      {
        verdict: 'do',
        caption: 'A condition of the record, true until someone changes it.',
        render: () => <Banner>First order for this customer.</Banner>,
      },
      {
        verdict: 'dont',
        caption: 'An event. Read ten minutes later it says the record is permanently in the act of being saved.',
        render: () => <Banner>Quotation saved.</Banner>,
      },
    ],
  },
];
