# Pattern · Destructive action

> Three presses between a user and something they cannot undo, and each one
> earns its place.
> **Components:** [More menu](../components/more-menu.md) ·
> [Button](../components/button.md) · ConfirmDialog

---

## The shape

```
More ▾   →   the item, in danger ink   →   a confirmation   →   it happens
```

| Step | What it is for |
|---|---|
| **1 · Behind More ▾** | Distance. The action is not next to the one you press all day |
| **2 · Danger ink in the menu** | Recognition, before the press |
| **3 · The confirmation** | A statement of consequence, and a way out |

No step is decoration. Remove the menu and you get the 69px problem back;
remove the confirmation and the menu is the only guard; remove the danger ink
and the menu is a list of equals.

---

## Why three and not one

Two independent routes arrived at the same answer, which is why this is not
negotiable per screen:

- **Asked for**, 8 October review: *"Some 'danger' or less use actions such as
  Deactivate, Cancel, Reprint … should be kept under a More button"*.
- **Measured**, before that: Cancel RFQ sat **69px** from Run Quotation.
  Nielsen Norman's work on consequential options placed beside benign ones
  says that is where accidental clicks come from.

---

## The confirmation

One question, one consequence, two verbs.

| Part | Rule | Example |
|---|---|---|
| **Size** | `md`, always — it holds one sentence | |
| **Title** | The question, **naming the record** | `Cancel this RFQ?` |
| **Body** | The **consequence**, not the action. The title already said the action | |
| **Confirm** | **The verb.** Never *Yes* or *OK* | `Cancel RFQ` |
| **Dismiss** | Names what you keep | `Go back`, `Keep Editing` |
| **Tone** | `danger` only when the thing is destructive | |

**The button says the verb.** A dialog answered by *Yes* has to be re-read to
find out what was agreed to — and the answer is usually read second.
`Cancel RFQ` and `Confirm RFQ` are unambiguous on their own.

**Dismiss is never a bare "Cancel" when the confirm is also "Cancel".**
`Cancel RFQ` beside `Cancel` is a coin toss.

> **A note on where that rule is stricter than the system's.**
> [D1](../design-system.md#d1--buttons) says *Cancel only in dialogs*, which
> permits a bare `Cancel` as the dismiss. `ConfirmDialog`'s own rule says
> never a bare Cancel. In the build, two of three call sites use the default
> `Go back` and one uses `Cancel` — on a dialog whose confirm is *Refresh
> Prices*, where there is no ambiguity. Both readings are defensible; the one
> that matters is the narrow one: **the dismiss may not repeat the confirm's
> verb.**

---

## Busy is the load-bearing half

While the confirmed action runs, **both** buttons are disabled and the confirm
shows an indicator.

- The indicator says something is happening.
- **The disable is what stops a second press doing it twice.** Every
  confirmation here guards something a second press would repeat — confirm an
  RFQ, cancel one, spend marketplace quota — and the window between the press
  and the answer is exactly when a user presses again because nothing has
  happened yet.
- **Dismiss is disabled too.** Leaving mid-write is how a record ends up
  confirmed with nobody watching the result.

---

## When the three steps are too many

| Case | Do this instead |
|---|---|
| Reversible, and the user can see it reversed | Just do it, with an undo in the toast |
| Destructive but trivial — removing a row from a draft | One step: the action, no confirm |
| Destructive and irreversible | All three. No exceptions |

A confirmation on something reversible teaches people to dismiss
confirmations, which is how the one that mattered gets dismissed too.

## Accessibility

| | |
|---|---|
| Menu item | Danger items carry colour **and** position — apart from the rest — so the warning is not hue alone |
| Disabled item | Keeps its reason in `title`; a dead end with no explanation is worse than a missing item |
| Dialog | Focus moves in and returns to the trigger on close |
| `Esc` | Closes the innermost thing first — a dropdown inside the dialog goes before the dialog |
| Busy | `aria-busy` on the confirm; the loader is `role="status"` |

---

## Related

[More menu](../components/more-menu.md) ·
[Button](../components/button.md) ·
[D1 · Buttons](../design-system.md#d1--buttons) ·
[D4 · Dialogs](../design-system.md#d4--dialogs) ·
[Record form](record-form.md)

## Recent changes

| Date | Change |
|---|---|
| 8 Nov 2026 | This page |
