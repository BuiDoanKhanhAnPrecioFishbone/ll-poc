import { Banner } from '../ui/Banner';
import type { Example } from './types';

/* Her two banners, 16 Nov 2026. One element, two meanings — the only thing
   that changes is which meaning pair it draws from. */
export const examples: Example[] = [
  {
    title: 'Information',
    note: 'Something worth knowing that changes nothing. The default kind.',
    render: () => (
      <Banner>First order for this customer.</Banner>
    ),
  },
  {
    title: 'Warning',
    note: 'Something to check that does not block the next step.',
    render: () => (
      <Banner kind="warning">2 parts have no supplier.
      </Banner>
    ),
  },
  {
    title: 'Both, as a reader meets them',
    note: 'The pair has to be separable at a glance, which is why the text colour moves with the fill rather than staying one ink.',
    render: () => (
      <>
        <Banner>Prices follow the customer contract.</Banner>
        <Banner kind="warning">Stock is short on 3 lines.</Banner>
      </>
    ),
  },
];
