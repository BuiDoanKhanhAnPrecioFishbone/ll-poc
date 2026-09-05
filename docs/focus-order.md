# Focus order pass — 5 September 2026

Closes the two gaps left open by phase 8 and the UX audit: *"Tab ORDER within the
grid … not for whether the sequence is sensible on a 15-column row"*
(`kendo-migration-scope.md`) and *"Keyboard traversal was checked for focus
containment, not for tab ORDER within each dialog"* (`ux-audit.md`).

**Result: nothing to fix.** That is the first measurement pass this session to
come back clean, so the method is described before the result.

## Method, and why the result can be trusted

Tab order was derived from the DOM — the focusable set, in document order, minus
anything `disabled`, zero-sized, hidden or at a negative tabindex — and then
**checked against the real thing**: eight actual Tab presses on Part Master
visited exactly the eight elements predicted, in order. A derived order that
nobody pressed a key against is a guess.

## The grid uses a correct roving tabindex

This was the phase 8 worry, and the answer is the opposite of what "15 columns"
suggests. Of 315 grid cells:

| tabindex | cells |
|---|---|
| `0` | **1** |
| `-1` | 313 |
| none | 1 |

One cell is reachable by Tab; the rest are reached with arrow keys. So the grid's
cell navigation is **a single tab stop**, not fifteen per row — the standard ARIA
grid pattern, and Kendo does it properly.

## What a row actually costs

| | stops |
|---|---|
| 19 rows | **2** each — the row checkbox, and the part-number link |
| 1 row | 3 — the same two plus the roving cell, which currently sits there |
| grid body total | **41** |
| whole page | 85 |

So **48% of the page's tab stops are inside the grid**, and crossing a
twenty-row page takes about forty presses. That is inherent to a grid with a
checkbox and a link on every row rather than a defect — nothing in WCAG caps
stops — and the page opens with a working **"Skip to content"** link. Worth
knowing rather than fixing.

## Dialogs run column by column

The multi-column form was the other risk: a three-column grid whose DOM order
disagrees with its visual grouping tabs sideways across unrelated fields. It does
not. In Add Part Master Detail, 31 stops in order:

> chrome → **Part identification** → **Classification** → **Handling** → tab strip
> → **Sales & Purchase** → **Requests & Controls** → **Dimensions & Packages**

Each column is completed before the next begins, which is what the headings
promise. No group is left and returned to.

## Things that looked like faults and were not

- **Three "backward jumps"** flagged by the first pass. Two are region changes —
  the end of the sidebar to the start of the header, the last grid row to the
  pager — where moving up the page is correct. The third is a row scrolled
  below the pager inside the grid's own scroll container; focusing it scrolls it
  into view. A heuristic that flags any upward move flags all three.
- **"Three stops per row."** Wrong reading of my own probe: it was the first
  row's count, and that row happens to hold the roving cell. The other nineteen
  have two.

## No positive tabindex anywhere

Zero elements on the page carry a `tabindex` above 0 — the anti-pattern that
detaches tab order from document order, and the usual cause of unfixable focus
bugs. Worth stating explicitly, because its absence is what makes DOM order a
trustworthy proxy for tab order everywhere else in this document.

## Not covered

The Run Quotation wizard's step 4, the Result tab and the checklist screens —
the same surfaces the contrast sweep could not reach.
