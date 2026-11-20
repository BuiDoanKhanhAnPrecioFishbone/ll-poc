import { RecordSkeleton } from '../ui/RecordSkeleton';
import { HEADER_GROUPS } from '../components/quotation/requirementFields';
import type { Example } from './types';

/**
 * The Record skeleton page's USAGE tab, drawn.
 *
 * One pair, on the claim the page makes and cannot show: a skeleton greys out
 * what it does not know yet, and on a record screen that is less than people
 * assume. The labels, the grouping and the order are in the field
 * declarations, which are already in hand.
 */
export const examples: Example[] = [
  {
    title: 'Only the values are bars',
    note: 'Greying the labels too would hide something the screen already knows — and tell the user less while they wait, not more.',
    compare: [
      {
        verdict: 'do',
        caption: 'The reader can see which record this is going to be, and start deciding where to look before it lands.',
        render: () => <RecordSkeleton groups={HEADER_GROUPS.slice(0, 2)} />,
      },
      {
        verdict: 'dont',
        caption: 'Everything grey says only “wait”. It also hides the one thing that was never in flight: what this screen is about. Drawn by hand.',
        render: () => (
          <div className="vy-record-skeleton" aria-hidden
               style={{ display: 'grid', gap: 'var(--vy-space-6)', width: '100%' }}>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} style={{ display: 'grid', gap: 'var(--vy-space-2)' }}>
                <span className="vy-skeleton-cell" style={{ width: 90, height: 10 }} />
                <span className="vy-skeleton-cell" style={{ width: '60%', height: 16 }} />
              </div>
            ))}
          </div>
        ),
      },
    ],
  },
];
