# Standard modal patterns

The specification behind `Dialog` in `src/ui/Overlays.tsx`. Every modal in this
prototype is that component with different content.

Written 6 September 2026. Measurements taken at 1440×900 unless stated.

## Why this document exists

Tables have `docs/table-patterns.md`. Filters have `docs/filter-spec.md`. Modals
had nothing — and they are the most-used surface in the app after the grid.

That is not an oversight in our documentation. **No customer source specifies
modal design at all.**

| Source | What it says about modals |
|---|---|
| Testing Guideline | 105 uses of "dialog", 16 of "modal", 7 of "pop-up" — every one naming *which* modal exists and *what fields are in it* |
| | One behavioural line, in 23 places: *"Allow user to use modal window actions: Minimize · Maximize/Restore Down · Close"* |
| | One content line: BoM metadata is read-only in its pop-up, *"to preserve data integrity"* |
| Kick-off deck | Nothing. Its six archetypes — Login, Generic Layout, List View, Form View, Data Form View, Setting Form View — are all **full-page**, and slide 16's alert pattern is an inline panel, not a modal |
| 25 Aug review | Nothing |

So the customer has told us which modals to build and what goes in them, and
has said nothing about how one should look or behave. Twenty-two call sites were
built on conventions we chose. This document states those conventions so they
can be reviewed as a set rather than discovered screen by screen — and records
one defect and two open questions found while writing it.

## Inventory

Twenty-two `<Dialog>` call sites across fourteen files. Three sizes.

---

## Rule 1 — Three sizes, chosen by content shape

| Size | Token | Measured | Viewport cap | For |
|---|---|---|---|---|
| `md` *(default)* | `--vy-dialog-md` | **640px** | 94vw | A short form, a confirmation, a single decision |
| `lg` | `--vy-dialog-lg` | **960px** | 94vw | A form with two columns, or a narrow table |
| `xl` | `--vy-dialog-xl` | **1180px** | 96vw | A record, a wide grid, or anything with tabs |

Named by size rather than set per dialog, so a screen cannot invent a width. The
cap is a `min()` against the viewport, not a media query, so the same rule holds
at every width.

**Choose by the shape of the content, not by its importance.** A confirmation is
`md` because it holds one sentence, not because it matters less.

Three call sites take the default implicitly rather than writing `size="md"`.
Both are the same width; the explicit form is preferred because it records that
a choice was made.

## Rule 2 — The actions bar is a sibling of the content and never scrolls

`.k-dialog-content` **is** the scroll box — measured `overflow-y: auto`, and on
the Part record it scrolls at 669px of content inside a 792px panel. The buttons
sit in Kendo's `DialogActionsBar`, which renders as a *sibling* of that box.

This was not free. Our own footer lived inside the content and scrolled away
with the form, which is the one place a dialog's buttons must not go. Nothing
should ever be wrapped around `children` here either: a second padded, scrolling
div inside the content produced doubled padding and two scrollbars in the same
axis.

Panel height is capped at **88vh** — measured 792px of 900. The dialog never
runs off the screen; its content scrolls instead.

## Rule 3 — Dismiss on the left, commit on the right, destructive last

Reading order matches consequence: the way out first, the thing that changes
something last.

| | |
|---|---|
| Cancel / Close / Back | `default` or `text`, leftmost |
| Secondary actions | `default` or `tonal`, middle |
| The commit | `filled`, last |
| A destructive commit | `danger`, last — *"Yes, delete"*, *"Discard changes"* |

Verified across every call site whose action bar can be read statically. Three —
BoM Comparison, Create BoM and Run Quotation — render different button sets per
step, so a static read cannot confirm them and they are not claimed here.

**Open point.** The Part record's bar carries four buttons: `Close`, `QR Code`,
`Approve`, `Edit part`. That is the only bar in the app mixing dismissal with
three separate actions, and it is at the limit of what a footer can hold before
it stops reading as a row of choices. Not changed — the three actions are the
Testing Guideline's own list for that screen — but flagged.

## Rule 4 — Nesting is a band, ten per level

This app stacks modals three deep: a Part record opens a Stock Report, which
opens Update Quantity.

Measured, all three on screen at once:

| Depth | Dialog | z-index |
|---|---|---|
| 1 | Part record | **10040** |
| 2 | Stock Report | **10050** |
| 3 | Update Quantity | **10060** |

`--vy-z-dialog` is 10040 and each level adds ten — enough for a scrim to sit
under its own panel and above everything below, and far short of the next token
up (menu 10070).

Two faults this replaced, both invisible until measured. Every dialog shared one
z-index, so the innermost was on top **only because its portal mounted last**;
and a child's scrim could not dim its parent, so three stacked dialogs all
rendered at full brightness with nothing to say which one was live. The scrim is
`rgba(19, 24, 32, .45)` at every level, so each one darkens the stack beneath it.

Each dialog also takes a unique ARIA id from `useId()`. Kendo builds its ids as
`` `${props.id ?? "accessibility"}-id` ``, so without one **every** dialog on the
page gets the same id and a nested dialog announces itself with its parent's
title.

## Rule 5 — Two ways out, and the backdrop is not one of them

| Gesture | Behaviour | |
|---|---|---|
| Close button | closes this dialog | |
| Escape | closes | **see the defect below** |
| Click the scrim | **does nothing** | measured: 2 dialogs open, 2 after the click |

The scrim being inert is deliberate and worth keeping. Most of these modals are
forms; a stray click outside one should not discard what has been typed.

### Escape closes one level — fixed 6 September 2026

**Before the fix, one Escape from inside the innermost of three open dialogs
closed all three.** Measured: `["Part record", "Stock Report", "Update
Quantity"]` → `[]`.

The cause is in Kendo's `Dialog.mjs`, which handles the key with a React
`onKeyDown` on the dialog element:

```
e.keyCode === Y.esc && r.onClose && (e.preventDefault(), d(e))
```

React propagates events along the **React tree**, not the DOM tree — and a
portal is no exception. Update Quantity is a React child of Stock Report, which
is a React child of the Part record, so one keydown runs all three handlers and
every dialog closes. `preventDefault` does not stop it; only
`stopPropagation` would.

`docs/ux-audit.md` states that "Escape closes only the innermost". **That claim
is wrong** and is corrected here. It was reached by opening three dialogs and
pressing Escape once — which does close the innermost, and also everything
behind it, and the observation recorded only the part that was being looked for.

**The fix** is a `div.vy-dialog-host` wrapping the KendoDialog inside `Dialog`.
It has to be a real DOM element, because being a React *ancestor* of the
KendoDialog is the whole point: in the bubble phase it runs after the handler
that closed this dialog and before any parent's, so `stopPropagation` there ends
the event at exactly one level. `display: contents` keeps it out of the layout —
Kendo portals the dialog away, so the div would otherwise sit in the parent
dialog's flex or grid as an empty item.

Measured after: **3 → 2 → 1 → 0**, one level per Escape, and a single dialog
still closes on the first press. The width assertion came with it — the Part
record still measures 1180 with three-column field groups on both tabs, New
Project Requirement 1180 with its tab strip and animation container both at
1140, and no page scrolls sideways.

### Escape in a dropdown — also fixed, 6 September 2026

Found while checking that the fix above had not disturbed anything nearby, and
older than it: verified against the pre-fix build, where the guard is absent
from the DOM and the behaviour is identical.

New Project Requirement, one `Select` open:

| | list open | dialogs |
|---|---|---|
| before Escape | yes | 1 |
| after Escape | no | **0** |

A user opens a dropdown, changes their mind, presses Escape — and loses the
whole form. Same mechanism as the stack bug: Kendo's ComboBox popup is
portalled, but its React parent chain runs back through the dialog, so one
keydown dismisses both.

The neighbouring case is odd in the opposite direction. With the list **closed**,
Escape from inside a ComboBox closes **nothing at all** — Kendo swallows it — so
the same key does too much in one state and nothing in the other.

Both halves come from one line of Kendo's `ComboBox.mjs`. With the list **open**
it rejects suggestions and lets the event carry on, so the dialog gets it too.
With the list **closed** it calls `clearValueOnEnterOrEsc`, which calls
`stopPropagation` — so nothing at all happens. One key, dismissing two things in
one state and none in the other.

**The rule now is the standard one: Escape dismisses the innermost dismissible
thing.** The list first, the dialog on a second press.

`Select` takes the key at CAPTURE, before Kendo's handler, and each case is
settled in the phase where it can be:

| | |
|---|---|
| list open | do nothing on the way down — let Kendo close the popup — then stop the event on the way back **up**, before it reaches the dialog |
| list closed | take it on the way **down**, so Kendo's swallow never happens, and dismiss the dialog through a context the dialog provides |

The context matters. Kendo **portals** the dialog to the body, so `.vy-dialog-host`
is a React ancestor of the dialog but not a DOM one, and no `closest()` would
ever find it. `DialogDismiss` carries `onClose` down the React tree instead,
which is the same tree the events travel.

**What was tried and backed out:** controlling the ComboBox's `opened` prop, so
`Select` could close the list itself. It works, but it takes ownership of every
open and close — outside click, blur, selection, filtering — in order to fix one
key, and this browser pane cannot exercise those paths well enough to prove the
takeover is safe. A synthetic `focusout` leaves the list open on the **unchanged**
build too, so the harness cannot tell the two versions apart there. That is a
reason to take less, not a licence to take more.

The host element is a `<span class="vy-select-host">` with `display: contents`,
because `onKeyDownCapture` is not a ComboBox prop and Kendo forwards no arbitrary
DOM props. It generates no box, so none of the 37 call sites sees a new layout
item — measured at 0px wide.

Verified:

| | |
|---|---|
| Toggle opens and closes the list | yes |
| Picking an item commits the value and closes the list | yes |
| Escape, list open | list closes, **dialog survives** |
| Escape again, list closed | dialog closes |
| Escape from a plain control in a dialog | closes it, unchanged |
| A `Select` on a page, outside any dialog | list closes; a second Escape with nothing to dismiss is a no-op, not an error |
| Nested: Part record → MPN detail, list open in the inner one | Escape 1 closes the list, Escape 2 closes **only** the inner dialog |
| Layout | dialog 1180, no page scroll, host 0px |

### Swept across every dialog that has a Select

The fix lives in two shared components, so the behaviour is structural rather
than per-screen — but "structural" is a prediction until it is measured, and
nesting depth is exactly the kind of thing that breaks a prediction. Every
reachable dialog containing a `Select` was driven the same way: open the first
list, Escape, Escape.

Two assertions each — the first Escape closes the list **and leaves the dialog
count unchanged**; the second closes **exactly one** dialog, so a nested one
never takes its parent with it.

| Dialog | Depth | Selects | Esc 1 | Esc 2 |
|---|---|---|---|---|
| New Project Requirement | 1 | 9 | ✓ | ✓ |
| Add Part Master Detail | 1 | 8 | ✓ | ✓ |
| Run Quotation — step 1 | 1 | 5 | ✓ | ✓ |
| BoM Comparison | 1 | 4 | ✓ | ✓ |
| Bill of Materials (Upload BoM) | 1 | 3 | ✓ | ✓ |
| Add MPN Mapping | **2** | 2 | ✓ | ✓ |
| MPN Mapping detail | **2** | 2 | ✓ | ✓ |
| Update Quantity | **3** | 2 | ✓ | ✓ |
| Replenishment | **3** | 2 | ✓ | ✓ |

Nine dialogs, thirty-seven Selects between them, three nesting depths. The
depth-3 rows are the ones that matter: `Update Quantity` sits under Stock Report
under the Part record, and closing it left both parents standing.

**Correctly skipped, having no Select at all:** Import parts (its scope control
is a RadioGroup, not a Select), Upload a document, Stock Report, Where Part
Number Used, and the BoM record.

**Not reached: `Add: Packages`.** It is the one remaining dialog with a Select
(one), nested inside the Run Quotation wizard, and getting to it needs the
wizard driven past step 1 — which this harness cannot do, because the step gate
did not release after choosing from all five of step 1's dropdowns by click. It
is the same `Select` inside the same `Dialog` at a depth already covered twice,
so the expectation is that it behaves; it is listed here as untested rather than
assumed.

**Selects outside a dialog were checked too**, because the fix reaches them: one
on a page toolbar and one in a tab panel (the Checklists assignee). Escape closes
the list, and a second Escape with nothing left to dismiss is a no-op rather than
an error — `DialogDismiss` is null there, which is the case the `?.` exists for.

### The sweep turned up one more, and it is fixed too

`ViewSetting` — the Filter / Column / Sort panel — is an `<aside role="dialog">`
of its own rather than our `Dialog`, and it had **no Escape handling at all**. A
panel announcing itself as a dialog could not be dismissed with the key every
dialog is dismissed with.

It resisted opening from script during the sweep, and the reason turned out to
be the test rather than the panel: the page has **two** `.vy-funnel` buttons and
the first is the filter-toolbar toggle. Addressing the gear by its `aria-label`
opens it every time.

**Escape is handled on the panel, not on the document**, and that is the whole
design. A document-level listener would fire even when a dropdown inside the
panel had already dealt with the key — recreating, in a new place, the exact bug
the section above fixes. On the element, `Select` can stop the event on its way
up and keep the panel open, and the panel provides `DialogDismiss` so that same
`Select` can close it on a SECOND press.

For Escape to arrive at all, focus has to be inside, so the panel takes
`tabIndex={-1}` and focuses itself on open — deferred by a task, for the reason
in `docs/stub-audit.md`: it runs inside the click that opened it, and the
browser's default action re-focuses the pressed button afterwards.

`onClose` opens no new way to lose work. The Close button and the scrim already
call it, and both callers pass the same handler for `onClose` and `onDiscard`.

| | |
|---|---|
| Escape, nothing else open | panel closes |
| Escape with a dropdown open | list closes, **panel stays** |
| Escape again | panel closes |
| Focus on open | lands on the panel, and draws **no** focus ring (`:focus-visible` does not match programmatic focus here) |
| Scrim click · Close button · Maximise/Restore · tab switching | all unchanged |
| Both callers — Part Master and Request For Quotation | same behaviour, correct heading each |

**Note the scrim difference.** `ViewSetting`'s scrim *does* dismiss, where a
`Dialog`'s is inert (Rule 5). That is not an inconsistency to iron out without
asking: this is a right sidebar for choosing filters and columns, not a form
holding typed work, and the Testing Guideline calls it a sidebar. Recorded so
the difference is a decision rather than a discrepancy.

### A note on verifying this

Three attempts disagreed before the mechanism explained all of them:

| Method | Result | Why |
|---|---|---|
| Synthetic Escape on `document` | nothing closed | `document` is outside every dialog's React tree — no handler runs |
| Synthetic Escape from a control inside the innermost | **all three closed** | the real propagation path |
| Real `Escape` keypress via the browser tool | nothing closed | the pane is hidden and `document.hasFocus()` is false, so the key never reached the page |

The middle one is the faithful reproduction: a real Escape with focus inside the
innermost dialog produces exactly that native bubbling keydown. The other two are
explained by the mechanism rather than contradicting it.

## Rule 6 — Maximise is built, Minimize deliberately is not

The guideline asks for all three window actions in **23 separate places**.

**Maximise / Restore down** is built, on every dialog, in the title bar. It earns
its place: Run Quotation's pricing grid and the Stock Report both hold tables
wider than their dialog. It is a toggle with `aria-pressed`, and its label and
tooltip both flip to "Restore down". A dialog always reopens at its normal size —
carrying "maximised" across two unrelated dialogs would surprise whoever opens
the next one.

**Minimize is not built, and this is a live question** (`open-questions.md`
item 9). In Kendo, minimise collapses a *draggable, non-modal* window to its
title bar. Our dialogs are modal and centred, so a minimised one would be a title
bar floating in the middle of a dimmed screen with the page still unreachable
behind it — which does not do the thing minimising is for. What a user usually
wants there is to put the dialog aside and look at the record underneath, and
that needs non-modal draggable windows, not a collapse animation.

## Rule 7 — Title, subtitle, and what the title bar may hold

The title bar holds the title, an optional subtitle, the maximise toggle and
Kendo's close button. Nothing else.

The title names the record or the task — `Stock Report`, `BoM — 00848-962-4138`,
`Create New Customer`. The subtitle is for the sentence the title cannot carry:
*"Choose how far the imported parts should reach"*, or the record's description.

Maximise and close sit in **different containers** and are aligned to match by
hand: Kendo renders close into `.k-dialog-titlebar-actions` and centres it there,
while ours has to live inside the title slot because Kendo's Dialog offers no way
to add a button to its actions.

## Rule 8 — One responsive rule, no breakpoints

The viewport cap does all the work. At 375px the Part record's `xl` dialog
measures **360px** — 96vw — with nothing past the right edge and no sideways
scroll on the page.

Content inside may still need to scroll horizontally: the MPN Mapping table is
1690px wide and scrolls **inside its own** `overflow-x: auto` container, so the
page and the dialog both stay put. That is the rule — a wide table scrolls
itself, never the dialog and never the page.

---

## Still unspecified, and worth the customer's opinion

1. **Minimize** — item 9 on the answer sheet. Asked for 23 times, not built, and
   the reason is a real design difference rather than a shortcut.
2. ~~Escape with a dropdown open~~ — fixed. Worth mentioning only because it
   changes behaviour they may have seen in a demo.
3. **Four buttons on the Part record's bar** — the guideline's own list, but the
   only bar in the app shaped that way.

Nothing in this document changes a screen. It states what twenty-two dialogs
already do, so the next one does not have to guess — and so the customer can
disagree with a written rule rather than with a screenshot.
