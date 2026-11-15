import type { Example } from './types';

export type { Example } from './types';

/**
 * Live examples, one list per component page on the design system site.
 *
 * WHY THIS EXISTS RATHER THAN A SCREENSHOT. `capture-components.mjs` already
 * photographs components inside the real product, which is the more honest
 * picture and stays. What a photograph cannot do is be pressed, focused or
 * read by a screen reader, and an Examples tab that cannot be used is a
 * catalogue rather than a specimen. Both are kept: the photograph shows where
 * a component really lives, this shows what it does.
 *
 * The design system's own rule holds here — the specimen wins over the
 * document — so these render the REAL components out of `src/ui`, never a copy
 * made to look right.
 *
 * NO SHARED LIST TO EDIT. Each component's examples live in
 * `src/specimens/<slug>.tsx` exporting `examples`, and the file name IS the
 * slug the `<!-- ds:specimen <slug> -->` directive names. Vite collects them,
 * so adding a component touches one new file and nothing else — which is what
 * lets several of them be written at the same time without colliding here.
 * `ds-site.mjs` reads the same directory, so a directive naming a slug nobody
 * wrote fails the build instead of leaving a blank frame on the page.
 *
 * LINT. `react/only-export-components` is off for `src/specimens/*.tsx` in
 * `.oxlintrc.json`. The rule protects fast refresh, and these files break it
 * by design: each exports an `examples` array AND declares the small stateful
 * components an example needs to be usable rather than a picture. The cost is
 * that editing a specimen reloads the page instead of hot-patching it, which
 * is paid in files nobody edits while building a screen. It is off for this
 * directory only, so the rule still guards the product.
 */
const modules = import.meta.glob<{ examples: Example[] }>('./*.tsx', { eager: true });

export const specimens: Record<string, Example[]> = Object.fromEntries(
  Object.entries(modules)
    .filter(([, m]) => Array.isArray(m.examples))
    .map(([file, m]) => [file.replace(/^\.\/|\.tsx$/g, ''), m.examples]),
);
