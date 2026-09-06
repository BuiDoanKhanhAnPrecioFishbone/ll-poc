# The nineteen stubs: which are missing features, and which are missing wiring

*6 September 2026*

Every unimplemented action in this prototype calls `toast.notImplemented(what)`,
which prints "Not in this prototype — this would `${what}`." The convention is
deliberate and `src/ui/Toast.tsx` says why: *"a mockup full of buttons that
silently do nothing is worse than one with fewer buttons — a reviewer cannot
tell a missing feature from a broken one."*

That reasoning holds for an action with nowhere to go. It does **not** hold for
a button whose destination is already built and on screen. There the toast is
not honesty about a gap, it is a gap of its own: the reviewer is told the
prototype cannot do something it demonstrably can.

This audit sorts all nineteen call sites into the two piles.

## Result

| | |
|---|---|
| Missing **wiring** — destination exists, now connected | **6** |
| Missing a **backend** — file storage, generation, or a record type we do not have | 9 |
| **Deliberate**, with the reason already in a code comment | 2 |
| **Out of scope** for a UX prototype | 3 |

Six of nineteen were reachable. Five of those six sit in one row of one screen.

---

## Missing wiring — fixed

### The RFQ smart buttons — five of six *(`QuotationDetail.tsx:240`)*

The smart-button row is an **addition**, not a restoration: `SmartButtons.tsx`
records that the live Voyager RFQ has no such row, and that the 25 Aug review
asked for one. So there is no live behaviour to match — the question is only
whether our own addition does what it claims.

It claimed a lot. The comment above the handler reads:

> Always GOES somewhere — never creates. […] An empty destination is still a
> destination.

And then every one of the six went to a toast.

Five of them have a destination **on the same page, roughly two hundred pixels
below the button**, and the counts prove it — each button's count is read from
the very array its tab renders:

| Button | Count expression | Tab it belongs to | Tab's own count |
|---|---|---|---|
| Quote version(s) | `q.results.length` | Quotation Result | `q.results.length` |
| Checklist task(s) | `q.tasks.length` | Checklists & Assignment | *(outstanding)* |
| Document(s) | `q.tasks.filter(t => t.documentName).length` | Checklists & Assignment | — |
| Conversation(s) | `q.comments.length` | Conversations | `q.comments.length` |
| Activity entr(y/ies) | `q.activity.length` | Activity Logs | — |

Documents are the one judgement call: there is no Documents tab, but the
document *is* the Checklists tab's Document column, and that column is where a
user who pressed "3 Documents" would have to end up anyway. It goes there.

**Customer stays a toast.** There is no customer record screen in this
prototype, and inventing a destination for a navigation button is worse than
admitting it has none.

### The Part record's On hand button *(`PartDetail.tsx:111`)*

Same row, same rule, same defect. `On hand` toasted "open the stock report
for …" while `PartDetail` was *already rendering* `MpnMappingSection`
(`PartDetail.tsx:186`), inside the Quantity Info tab, where every MPN row has a
Stock Report button that opens the real, fully built `StockReportDialog`
(`MpnMapping.tsx:421`).

The destination was not merely built — it was mounted, one tab away, in the same
dialog. Now the button switches to Quantity Info and takes the reader to the MPN
Mapping table.

The Testing Guideline places the table there, not the smart button: *"Navigate
to Quantity Info tab → Displays the MPN Mapping table."* This wiring is the
short path to that same instruction, so it adds no screen and changes no
content.

---

## Missing a backend — left as toasts

Nine actions need something this prototype has no way to have. They stay, and
the toast is doing its job.

| Where | Would need |
|---|---|
| `ImportPartsDialog.tsx:62` | reading an uploaded parts file |
| `CreateBomDialog.tsx:364, 369` | serving a template file for download |
| `CreateBomDialog.tsx:386` | deriving a customer template from an upload |
| `PartBomDialog.tsx:57` | file storage, and a version increment that persists |
| `ChecklistsTab.tsx:150` | serving a stored document |
| `ChecklistsTab.tsx:177` | file storage |
| `StepConfigBom.tsx:246` | template creation and persistence |
| `PartDetail.tsx:75` | QR generation |
| `PartDetail.tsx:76` | an approval workflow with a state machine behind it |

## Destination does not exist — checked, not assumed

Two looked wireable and are not. Both were checked in the data layer rather than
inferred from the label.

**`PartBomDialog.tsx:170` — "open `${r.topAssembly}`".** Where-Used rows come
from `whereUsed()` in `data/partBom.ts:101`, which mints `topAssembly` as
`` `${prefix}-1AB${100000 + …}` `` — a synthetic identifier with no
correspondence to any of the 2 000 parts `generateParts()` produces. There is no
part record to open. Wiring it would have produced a button that opens a blank
or, worse, the wrong part.

**`ResultTab.tsx:124` — "open the quotation detail for … run …".** The
destination would be a *quote version* record. `/sales-management/quotation/:id`
is keyed by RFQ, and the reader is already standing on it; a per-run record type
does not exist in the model. Leaving it.

## Deliberate — left alone, on the evidence

**`PartDetail.tsx:80` — Edit part.** The comment above it records that this
button used to close the dialog, and that saying what it would do beats
appearing to act and instead dismissing what the user was reading. Editing a
part is also explicitly out of scope: *"Information cannot be edited in the
action when seeing the Part detail."*

**`AppShell.tsx:242` — Notifications.** The comment records that the worse half
of this control — an unread dot backed by no data, permanently lit on every
screen — is already gone, and that the button now names its own emptiness
("Notifications, nothing new"). There is no notifications panel to open.

## Out of scope

`Login.tsx:103, 118, 121` — password recovery, Privacy Notice, Terms of Service.
Recovery is an auth flow; the other two are legal documents the customer owns.
None is a UX question this prototype can answer.

---

## What this cost, and the rule it suggests

The five RFQ buttons were the app's most-clicked header row, and they had been
inert since they were built — under a comment asserting they always go
somewhere. The comment was a statement of intent that nothing ever checked.

**A stub is a claim about the product, and claims go stale.** `notImplemented`
was correct on the day each was written; the screens caught up and the stubs did
not. Worth re-running this audit whenever a screen lands, which is cheap: one
grep, then one question per hit — *does this destination exist yet?*

---

# The focus race, and four wrong diagnoses before it

*Appended after verification*

The tab switching worked first time. Moving focus to the destination — which is
what makes these navigation buttons usable from a keyboard — did not, and the
failure was worth the time it took because **it reproduced in a pattern that
looked like noise**: on the Part record, the first open after a page load
missed, every open after it hit. Miss, hit, hit. Three times over.

Four explanations were tried and discarded, each by measurement rather than by
argument:

1. **"The element does not exist yet."** Kendo's TabStrip mounts the selected
   panel's content, so `getElementById` in the caller's effect could plausibly
   run first. Measured: present synchronously, 0 ms after the click. *(The fix
   built on this — moving the focus into `MpnMappingSection`, which owns the
   DOM — was kept anyway. It is the better structure, and it removed a
   cross-component `getElementById`. It did not fix the bug.)*

2. **"Something steals the focus back."** A `focusin`/`focusout` recorder over
   the whole journey logged **nothing at all** — so focus never moved in the
   first place. Nothing stole it.

3. **"The frozen-animation trap again."** A hidden browser pane does not run CSS
   animations, and this project has already lost time to a `CSSTransition`
   stuck at `currentTime: 0`. Neutralising every animation and transition
   changed nothing; the section measured `display: block`, `opacity: 1`,
   `visibility: visible`, with a non-null `offsetParent`.

4. **"The element is detached."** `document.contains(el)` — true.

The instrumented effect finally showed it: the effect ran, the ref was set, the
element was attached, `focus()` was called, and `document.activeElement` was
**unchanged on the very next line**.

Which leaves *when*, not *what*. The effect runs inside the click's own
dispatch, and the browser's default action for that click focuses the button
that was pressed — after the handler, overwriting anything set from within it.
A `setTimeout(…, 0)` puts the focus move after the dispatch, and it sticks:
three cold runs out of three.

**The RFQ smart buttons had the same race and passed anyway** — Kendo's TabStrip
focuses the tab it selects, so its behaviour was covering ours. That is someone
else's implementation detail holding up our feature, so the same deferral went
in there too rather than leaving a passing test over a broken mechanism.

## Verified

| | |
|---|---|
| RFQ: 5 buttons → correct tab, cold load | 5 / 5 |
| RFQ: Customer still toasts, tab unchanged | yes |
| RFQ: focus lands on the destination tab | 5 / 5 |
| RFQ: repeat press while already on that tab | scrolls and focuses, does not sit silent |
| Part: On hand → Quantity Info, cold load | 3 / 3 |
| Part: focus lands on the MPN section | 3 / 3 |
| Part: full journey to a real Stock Report | opens, 5 stock lines |
| Tab strip vs animation container width | 1132 / 1132, page does not scroll sideways |

The width row is there deliberately. Phase B's regression reached every tabbed
screen in the app because its checks — keyboard, ARIA, badge, focus ring — never
looked at a box size. It is one line, and it goes in every time now.

## One caveat on the focus evidence

`document.hasFocus()` is **false** in this browser pane, so it cannot be trusted
to report focus behaviour in general. What is trustworthy here is the
*comparison*: the same journey, same harness, three cold misses before the
change and three cold hits after it, with the mechanism identified and the
instrumentation showing the failure at the exact line. The absolute claim "focus
works for a real user" rests on that plus the mechanism being a documented
browser behaviour — not on this pane alone.
