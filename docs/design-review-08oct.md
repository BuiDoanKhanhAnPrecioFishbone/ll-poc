# Design review, 8 October — and the meeting of 13 October

Two customer sources, both tier 1 under `docs/precedence.md`:

- **`VIQ Design Review 1.pptx`**, 8 October 2026 — 15 slides. Slides 2-3 are
  about the action bar; 4 about banners; 6-10 are reference systems (PowerBI,
  Manex, Z2Data, Dynamics 365, Odoo); 12-15 are their own mock-ups of our
  screens.
- **The meeting notes of 13 October**, relayed by our team: grid view, form
  layout, and how a dialog should open.

Everything below is built. What it changed, and what it overturned, is recorded
here because one item reverses a decision this project argued at length.

---

## 1. The action bar — actions left, related records right

**Theirs.** Slide 2 sets our mockup against their own built screen: ours put the
record number and status on the left with the actions on the right; theirs puts
the actions on the left and the related records on the right, with counts.
Slide 3 draws our own RFQ bar the way they want it:

```
Run Quotation · Edit · BoM Comparison · More        Customer RFQs (43) · Historical RFQ (1)
RFQ0000000358   In-Progress   Due in 43 days
```

**This reverses our 20 September decision**, which put the commit on the right
on the argument that the way out belongs on the left and the commit at the
trailing edge. That argument was about dialogs, where it still holds and still
applies; extending it to a page bar was ours, and the customer has now answered
with five systems their own users work in. Their screens win.

**What survives from it.** Slide 3 asks for exactly the thing the September work
was really about: *"some 'danger' or less use actions such as Deactivate,
Cancel, Reprint … should be kept under a More button"*, and *"always place
'unexpected' action button at the end of the button's list"*. Confirm RFQ and
Cancel RFQ are now in `More` — a stronger fix than the spacing we chose, since a
rare action behind one more press cannot be hit by autopilot at all.

Built: `src/ui/MoreMenu.tsx`, and the bar in `QuotationDetail.tsx`.

## 2. The grid

| Asked | Built |
|---|---|
| *"do not use monotext, hard to read"* | Identifiers, codes, file names and dates are set in the body face. `tabular-nums` stays — that, not the font, is what kept columns of digits scannable |
| *"only use tag for status or really special information"* | `.vy-code` loses its pill: MSL level, package type, part source, application and RFQ type are values, not tags. Status keeps its badge |
| *"increase height of table row => comfortable"* | A comfortable row is **40px**, up from 32.7px. Density had been cell padding alone, so `--vy-row-h-comfortable` was a number that applied only on touch; the three densities now set the row height everywhere |
| *"one width for delete and required so the text field will not long and short"* | The Column tab's last cell is a fixed 6rem. Measured: every name field is 198px whether its row ends in a trash button or `(*required)` |

## 3. Setting → Filter is for a view

**Asked:** *"Setting → Filter is for view, so your current design is wrong … allow
to select value inside that panel then save as view."*

They are right, and the old design had the tell in it. That tab chose which
FIELDS the filter toolbar would show, and it needed a live preview of the
toolbar to explain itself — because a list of field names gives no hint that a
toolbar comes out of the other end.

A view now holds **values**. `SavedView.fields` is gone; `SavedView.values` took
its place. The tab renders the real `FilterToolbar` bound to the draft, so what
you set is literally what the view applies. Choosing a view re-applies its
values, next to the columns reset that was already there. The toolbar offers
every filter field the screen has — which is what the live system does, and what
change 1.4 of the client document already claims: *"behind a funnel, all fields
at once"*.

Walked end to end on Part Numbers (MPN): set Lifecycle Status = Active in the
panel, saved it as "Active only", and the list went **600 rows → 121**, with the
funnel showing one filter. 121 is the number on the screen's own Active tile.

## 4. One shape for a labelled field

**Asked:** *"same structure, same layout for label and input field (label above,
not the same line)."*

The record screen had two layouts: the header cards stacked, the tabs below used
a 180px label column. Stacked wins the tie for the reason the cards already had
— it survives a narrow column, a long label and a translated one. The two-column
grid and its `--vy-field-label-w` token are gone, and the toolbar's one
side-by-side control (Primary Provider, on Run Quotation step 3) stacks too.

## 5. Dialogs

**Asked:** *"full page now ok, open one modal/dialog now open full size first,
auto collapse the menu navigation."*

- `lg` and `xl` dialogs open maximised; `md` does not. Those two sizes are the
  record and work surfaces — a part, an MPN, a BoM comparison, Run Quotation —
  while `md` is the question-shaped dialog, and a confirmation filling a 27-inch
  screen to ask "are you sure" is a worse answer than the one it replaced.
- The sidebar collapses while any dialog is open and returns to the user's own
  choice when it closes. Measured: 248px → 56px on open, 248px again on close.

It is a count rather than a flag (`src/ui/dialogOpen.ts`): dialogs here stack
three deep, and closing the innermost one must not uncollapse the shell.

## 6. The eye column comes back — 13 October

*"My client want to bring the eye icon button to row again, remove deep link in
number column."* That answers open question 1, which this project had been
carrying as its single most uncertain change since August.

Built the same day. A **View** column on every list, after the selection
checkbox; the identifier is plain text again. The control is an anchor wherever
the record has a route, so middle-click, open-in-new-tab and copy-link survive —
the one thing the identifier link was giving us. Each is named for its row,
"View RFQ0000000358", not "View".

**One defect on the way, worth recording.** The cell was `display: flex` to
centre the icon, copying the selection column beside it. A flex `<td>` leaves
table layout, and with two of them the body table and the header table — two
separate auto-width tables — stopped agreeing: the MPN column measured 240px in
the header and 40px in the body, every part number wrapped over four lines and
rows stood at 72px. The cell is a table cell again and the button centres
itself. The selection column still carries the same `display: flex`; it is
alone in its table today, and worth changing the next time that table is opened.

---

## Not built, and why

**Slide 4, banners** (info / warning / block, for a whole form or one grid).
Nothing in the meeting notes asked for it and no screen currently carries a
banner that contradicts it — `.vy-run-banner` already does the per-grid half on
Run Quotation steps 2 and 3. Worth doing as its own piece, against a list of
which conditions deserve which level, rather than inventing the conditions here.
