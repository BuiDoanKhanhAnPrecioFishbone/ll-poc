import type { ReactNode } from 'react';

/** One live example on a component's design system page. */
export type Example = { title: string; note?: string; render: () => ReactNode };
