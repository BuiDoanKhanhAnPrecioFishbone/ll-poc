# People picker

> **Status: stable** · `src/ui/PeoplePicker.tsx` · *Assigned To*, and every
> other field that names colleagues.
> Written to the template set by [`button.md`](button.md).

---

<!-- ds:tab usage -->

## When to use

To choose **one or more people** from the directory.

## When not to use

| Instead of a people picker | Use | Why |
|---|---|---|
| A list of codes or statuses | [Select](select.md) | People need a face and an address; a status needs neither |
| A free-text name | Nothing — don't | A typed name cannot be assigned to |

---

## It replaced a single-value dropdown, which was wrong twice

Built from the live control An sent on **31 Aug 2026** and confirmed in the
bundle: `component: "MultiSelect"`, with `tagRender` and `onTagDelete` for the
chips and options carrying an `avatar`.

> Our *Assigned To* was a single-value dropdown of bare names — **one value
> where the live system takes several, and a name where it shows a face and an
> address.**

## The email is not decoration

The live directory holds **"Linh 4 Tran"**, **"Linh Tran 5"** and
**"Linh Tran 1"**. Ours has *Linh Tran* and *Toan Dinh*, whose initials
collide at a glance.

> A directory of colleagues is precisely where names repeat, and the email is
> the line that tells two of them apart. The avatar is what makes the row
> scannable once you already know which one you want.

So the row is **avatar · name · email**, and the filter matches **both**
fields, contains and case-insensitive, as the live filter descriptor does —
someone who knows the address rather than the spelling of the name should not
have to guess.

---

## On Popover, not Select

Radix `Select` holds options and manages focus for a listbox. It **cannot
express multiple values**, and its focus scope is the thing that stopped
[Select](select.md)'s own filter box taking focus.

`Popover` has no such scope, so **the filter input here is focusable and
typing goes to it immediately** — the way the live filterable control behaves.

<!-- ds:tab examples -->

## Anatomy

| Part | Rule |
|---|---|
| **Chips, in the control** | As the live one does, so the field shows its value **without being opened** |
| Chip × | One per person, labelled *"Remove Linh Tran"* |
| **Add… / Choose…** | The trigger's word changes with the state |
| **Clear all** | Only once there is **more than one** chip — at a single chip its own × is nearer and less ambiguous |
| Filter | First thing in the popover, focused on open |
| Rows | Avatar · name · email, ticked when chosen |

## States

| State | |
|---|---|
| Empty | *Choose…* |
| One or more | Chips, then *Add…* |
| **Invalid** | `data-invalid` on the control; the message comes from the [field](field.md), not from here |
| No match | *"No one matches "{query}"."* — a sentence naming what was typed, not a blank panel |

<!-- ds:tab usage -->

## Accessibility

| | |
|---|---|
| Trigger | Named for its job — *"Add to Assigned To"* once there are chips, the label itself when empty |
| Each × | Names the person it removes |
| Rows | A real `listbox`, `aria-multiselectable`, each row `role="option"` with `aria-selected`; the tick is `aria-hidden` because `aria-selected` already says it |
| Avatar | `aria-hidden` — and **initials, not an image**. The live options carry avatar photographs; this prototype has none, and inventing them would put fictional faces on a colleague list |
| Clear | Named with its count — *"Clear all 3"* |
| Filter | Reachable and focused, which is the reason for Popover |
| Target | Chip × meets the 24px minimum even though the glyph is smaller |

<!-- ds:tab code -->

## API

| Prop | Type | Notes |
|---|---|---|
| `value` | `string[]` | Names, matching `PEOPLE_DIRECTORY`. Empty means unassigned |
| `onChange` | `(next: string[]) => void` | |
| `label` / `id` | `string` | For the [field](field.md) around it |
| `invalid` | `boolean` | |

---

<!-- ds:tab usage -->

## Related

[Select](select.md) · [Field](field.md) · [Chip](chip.md) ·
[Record form](../patterns/record-form.md) ·
[E2 · KendoReact](../design-system.md#e2--kendoreact)

<!-- ds:tab changelog -->

## Recent changes

| Date | Change |
|---|---|
| 8 Nov 2026 | This page |
| 8 Nov 2026 | `.vy-people-add`'s dashed edge moved to `--vy-border-control`. It was the structure token at **1.64:1**, and a dashed edge with one muted word in it is the whole of that control. Its hover no longer touches the border either — it went to `--vy-border-mid` at **2.58:1**, *fainter* than the resting edge. Found by hand while writing this page; `border:check` had not reached it, because it only renders once a record is in edit mode |
