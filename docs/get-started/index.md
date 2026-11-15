# Get started

The design system behind the Voyager ERP revamp. Production is **KendoReact**,
so this is not a library of its own: it is a set of decisions applied to Kendo
through a bridge stylesheet, plus the components Kendo does not cover.

## Three audiences, three pages

| You are | Go to | What is there |
|---|---|---|
| A designer | [For designers](design.md) | There is no Figma library. This says what stands in for one |
| A developer | [For developers](develop.md) | Where the code lives and how it is checked |
| Writing the words in the product | [For content](content-design.md) | The settled rules for labels, errors and toasts, and the ones still unwritten |

## What you are looking at

| | |
|---|---|
| **Foundations** | Colour, type, spacing, motion and the rest, each value with the measurement that chose it |
| **Components** | 29 pages, 20 of them with a live example you can press |
| **Patterns** | How components combine: record forms, list screens, destructive actions, the four screen states |
| **Tokens** | 238, in one table, light and dark — [All tokens](../foundations/tokens/all-tokens.md) |

The component layer is Kendo where Kendo has a control, plus three Radix
primitives (popover, toast, slot) and the components that are ours.

## How to read it

- **A number carries its source.** A contrast ratio comes with the date it was
  measured; a decision comes with the date it was taken.
- **The specimen beats the document.** Where a page and the running product
  disagree, the product is right and the page is the bug.
- **A gap you can see is a gap someone can close.** Unwritten pages are in the
  navigation, marked as planned, rather than left out.

## Next

[Foundations](../foundations.md) if you do not yet know which of the three you
are. [Tools](../tools.md) for what is checked, and when.
