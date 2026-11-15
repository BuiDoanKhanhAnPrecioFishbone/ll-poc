# Stepper

> **Status: stable** · `src/ui/Stepper.tsx` · one call site, and it is the
> product's only wizard. The flow around it is
> [Wizard](../patterns/wizard.md); this is the control.
> Written to the template set by [`button.md`](button.md).

---

<!-- ds:tab examples -->

<!-- ds:specimen stepper -->

<!-- ds:tab usage -->

## When to use

To show where someone is in a job with **a real order**, and to let them go
back to a step they have already done.

## When not to use

| Instead of a stepper | Use | Why |
|---|---|---|
| Sections of one record | [Tabs](tabs.md) | Tabs say *these are peers*; a stepper says *this comes first* |
| Progress of a running job | A [Loader](loader.md) with a label | A stepper is navigation, not a progress bar |
| Two steps | Two screens, or one | A stepper over two steps is a label |

---

## Steps are buttons

Not decoration.

> Someone who realises on step 3 that they mis-mapped a column on step 1
> should go **straight back to it**, not press Back twice and lose their
> place.

**Forward movement is bounded by `furthest`** — the highest step reached so
far. Free movement across work already done; no skipping ahead into a step
whose inputs do not exist.

> A stepper that lets you land on *Summary* before a BoM is uploaded is
> offering a dead end.

---

## `numbered={false}` is not cosmetic

Run Quotation's labels already carry their numbers — *"1 - Config BoM"*.
With the dot numbering on as well, every step reads **"① 1 - …"**, which
looks like a rendering fault rather than a design.

## `showText={false}`, for a dialog that already says it

The Run Quotation dialog prints the current step's sentence in its subtitle.

> The same words twice, 20px apart, cost 50px of a surface whose content did
> not fit.

The sentence survives as the control's tooltip, so nothing is lost — it is
just no longer said twice at once.

## Responsive

| Width | What changes |
|---|---|
| ≤ **840px** | Step descriptions go — four labelled steps need ~760px, and a truncated *"1 - Confi…"* is worse than no description |
| ≤ **700px** | Only the current step keeps its label; the rest become their marker, still positioned and still clickable |

## Accessibility

| | |
|---|---|
| Status | **Each step states its own status**, so *where am I and what is left* does not depend on seeing the ticks |
| Unreachable | Disabled, not hidden — the shape of the job stays visible |
| Keyboard | Each step is a real button in document order |

<!-- ds:tab code -->

## API

| Prop | Type | Notes |
|---|---|---|
| `steps` | `{ label, text? }[]` | |
| `value` / `furthest` | `number` | `furthest` bounds forward movement |
| `onChange` | `(i: number) => void` | Omit to make it read-only |
| `numbered` | `boolean` | False where labels carry numbers |
| `showText` | `boolean` | |

---

<!-- ds:tab usage -->

## Related

[Wizard](../patterns/wizard.md) · [Tabs](tabs.md) ·
[B7 · Responsive](../design-system.md#b7--responsive)

<!-- ds:tab changelog -->

## Recent changes

| Date | Change |
|---|---|
| 8 Nov 2026 | This page |
