import type { ReactNode } from 'react';

/** One live example on a component's design system page. */
export type Example = {
  title: string;
  note?: string;
  /** The example itself, on one stage. */
  render?: () => ReactNode;
  /**
   * Side-by-side Do / Don't cards instead of a single stage.
   *
   * ASKED FOR, 20 Nov 2026: *"the usage sections could be prettier — an
   * illustration like Atlassian's would be easier to understand"*. Atlassian,
   * Carbon, Polaris and Material all land on the same shape for usage
   * guidance, and the reason is that a rule about APPEARANCE read as a
   * sentence has to be rebuilt in the reader's head before it means anything.
   * *"One filled button per view"* is four words; two cards showing one filled
   * button and then three is instant.
   *
   * THEY ARE REAL COMPONENTS, not pictures of them. Every other house draws
   * these as exported images, which go stale the moment a token moves — and
   * this system has moved its radius scale once already. These render the same
   * `src/ui` components the product renders, in the same stylesheet, so a
   * "Don't" card that stops being wrong is impossible to leave behind.
   */
  compare?: Compare[];
};

/** One card of a Do / Don't pair. */
export type Compare = {
  verdict: 'do' | 'dont';
  /** One line, in the imperative, saying what the card shows. */
  caption: string;
  render: () => ReactNode;
};
