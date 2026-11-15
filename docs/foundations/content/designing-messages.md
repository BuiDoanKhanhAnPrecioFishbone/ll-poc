# Designing messages

> Which surface a message goes on, and how it is worded. Drawn from the toast,
> error state, feedback and modal sources named below; nothing here is a
> general writing rule.

## Pick the surface first

| Surface | When | Lives | Example |
|---|---|---|---|
| **Toast** | It is done and the user does not have to act | 4.5s | `Published` |
| **Undoable toast** | Done, and a way back is offered | 4.5s, with **Undo** | `Priority set to High` |
| **Error toast** | An action failed and the screen is intact | **9s**, announced assertively | `2 required fields are missing.` |
| **Banner** | A condition lasts while you are on the screen | — | *Editing RFQ…. Nothing is saved until you choose Save.* |
| **Dialog** | The user must answer before anything happens | — | A destructive confirm |
| **Field error** | One field is wrong | On blur, beside the field | |
| **Error state** | The screen cannot show what the user came for | — | A route threw |

A toast for something the user must act on will be missed; a banner for something
transient outlives its reason ([Feedback](../../patterns/feedback.md)). A whole-screen
error over a failed save throws away the user's typing ([Error state](../../components/error-state.md)).

## Colour has to agree with the words

`error` is a separate kind because the app once sent failures through `success`.
A validation message naming empty required fields arrived on the **green** toast,
and so did *"Select assembly first!"*. The kind is a decision about duration,
announcement and a way back, not a style, so the API is four verbs
([Toast](../../components/toast.md)).

## Wording

- **Repeat the control's word.** `Publish` then `Published`, not `Success`.
- **An error names what to fix,** never *Something went wrong*.
- **Say what is not real.** `notImplemented` completes "Not in this prototype —
  this would {what}." It does not apologise or say *coming soon*.
- **A derived figure says it is derived.** A session-only change says so.
- **One sentence in a toast.** It is a description, not a heading plus a body.

## An error state answers three questions

| Slot | Question | Rule |
|---|---|---|
| Title | What failed | The user's words, never an exception message |
| Body | What it means for them, and what it does not | 60 characters wide at most |
| Actions | What they can do next | At least two: *Try again* (only where a retry can succeed), *Back to Home* (a route, not a reload), a [support ticket](../../components/support-ticket.md) |

The error id is shown whether or not a ticket is sent, with a **Copy** button.

## Dialog titles and buttons

From `docs/modal-patterns.md`. **No customer source specifies how a modal should
read**; the Testing Guideline names which modals exist and what fields they hold.
So these are our conventions, not the client's.

- **The title names the record or the task:** `Stock Report`, `Create New Customer`.
  A subtitle carries the sentence the title cannot.
- **Dismiss on the left, commit on the right, destructive last.** A destructive
  commit is worded as the act: *Yes, delete*, *Discard changes*.
- **The scrim click does nothing,** so a stray click does not discard typed work.

## Not covered, because no source says

Tone, grammar, capitalisation across the product, and *Informational* or *warning* kinds: the toast has no such kind, and
[Feedback](../../patterns/feedback.md) lists an `info` that
[Toast](../../components/toast.md) does not.

## Recent changes

| Date | Change |
|---|---|
| 15 Nov 2026 | This page |
