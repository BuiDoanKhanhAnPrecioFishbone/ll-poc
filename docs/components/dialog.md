# Dialog

> **Status: stable** · `src/ui/Overlays.tsx` · 30 call sites.
> Written to the template set by [`button.md`](button.md).

---

<!-- ds:specimen dialog -->

## When to use

When the user must deal with **one thing** before carrying on: a question, a
short form, or a work surface too big to sit inside the record.

## When not to use

| Instead of a dialog | Use | Why |
|---|---|---|
| Telling the user something worked | A [toast](../patterns/feedback.md) | A dialog that only needs *OK* is a dialog that should have been a toast |
| A condition that lasts while they are on the screen | A banner | |
| A whole second task | A route | A dialog you cannot link to is a page you cannot come back to |
| A fourth stacked level | Rethink the flow | Three is already the depth this app reaches, and it took a z-index system to make it correct |

---

## Three sizes, and the default to open maximised

| Size | Width | Opens maximised | For |
|---|---|---|---|
| `md` | 640px | **No** | A question: a confirmation, a short form |
| `lg` | 960px | **Yes** | Two blocks and a short table |
| `xl` | 1180px | **Yes** | A work surface: a 21-column grid, a four-step wizard |

**`lg` and `xl` default to maximised since 13 October**, asked for at the
meeting: *"open one modal/dialog now open full size first."*

> Measured on 6 Oct: Run Quotation asked for **625px of scrolling on a 1920px
> screen while leaving 740px of that screen empty**, because the dialog was a
> fixed 1180px at every screen size. The customer's own window for this flow
> fills the screen, and their reviewers said ours was small beside it. They
> were describing arithmetic.

**`md` never maximises.** One that fills a 27-inch screen to ask *are you
sure* is a worse answer than the one it replaced.

---

## Maximize is built; Minimize is not

Both are in the customer's guideline — *"Allow user to use modal window
actions: Minimize · Maximize/Restore Down · Close"* — and only one is here.

**Maximize earns its place.** Run Quotation's pricing grid has fourteen
columns, and filling the screen with it is the difference between reading the
table and scrolling it sideways.

**Minimize is deliberately absent.** In Kendo it collapses a *draggable*
window to its title bar, in place. These dialogs are centred and modal, not
draggable, so a minimised one would be **a title bar floating in the middle of
a dimmed screen** — which does not do the thing minimising is for. What a user
wants there is to see the list behind, and Close already does that without
losing anything, since nothing here is a long-running form.

> Raised as **question 9** rather than guessed at. If their users minimise
> dialogs to compare against the list underneath, the answer is a non-modal
> draggable window — a different component, and worth knowing before it is
> built.

---

## Stacking, and the bug that was invisible

This app stacks dialogs **three deep**: a Part record opens a Stock Report,
which opens Update Quantity. Every one of them used to carry the same
z-index, as did every scrim. Two consequences, both invisible until you look:

1. **The innermost dialog was on top only because its portal mounted last.**
   Correct by accident is the same fault that once put an error toast *behind*
   the Run Quotation dialog.
2. **A child's scrim could not dim its parent**, so three stacked dialogs all
   rendered at full brightness with nothing to say which one was live.

Each level now steps its own scrim and panel above the level before it,
through a depth context.

---

## Rules

1. **Actions top-left on a work surface, in a footer on a question.** The way
   out goes on the left wherever the bar sits.
2. **Escape dismisses the innermost thing** — which Select had to be taught by
   hand, because Kendo's own handling closed the dialog from an open dropdown.
3. **The dismiss never repeats the confirm's verb.** See
   [Destructive action](../patterns/destructive-action.md).
4. **A dialog has a title that names the record**, not just the action —
   `Discard changes to RFQ0000000358?`, because on a screen this deep the
   record number is the fastest answer to *which one*.

## Accessibility

| | |
|---|---|
| Focus | Trapped inside, returned to the trigger on close |
| Escape | Innermost first |
| Scrim | Each level dims the one beneath it, so the live layer is visible as well as focusable |
| Title | The accessible name of the dialog |
| Busy | While a confirmed action runs, both buttons disable — leaving mid-write is how a record ends up changed with nobody watching |

## API

| Prop | Type | Notes |
|---|---|---|
| `open` / `onClose` | `boolean` / `() => void` | |
| `title` | `string` | Names the record where there is one |
| `subtitle` | `ReactNode` | The consequence, or the facts that do not change |
| `size` | `md \| lg \| xl` | Defaults to `md` |
| `startMaximised` | `boolean` | Defaults to **true** for `lg` and `xl` |
| `actions` | `ReactNode` | |

---

## Related

[Button](button.md) · [Select](select.md) ·
[Destructive action](../patterns/destructive-action.md) ·
[Wizard](../patterns/wizard.md) ·
[D4 · Dialogs](../design-system.md#d4--dialogs) ·
[B5.4 · Dialogs and shell](../design-system.md#b54-dialogs-and-shell)

## Recent changes

| Date | Change |
|---|---|
| 8 Nov 2026 | This page |
