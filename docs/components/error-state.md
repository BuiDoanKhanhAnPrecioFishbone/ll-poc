# Error state

> **Status: stable** · `src/ui/ErrorState.tsx` · reached through
> `ErrorBoundary`, and directly where one part of a record fails.
> Written to the template set by [`button.md`](button.md).

---

## When to use

**When a screen cannot show what the user came for** — a route threw, a fetch
failed, a tab's panel could not load.

## When not to use

| Instead of the error state | Use | Why |
|---|---|---|
| A field is wrong | An error on the field | The screen works; one value does not |
| An action failed, screen intact | `toast.error` — see [Feedback](../patterns/feedback.md) | A whole-screen error over a failed save throws away the user's typing |
| Nothing to show, nothing broken | The empty state | *Empty* and *broken* are different answers |

---

## It was a comment for weeks before it was a state

Audit finding **T5** records that the live system conflates *loading* and
*empty*. This prototype had the same gap from the other end:

> `app.css` carried a comment block headed `--- Error state ---` from the day
> the loading state was built, with the sentence *"The third of the three"*
> under it and **no rule beneath it at all**. The state was asserted in a
> comment for weeks and never drawn. Closed 27 Oct.

Written down here because it is the exact failure this documentation exists
to catch: a claim in a file with nothing behind it.

---

## The same rocket, back on the pad

Tilted, cracked, one fin lying beside it, smoking.

> The failure is legible before the sentence is read — and a **separate**
> illustration for failure would be a second thing to learn at the worst
> possible moment.

It takes `step`, so when a launch was running the picture says **how far it
got**.

## Three slots, because a person has three questions

| Slot | The question | Rule |
|---|---|---|
| `title` | **What failed** | In the user's words. Never an exception message |
| `body` | **What it means for them** — and what it does not mean | ≤ 60ch, like every other block of prose here |
| Actions | **What they can do next** | At least two |

> *Something went wrong* is the error message that tells the user to try the
> thing that just failed, with nothing to go on.

## Three ways out, not one

The customer's redesign of **29 Oct**. *Reload* was the only answer, and a
screen that fails twice left the user holding a button that had already not
worked.

| Way out | Note |
|---|---|
| **Try again** | First, and optional — only where retrying can succeed |
| **Back to Home** | A **route**, not a reload: the rest of the app is still running, and reloading the document throws away everything else the user has open |
| **[Support ticket](support-ticket.md)** | Turns *"it is broken"* into something with an id on it |

**The error id is shown whether or not a ticket is sent**, because the first
thing a colleague asks is which error. It has a **Copy** button — this
number's whole job is to be pasted into a message to someone else.

The confirmation **replaces** the offer rather than joining it: two lines,
one saying *send a ticket* and one saying *ticket sent*, is a screen arguing
with itself.

## Accessibility

| | |
|---|---|
| Role | **`role="alert"`**, not `status` — this one interrupts. A person who cannot see it has otherwise been left on a screen that stopped responding for no stated reason |
| Illustration | `aria-hidden`; the title carries the meaning |
| Error id | Real text, selectable, plus the Copy button — not an image or a tooltip |
| Focus | Not stolen; the heading is the first thing in reading order |

## API

| Prop | Type | Notes |
|---|---|---|
| `title` / `body` | `string` | The two sentences above |
| `step` | `number` | How far the launch got |
| `errorId` | `string` | `newErrorId()` **at the point of catching** — see [Support ticket](support-ticket.md) |
| `screen` | `string` | Prefills the ticket's subject |
| `onRetry` / `retryLabel` | | Omit `onRetry` where a retry cannot help |
| `children` | `ReactNode` | A further way out, where a caller has one |

---

## Related

[Support ticket](support-ticket.md) · [Toast](toast.md) ·
[Feedback](../patterns/feedback.md) ·
[D5 · The four screen states](../design-system.md#d5--the-four-screen-states)

## Recent changes

| Date | Change |
|---|---|
| 8 Nov 2026 | This page |
