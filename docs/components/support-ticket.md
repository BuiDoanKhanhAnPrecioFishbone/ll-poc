# Support ticket

> `src/ui/SupportTicket.tsx` · the customer's screen of **29 Oct**, reached
> from the [error state](error-state.md). **Trial**, because what stands
> between it and a real ticket is one POST and the answer to open question 12.

---

<!-- ds:tab usage -->

## When to use

As the way out of an error **that is not *try again***.

> A user whose screen fails twice has nowhere to go — and the thing they
> would otherwise do by hand (find someone, describe what broke, remember
> which screen it was) is exactly what a program can do for them.

## When not to use

| Instead of a ticket | Use | Why |
|---|---|---|
| A recoverable failure | *Try again* on the [error state](error-state.md) | Reload is the right first answer |
| A feature that does not exist | `toast.notImplemented` | That is not a fault to report |

---

## What it attaches, and why that is the point

| Field | Source |
|---|---|
| **Error ID** | `newErrorId()`, from the failure |
| **Screen** | The screen that failed, in the user's words |
| **Time** | `fmtDateTime(new Date())` — the app's own regional formatter |
| **Browser** | `browserName()` |

Those four are what a support engineer needs and what a cost estimator has no
reason to know. The one question left is the one **only the person can
answer** — *What were you doing?*

> The block is headed **"Added for you"** rather than hidden, because a ticket
> that quietly collects details about the sender is a different thing from one
> that shows them what it is sending.

### `browserName()` — every browser claims to be the others

Edge's user agent contains *Chrome* **and** *Safari*; Chrome's contains
*Safari*. So the test runs **most specific first**, and Safari — which claims
nothing — is last. Four names, because four is what a support engineer acts on.

### `newErrorId()` — `VIQ-7F3A2C`

One per failure, so two people reporting the same screen are not reporting the
same incident.

**Uppercase hex without the vowel-shaped digits**, deliberately: this number
gets read down a phone line, and `0`/`O` and `1`/`I` are where that goes
wrong. `crypto.getRandomValues` where it exists — two users failing in the
same millisecond is not a reason to hand them one id.

---

## The send is not real

There is no helpdesk behind this prototype. **The number is drawn here and no
request leaves the browser.**

The flow is kept whole so it can be demonstrated end to end, and the copy is
the customer's own. Written down in three places — this page, the file's
header, and the gap register — so nobody demonstrates it as working.

<!-- ds:tab examples -->

<!-- ds:specimen support-ticket -->

## Anatomy

| Part | Rule |
|---|---|
| **Subject** | Prefilled: *"Screen stopped loading: {screen}"*. Required, with the app's **red asterisk** — the customer's Testing Guideline says red, and a bare `required` attribute marks the field for the browser and for nobody looking at it |
| **What were you doing?** | A textarea with a real example as its placeholder, not *"Enter details"* |
| **Added for you** | The four facts above, in a `<dl>` |
| **Send Ticket** | Disabled without a subject, **with the reason in `title`** |

<!-- ds:tab usage -->

## Accessibility

| | |
|---|---|
| Dialog | Everything in [Dialog](dialog.md) — focus trap, `Escape`, return focus to the control that opened it |
| Required | The asterisk is `aria-hidden` and `required` carries the meaning, so it is not announced as *"star"* |
| Disabled send | The reason is on the control, not only implied by the greying |
| Confirmation | Announced; the ticket number is text, and the error id stays visible behind the dialog |

<!-- ds:tab code -->

## API

| Prop | Type |
|---|---|
| `open` / `onClose` | |
| `errorId` | `string` |
| `screen` | `string` — prefills the subject |
| `onSent` | `(ticketNo: string) => void` |

Also exported: `browserName(ua?)` and `newErrorId()`.

---

<!-- ds:tab usage -->

## Related

[Error state](error-state.md) · [Dialog](dialog.md) ·
[Field](field.md) · [Feedback](../patterns/feedback.md)

<!-- ds:tab changelog -->

## Recent changes

| Date | Change |
|---|---|
| 17 Nov 2026 | Live examples — it had a page and a photograph, but nothing that could be pressed |
| 8 Nov 2026 | This page |
