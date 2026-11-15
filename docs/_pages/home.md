# Voyager IQ Design System

The design system behind the Voyager ERP revamp: the tokens, the components and
the rules that make one screen look like it belongs beside the next.

Production is **KendoReact**, so this is not a library of its own. It is a set
of decisions applied to Kendo through
[`kendo-bridge.css`](foundations/tokens/use-tokens-in-code.md), plus the
components Kendo does not cover. The system is the decisions; the library
underneath has already been swapped twice without them moving.

## Where to start

| | |
| --- | --- |
| **[Foundations](foundations.md)** | Colour, typography, spacing, motion and the rest — every value with the measurement that chose it |
| **[Components](components.md)** | 29 pages, each with examples you can press, the API, usage guidance and its own changelog |
| **[Patterns](patterns.md)** | How components combine: record forms, list screens, destructive actions, the four screen states |
| **[All tokens](foundations/tokens/all-tokens.md)** | 238 tokens in one table, light and dark |

## What is unusual about this one

**Every number carries its source.** A contrast ratio comes with the date it was
measured; a decision comes with the date it was taken and what was rejected.
Where two of the project's own documents disagree, the pages say so rather than
picking one quietly.

**The checks run on every push.** Contrast is re-measured across 184 token pairs
before a commit leaves the machine, and seven browser checks — rendering, touch
targets, focus, hover, borders, the grid, small screens — run in CI. A page can
be wrong, but it cannot be wrong about a number that a check covers.

**The specimen beats the document.** Where a page and the running product
disagree, the product is right and the page is the bug. The live examples on
each component page render the real component out of `src/ui`, not a copy made
to look right.

## What is not written yet

26 of these pages are placeholders, and each one says so. The content and logos
foundations, the get-started guides, the tools page and the changelog feed are
outlined but unwritten. They are listed in the navigation deliberately: a gap
you can see is a gap someone can close.
