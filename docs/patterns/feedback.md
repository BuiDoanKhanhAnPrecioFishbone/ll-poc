# Pattern · Feedback

> What the screen says back after you press something. Four kinds, and the
> colour has to agree with the words.
> **Components:** Toast · [Button](../components/button.md) · banners

---

## Four kinds, and when each one

| Kind | Says | Lives | Call sites |
|---|---|---|---|
| **success** | It worked | 4.5s, background | 27 |
| **error** | It did **not** work, and what to fix | **9s, foreground** | 8 |
| **undoable** | It worked, and here is the way back | 4.5s, with an **Undo** | 5 |
| **notImplemented** | This would do X, but not in this prototype | 4.5s, background | 28 |

---

## The one that was wrong, and why it has its own kind

`error` exists because the app used to announce failures through `success`.

> A validation message telling you which required fields were still empty
> arrived on the **green** toast. So did *"Select assembly first!"*.
>
> The words were right and **the colour said the opposite** — which is worse
> than saying nothing, because a user who trusts the colour carries on
> believing the step worked.

So a failure is a different kind, not a different string, and it gets two
things the others do not:

- **9 seconds instead of 4.5.** The default is tuned for *that worked* — a
  message you can miss without cost. A message naming what you must fix before
  continuing is one you cannot, and the user is usually still reading the form
  rather than watching the corner.
- **`foreground`**, so a screen reader announces it assertively rather than
  waiting its turn.

---

## Undo is what pays for inline editing

Inline editing buys speed by removing the Save step. The price is that a
mis-click is a **silent commit**.

`undoable` is how that price is paid. Without it, *"saves as you go"* just
means *"cannot be taken back"*.

> The Undo button is a Radix `Action`, not a plain button: it keeps the toast
> alive while focus is inside it, so **tabbing to Undo cannot race the
> timeout**. A way back that disappears while you are reaching for it is not a
> way back.

---

## Nothing silently does nothing

`notImplemented` has the most call sites of any kind — **28** — and that is
the point.

> A mockup full of buttons that silently do nothing is worse than one with
> fewer buttons: a reviewer cannot tell a missing feature from a broken one.

The wording is fixed so it cannot drift: **"Not in this prototype — this would
{what}."**, where `what` completes the sentence. It is the toast half of
[A3 rule 5](../design-system.md#a3--five-rules-before-you-build) — *say what
is not real*.

---

## Toast, banner, or dialog

| Use | When | Example |
|---|---|---|
| **Toast** | It is done, and you do not have to act | `Published` |
| **Banner** | A condition that persists while you are on the screen | *Editing RFQ…. Nothing is saved until you choose Save.* · a credit-limit warning |
| **Dialog** | You must answer before anything happens | [Destructive action](destructive-action.md) |
| **Field error** | One field is wrong | On blur, beside its own field |

A toast for something the user must act on is a message that will be missed.
A banner for something transient is clutter that outlives its reason.

---

## Content

- **A control says what happens; the toast confirms it in the same words.**
  `Publish` → `Published`. Not `Publish` → `Success`.
- An error says **what to do**, never *Something went wrong*.
- A derived figure says it is derived. A session-only change says so.

## Accessibility

| | |
|---|---|
| Live region | Radix Toast provides it; `success`/`info` are polite, `error` is assertive |
| Timer | Pauses while the pointer is over the toast |
| Dismiss | A real button, `aria-label="Dismiss"` |
| Undo | `altText="Undo this change"`, so the action is announced even when the visual label is not read |
| Swipe | Down, on touch — and never the only way to dismiss |
| Colour | Never alone: the kind is in the words as well as the fill |

---

## Related

[D5 · The four screen states](../design-system.md#d5--the-four-screen-states) ·
[D6 · Words](../design-system.md#d6--words) ·
[Destructive action](destructive-action.md) ·
[Record form](record-form.md)

## Recent changes

| Date | Change |
|---|---|
| 8 Nov 2026 | This page |
