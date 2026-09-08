# Open questions for the client

Twenty-one things the prototype cannot settle on its own, plus thirteen design
system decisions — ten of them answered on 7 September 2026. Each states what we
found, what we did in the meantime, and what we need from you.

**Most are not blocking.** The prototype works under a stated assumption in
every case, and where we chose we said why. But three of them now block work
that cannot start without an answer, and two would be expensive to discover
late.

---

## Design system decisions — answered 7 September 2026

A separate track from the numbered questions below, and a **reframe**. Brand had
been filed here as a naming question: which tagline, whether to rename. It is
not. The name is settled — **Voyager IQ** — and the work is a design system:
a look adapted to an ERP environment, with every component held to a strict
accessibility standard.

| # | Decision | Answer | Consequence |
|---|---|---|---|
| D1 | How far may the palette move from today's Voyager blue? | **Adjacent** — recognisable, clearly new | `--vy-blue-600: #1b4f9c` was derived from the existing mark to keep brand equity. That reasoning stands; the hue shifts within the family |
| D2 | Does Rocket EMS red/navy influence it? | **No — Voyager IQ is its own identity** | Closes the "inspired by Rocket colour" line in the kick-off deck |
| D3 | New logo/mark? | **Yes, but later** | Keep the current "V" mark; leave room for a replacement |
| D4 | WCAG target | **Our default: AA, with AAA on body text** | The contrast harness already enforces this |
| D5 | Typeface | **Our default: Inter, JetBrains Mono for codes** | No licensed corporate face to source |
| D6 | Default row density | **Comfortable** *(changed — we had compact)* | `prefs.tsx` default flipped. Compact fits more rows; they chose scanning comfort for all-day use |
| D7 | Depth — flat/bordered, or elevated? | **Open** | Proceeding on restrained elevation, dialogs only |
| D8 | Corner radius | **Open** | Proceeding on 4–6px |
| D9 | Motion | **Our default: minimal, respects reduced-motion** | |
| D10 | Which screens are the showcase for sign-off? | **Open** | Proposing Quotations list + RFQ record |
| D11 | Kendo components — restyle fully, or keep Kendo's look? | **Kendo stays the base; restyle through primitive tokens, to meet the strict standard** | Confirms the bridge approach: our tokens mapped onto Kendo's ~453 custom properties, rather than overriding component CSS |
| D12 | Languages | **English only** — no Vietnamese, no CJK | Type scale and line-height need no CJK allowance |
| D13 | Dark mode | **In scope, deferred** — prepare for it | Not a deliverable now, but the palette must be authored as semantic pairs from the start. Retrofitting means redoing every token |

### The two that change what we build

**D6 is a code change, applied.** `prefs.tsx` now defaults to `comfortable`. A
returning user's own choice still wins — it is read from `localStorage` first.

**D13 changes the token architecture now, not later.** "Prepare for dark mode"
means the palette is authored as `surface` / `on-surface` semantic pairs rather
than raw `grey-100` references. Deferring the *deliverable* is cheap; deferring
the *architecture* is not.

### Built, 7 September 2026

**The ramp.** Hue 216 → **222**, chosen by measurement. The deciding constraint
was not the blue: two status badges have to stay distinguishable from primary,
and the old ramp was crowding one of them.

| | to violet `waiting` (263) | to cyan `review` (193) |
|---|---|---|
| hue 216, old | 47° | **23°** |
| hue 222, new | 41° | 29° |

So the new hue is not merely different — it is *more evenly* separated than what
it replaces. Going further toward indigo reverses the problem (37° at 226).
Saturation now tapers at the light end, 46% at step 50 rising to 72% at 600, so
a selected row reads as *marked* rather than *coloured*.

Measured on white: **600 = 9.16:1** (AAA as link text), 400 = 4.48:1 (a control
boundary needs 3.0), grey-900 on the 50 tint = 16.16:1.

**The semantic layer**, and it is what D13 actually bought. `--vy-surface`,
`--vy-on-surface`, `--vy-border`, `--vy-brand` and their variants name a *job*;
the primitives are how that job is done today. Dark values are authored and
measured — body text 14.57:1, muted 8.17:1, control boundary 3.83:1 — in a block
that redefines only the semantic layer, never a primitive.

**Nothing consumes it yet.** The stylesheets still reference primitives
directly, so switching the theme today would repaint the tokens and leave every
component where it stands. That migration — 576 colour references across seven
stylesheets — is the next piece, and it is what turns dark mode on.

**Wordmark** now reads VOYAGER IQ in the shell and on Login. The mark is still
the letter V, per D3.

**The migration, 8 September.** All **553** colour references in the owned
stylesheets now name a role instead of a value; `app.css`, `components.css`,
`md3.css` and `responsive.css` contain **zero** raw `--vy-grey-*` or
`--vy-blue-*`. Dark mode is switchable: `data-theme="dark"` repaints the app.

It was done by script, mapping `(css property × primitive × selector)` to a
role — `color` is text, `background` is a surface, `border-*` is a line, and a
`:hover` in the selector picks `surface-hover` over `surface-app`. Rings and
shadows were included, because a focus ring left at `blue-500` on a dark panel
is the same bug as a border left at `grey-200`.

**Proved invisible rather than assumed.** Every mapping was checked to resolve
to the exact primitive it replaced *before* being applied, and the rendered
result was diffed element by element against a snapshot taken beforehand:
Quotations list **738 elements, 0 differences**; the RFQ record **349, 0**.

The first attempt was NOT invisible — 54 differences, all in the sidebar,
because two map entries collapsed distinct greys into one token. That is a
redesign smuggled into a refactor, and the element diff is the only reason it
was caught rather than shipped.

### The bridge, 8 September — and Kendo themed itself

`kendo-bridge.css` now points at roles too. **Zero raw primitives remain
anywhere in the stylesheets.** It was eleven references, and it mattered more
than its size because of what Kendo does with a surface:

```
--kendo-color-on-app-surface:
  oklch(from <surface> clamp(0.36, (0.6 - l) * 99999, 0.95) 0 h)
```

That is a **contrast switch, not a tint** — below 0.6 lightness it snaps to
0.95, above it to 0.36. Handing Kendo a dark surface makes every derived text
colour in the theme flip to near-white by itself. Six variables re-pointed
themed the entire component library; nothing had to be written twice.

| | light | dark |
|---|---|---|
| Contrast failures / 290 checked | **0** | **7** |
| Before the bridge change | 0 | 16 |

**Light mode is still byte-identical** to the pre-migration baseline: 738
elements, 0 differences.

**The seven were all white-on-brand or brand-as-text**, and could not be fixed
by moving `--vy-brand`: tried at blue-300, 400 and 500, and each value just
relocated the failure. One token was serving both a fill and a text colour.

### The brand split, 8 September — dark goes to zero

Fill and text are different jobs, and in a dark theme they pull opposite ways: a
fill has to be dark enough for its label, brand text has to be light enough for
the page. **So the dark theme inverts the pair rather than shifting it** — the
fill goes light and its label goes dark, which is also what Kendo expects, since
`on-primary` is derived from `primary` by a contrast switch.

Three parts: the dark brand values inverted (fill blue-300, label near-black);
six call sites repointed from "white" to `--vy-brand-on`, which is white in
light and so changes nothing there; and the count badge corrected — it is a
**red** fill, never brand, and had been taking `on-surface-invert`, which flips
to near-black in dark and gave 3.37:1 on red.

One Kendo derivation is now pinned, the only one this bridge overrides. Kendo
computes `on-primary` with a **0.75** lightness threshold where the surface
switch uses 0.6; blue-300 sits at 0.68, so Kendo chose white and measured
2.71:1.

| Quotations list | light | dark |
|---|---|---|
| Contrast failures / 261 | **0** | **0** |

Light is **pixel-identical** to the pre-migration baseline on both screens —
738 and 349 elements, 0 differences. *(Compared as resolved pixels: pinning
`on-primary` changed white's serialisation from `oklch(1 0 264)` to
`rgb(255,255,255)`, which a string diff reports as a change and a colour
comparison correctly does not.)*

### The status and accent family, 8 September — dark reaches zero

The last family. `--vy-status-*`, `--vy-tone-*` and `--vy-accent-*` were already
role-named; they only lacked dark values. Red was the exception — a raw ramp used
directly at 34 sites — and now has roles: `--vy-danger`, `-on`, `-text`,
`-text-deep`, `-subtle`, `-boundary`.

**The dark values were not generated by flipping lightness**, because two of
these carry meaning the customer specified and the meaning had to survive.

- **`progress` and `done` are "Green" and "Light Green"** in the Testing
  Guideline, which only reads if one of them is genuinely saturated. Deriving
  both produced two dark tints 18° apart — the distinction gone. So progress
  **keeps its light value**: solid `#15803d`, white text, 5.02:1, while done
  becomes a muted tint. Solid against tint is a clearer separation on a dark
  ground than on a light one.
- **`draft` and `cancelled` stay neutral.** Deriving their pair from hue turned
  them blue, because their light values are greys and a grey has no meaningful
  hue to preserve.

Everything else keeps its hue and inverts the lightness relationship. All pairs
measure between **6.16 and 12.31** against the dark panel.

| | light | dark |
|---|---|---|
| Quotations list | 0 / 290 | **0 / 290** |
| RFQ record, five tabs | 0 | **0 / 145, 146, 99, 108, 110** |

Light stays **pixel-identical** to the pre-migration baseline: 738 and 349
elements, 0 differences.

**Dark mode now sweeps clean on every screen measured.**

### The switch, 8 September

Three states in the user menu beside row density and date format — **Light ·
Dark · System** — persisted in `localStorage`, defaulting to System. Three
rather than a two-way toggle because "follow this device" is a real answer and
the honest default: a user who has already told their operating system which
they prefer should not have to say it again here.

**Applied before first paint** by an inline script in `index.html`. That is not
about avoiding a flash, though it does: Kendo resolves its relative colours when
its stylesheet is first evaluated, so setting the attribute earlier means every
derived colour is correct from the start and needs no repair.

**The runtime caveat is now handled rather than documented.** Chrome
re-resolves most of Kendo's derived colours when `data-theme` changes after
paint, but not all — the grid and its cells flipped while
`--kendo-color-base-on-surface`, which colours every outline button, stayed on
its previous branch. Disabling and re-enabling the stylesheet that *declares*
those properties forces the whole set to re-evaluate; the forced reflow between
the two writes is load-bearing. `src/theme/applyTheme.ts` does it, only for
sheets that actually declare a `--kendo-` property, and only on a change.

| Verified | |
|---|---|
| Light · Dark · System, clicked at runtime | all three flip, including the outline buttons |
| Choice survives a reload | yes, and beats the OS preference |
| Contrast, dark reached **by clicking** | **0 failures / 286** |
| Contrast, light | **0 / 286** |
| Light vs the pre-migration baseline | **pixel-identical**, 738 and 349 |

**Sweeping with the user menu open** found the one real defect in this pass, and
every earlier sweep had missed it because a closed popover renders nothing: the
subtle text tier failed on the two grounds that sit above the page — the
selected tint at 4.23 and `surface-strong` at 3.84. Raised to `#8f9aaa`, which
clears every dark ground in the system.

### One near-miss worth recording

The first "dark, 0 failures" result on these screens was **wrong, and reported
as a pass before it was caught**. An unterminated CSS comment in the note above
these values — `/*` with no `*/` — silently swallowed both dark blocks, so the
page rendered light and a light page sweeps clean. The tell was `81` opening
comment markers against `80` closing.

The check that caught it was cheap and is worth keeping: before believing a
theme result, assert the *tokens* resolved, not just that
`prefers-color-scheme` matched. `--vy-surface` reading `#ffffff` under
`prefersDark: true` is the whole story in one line.

### One engine limitation, measured

Chrome does not re-resolve a relative colour inside a custom property when an
attribute changes after paint. Toggling `data-theme` at runtime leaves Kendo's
derived colours on their previous branch — five controls measured as failures
that way and passed cleanly when the same page was loaded dark from first paint.

So: following `prefers-color-scheme` works today. A runtime toggle would need a
reload, or the theme set before first paint. Worth knowing before anyone
specifies a switch in the header.

### Still open

**D7 (depth), D8 (radius), D10 (showcase screens).** None blocks work — each has
a default in the table — but D10 is worth settling before the design system is
presented, because approving a whole system at once rarely works and picking the
two screens it is judged on is the client's call.

---

## Answer sheet

One line per decision. **If you answer nothing, we keep the "our assumption"
column** — none of it is guesswork we are hiding, but all of it is ours rather
than yours.

Ordered by what an answer unblocks, not by number.

### Answered

| # | Decision | Answer | What it settled |
|---|---|---|---|
| 2 | Do we adopt KendoReact? | **Yes — 4 Sep 2026.** "The main on the original is Kendo also, so the mockup should not be too different." | All eight migration phases; TanStack removed; the bridge becomes the design system rather than a spike |

### Blocking — work cannot start until you answer

| # | Decision | Our assumption | What it unblocks |
|---|---|---|---|
| — | **Brand.** Is "The completed ERP/MES Solution" the tagline you *want*, or the one you want *improved*? If new, is "completed" meant to be "complete"? Rename to **Voyager IQ** now? | We render `VOYAGER` unchanged | The rename, the palette, every screen's header |
| — | **Setting Form View** (deck slide 15) — no guideline section defines it. What is in scope? | Not built; four Configuration paths fall through to a placeholder | An entire screen archetype |
| — | **Dark mode** (deck slide 7) — no source but the deck mentions it. In scope? | Not built; on-dark tokens exist for the sidebar only | Touches every colour token in the system |

### Expensive to get wrong — please confirm early

| # | Decision | Our assumption | Why it matters |
|---|---|---|---|
| 13 | Purchase Lead Time — **days** (your sheet) or **weeks** (your live form)? | Days | A sevenfold planning error either way |
| 12 | Part Source: `PACKAGING` is not in your live system. Should Create New Part also offer SERVICE, MAKE/PHANT, PROG? Does auto-exclusion cover MAKE/PHAN as well as MAKE/PHANT? | The sheet's six, `FLSTK` corrected to `FLRSTK` | Changes which BoM lines get quoted |
| 4 | Date format — your two sources disagree | One format, stated in the doc | Every date on every screen |
| 3 | Rocket Consigned Inventory — your two documents disagree | The shared constant | A field that blanks on open if wrong |
| 7 | Where does the "Quoted" status come from? It is on the list and not in the enumeration. | Shown as-is | The status model |

### Vocabularies we guessed and will swap on sight

| # | Decision | Our assumption |
|---|---|---|
| 14 | Part Class → Part Type mapping; Order Policy values | Our table, in `partMetadata.ts` — one object, one file |
| 8 | What does "Build Requirement" choose from? No metadata code exists | Free text |
| 11 | Two things Quick Quote does not tell us | Stated in the doc |

### Design calls — tell us if you disagree

| # | Decision | Our assumption |
|---|---|---|
| 1 | Where should row actions live? | Identifier opens the record |
| 9 | Record as a modal? Should dialogs minimise? | Full page; no minimise |
| 6 | Priority — stars or a label? | Label |
| 5 | "Assigned To" is not available on the list | Added |
| 10 | Are "RFQ Type" and "Customer Type" the same field? | Treated as distinct |
| 15 | Create BoM: "Create Custom Template" (live) or "Create Customer Template" (sheet)? Add Material Type and BoM Type? Is Select Action really two checkboxes? | Live label; sheet's field list; radio |
| 16 | MFG–MPN: gate the AML on Part Source? Exactly one Primary per part? | Shown on every part; not enforced |
| 17 | **Switches.** Your system ships four; we have none. Which four fields are they? | Flags stay checkboxes, choices stay radios |
| 18 | **Error text with field names in it.** Your Run Quotation message names `assemblyPartNumber, partRev, partDesc`. Keep it exact, or show the labels the user can see? | Kept exact |

**Two defects in your live system** are listed at the end of this document for
your own backlog. They need nothing from us.

---

## 1. Where should row actions live?

**What we found.** Your Testing Guideline lists a **View Detail** column first
on the Project Requirements list, and the live system has one — an eye icon on
every row.

**Why we are asking.** Two reasons.

That column is the KendoReact grid's *command column*, which ships in the
component's own demos. It is very likely a component default rather than a
decision anyone made about this screen.

And your own notes plan a **second** row action: the Note sheet says Historical
RFQ is being replaced by *"duplicate record (clone)"*. One eye icon is fine. An
eye plus a clone icon is a stripe of buttons down the left of every row, and
whatever comes third makes it worse.

**What the wider market does.** Almost every major system opens a record from
its **title or identifier** — Jira, Linear, GitHub, Asana, Monday, HubSpot,
Salesforce. Where they carry row actions, those sit in a **trailing** overflow
menu (`⋯`), not a leading icon. Notion and Airtable reveal an expand control on
hover rather than reserving a column for it.

**What we have done.** Built the eye column to match your guideline, then removed
it. The RFQ number is now the link — it costs no column, supports open-in-new-tab,
and leaves the row itself unclickable so text can still be selected and copied,
which your estimators do daily.

**What we need.** Your call on one of three:
- **a)** Put the eye column back, as the guideline specifies.
- **b)** Leave it as it is — identifier links, no action column.
- **c)** Plan a trailing `⋯` menu now, so clone and anything after it have a home.

We would suggest (c), decided before clone ships rather than after.

---

## 2. KendoReact — answered: adopt

**Answered 4 September 2026: yes.** The reason you gave shapes the work as much
as the answer does — the system you run today is Kendo, so the revamp should
read as the same product improved rather than as a different one.

All eight migration phases are complete; `docs/kendo-migration-scope.md` is the
record, including the two places we got it wrong and how they were caught.

**What the answer changed beyond finishing the migration:**

- **TanStack Table and Virtual are removed.** They stayed in `package.json`,
  unimported, through all eight phases so the work could be reversed on a "no".
  That hedge is spent, and an unused dependency that nobody can explain later is
  a liability rather than an option.
- **The bridge stopped being a spike and became the design system.** While
  adoption was undecided, `kendo-bridge.css` deliberately left elevation, motion
  and disabled unmapped — each was "a design call, not a mapping", and the call
  could not be made. It is made now. See §17 of the migration scope.
- **It found a real defect.** Kendo's focus indicator is 2px of 8% of the text
  colour, which on this app computes to fully transparent. Since phase 1 turned
  every button into a Kendo button, every button in the app had no visible focus
  ring — a WCAG 2.4.7 failure we introduced and did not catch. Fixed.

**The licence is separate and already settled**: the key is present and proven
working (`TELERIK_LICENSE`, held in `.env.local`, which is gitignored and has
been checked absent from every commit). `docs/kendo-license-activation.md` has
the detail.

---

## 3. Rocket Consigned Inventory — your two documents disagree

| Source | Options |
|---|---|
| Live system | `No` · `Yes-No Charge` · `Yes-Charge` |
| Testing Guideline | `None` · `Yes - No Charge` · `Yes - Charge` |

The guideline's entry for the **parallel** field, Net Consigned Inventory, uses
`No` and `Yes-No Charge` — unspaced, starting with "No". So the guideline
contradicts itself between two fields of otherwise identical shape, which reads
as a typo in the Rocket entry.

**We built the live values**, because those are what the API accepts and a
mismatch would make the finished system reject valid input.

**Which is correct?** If the guideline is right, the live system needs changing
too — not just the prototype.

---

## 4. Date format — your two sources disagree

The **Testing Guideline** says date and time columns use the format configured in
*System Configuration → Region Language Format Config* — an administrator
setting, one format for everyone.

The **design review** asked for the user to choose between an exact date and a
count from today — a per-user preference.

These cannot both be true. We have built it as a user preference and flagged it.

**Update, 27 Aug.** The Create PR sheet is more specific than either: Due Date
"accepts the date in MM/DD/YYYY format" with a `month/day/year` placeholder, and
Created Date "displays in MM/DD/YYYY HH:MM:SS format". The prototype currently
renders dates as `15 Oct 2026` and uses the browser's native date picker, which
shows `dd/mm/yyyy` in a European locale and `mm/dd/yyyy` in a US one — so today
it follows the *reader's* machine, not either of your sources. Confirm
MM/DD/YYYY and we will pin it, and add the time to Created Date.

---

## 5. "Assigned To" is not available on the list

It is not a column on the live list, and the Column tab does not offer it, so a
user cannot turn it on either.

That leaves an estimator unable to see who owns a row without opening it — and
the My Queues screen, which you have asked us to build later, is entirely based
on assignment.

**Should Assigned To become an available column?** We think yes, but it is an
addition to your system rather than a gap in ours.

---

## 6. Priority — stars or a label?

The **Testing Guideline** says Priority uses star icons. The **design review**
asked for a coloured dot with High / Medium / Low.

We have followed the review, as it is the more recent and more specific
instruction. Flagging so nobody later reads it as a regression.

**Update, 27 Aug.** The Create PR sheet repeats the guideline's side of this —
"Allows the user to set the RFQ priority using a rating input ... Displays a
tooltip on hover corresponding to the selected level: Low, Medium, or High" —
so the disagreement is between two of your own documents, not between your
document and our judgement. Still built as the review asked.

---

## 7. Where does "Quoted" come from?

`Quoted` appears as a status on the list grid, but it is not in the RFQ status
list we can find. Is it a real status, a derived one, or something else?

---

## 8. What does "Build Requirement" choose from?

There is no `BUILD_REQUIREMENT` metadata code. The only live value we observed
was "System", which belongs to the Application list, so the prototype reuses
that list — **an inference, not a lookup**, and the one option list still worth
confirming.

---

## 9. Should a record open as a modal, and should dialogs minimise?

Two parts, both from running your `PR - PR List` test sheet against the build.

**The record.** Your guideline says the detail opens as a modal, three times.
Ours opens as a full page. The reason written down at the time was that a modal
has no URL, so you cannot send a colleague a link to an RFQ.

**That reason was wrong.** Checking the live system on 27 August, the record
dialog *does* have its own URL. So the decision rested on something untrue. A
page may still be better — it gives a browser back button and a breadcrumb — but
that is now a preference, not a correction, and it is yours to make.

**Minimise.** Your guideline asks every dialog for Minimize, Maximize/Restore
Down and Close. We have built Maximize and Close.

Minimize we have left out, and want to check rather than guess. In Kendo it
collapses a *draggable* window down to its title bar, in place. Our dialogs are
centred and modal, so minimising one would leave a title bar floating in the
middle of a dimmed screen — which does not achieve what minimising is for.

If your users minimise a dialog to read the list underneath it, the real answer
is a non-modal draggable window. That is a different component, and worth
knowing before it gets built rather than after.

---

## 10. Are "RFQ Type" and "Customer Type" the same field?

The **PR List** sheet specifies an **RFQ Type** column. The **Create PR** sheet
specifies a required **Customer Type** field on the form, and gives it the same
four values: Consigned, Managed Consigned, Mixed, Turnkey.

Meanwhile the shipped system carries a *different* Customer Type, written from
the customer record's `custType` and never editable, whose values are TBD,
Consign, Turnkey and Hybrid.

So there are two labels, two option lists and two behaviours across three
sources. We have followed the guideline — Customer Type is now user-selectable
with your four values, defaulting from the customer record — and kept RFQ Type
as its own column, because your list sheet asks for it. If they are one field
under two names, tell us and we will merge them; that is not a change we will
make on a guess.

**Related:** the guideline also says Customer Contact "is read-only" and, four
lines later, that "the user can select a different customer contact from the
list". We have built it as selectable. Worth a correction in your document.

---

## 11. Two things Quick Quote does not tell us

**a. Add: Packages — what is "Total Quantity"?** The sheet says it updates
"accordingly" when Select Quantity is entered, without saying how. We have read
Select Quantity as *per board* and Total Quantity as that times Build Qty, which
is the same relationship every other BoM line has. Read the other way — Total
Quantity simply echoing Select Quantity — the two fields are redundant and the
cost summary comes out wrong: a package entered as 50 raised Cost/Board by the
whole $21 instead of the $0.42 one board consumes. Please confirm.

**b. Did the MFG Mismatch Review panel move, or go?** The shipped system has a
panel on the Review BoM step listing BoM manufacturers that disagree with Z2Data,
offering *Link to an existing Manufacturer*, *Create a new Manufacturer* and *Add
to Alias*. Your Quick Quote sheet has no such panel — it has a *Missing
Manufacturer* filter instead. We have followed the sheet and removed the panel,
but this is us removing something that exists in your live system on the strength
of a document that does not mention it, which is the wrong way round if the sheet
is simply silent rather than deliberate. Tell us and it comes back.

---

## 12. Part Source — your two lists differ, and we found a third

Create New Part (§2.3) offers **BUY, CONSG, FLSTK, MAKE, MAKE/BUY, MAKE/PHAN**.
Quick Quote step 2 offers **BUY, MAKE, MAKE/PHAN, FLRSTK, MAKE/BUY, PACKAGING**.

We read the enumeration out of your live system rather than guess, and it holds
**nine** values: SERVICE, MAKE, BUY, CONSG, MAKE/PHAN, **MAKE/PHANT**, FLRSTK,
MAKE/BUY, PROG.

That answers two of the three differences on its own — `FLSTK` is a typo for
`FLRSTK`, and `MAKE/PHAN` and `MAKE/PHANT` are two real, separate values rather
than one misspelt one. Three things still need you:

1. **`PACKAGING` is not in your live system.** Should the Quick Quote sheet say
   `CONSG`, or does PACKAGING exist somewhere we cannot see?
2. **Should Create New Part offer SERVICE, MAKE/PHANT and PROG?** It offers the
   six your sheet names. A create form that cannot produce a value the system
   accepts is a limitation; adding three you did not ask for is not our call.
3. **Does the auto-exclusion rule cover MAKE/PHAN as well as MAKE/PHANT?** Your
   rule (Quick Quote r81) names MAKE/PHANT only. Both are phantom assemblies and
   neither is physically stocked, so excluding both looks right — but that is an
   inference, and it changes which lines get quoted.

## 13. Purchase Lead Time — days or weeks?

Your Testing Guideline says **"Purchase Lead Time (Days)"**. Your live form
labels the same field **"Purchase lead time (weeks)"**.

We built days, because your written requirement governs. A units mismatch on a
lead time is a seven-fold planning error in either direction, so please confirm
which is right — and if it is weeks, whether Kitting and Production Lead Time
(which your sheet gives in days, and which we have built in days) follow it.

## 14. Part Class and Part Type — what maps to what?

Your sheet requires that "only valid Part Type options mapped to the selected
Part Class are displayed", and we built that behaviour. **The mapping itself is
our guess**, because it is in neither document and your live form reads it from
the server.

We used the classes and types already in the prototype's data:

| Part Class | Part Types offered |
|---|---|
| ASSEMBLY | ELEC-PCB, MECH-FMA |
| COMPONENT | ELEC-PAS, 0402, 0603 |
| RAW | MECH-MCH |
| CONSUMABLE | MECH-MCH, ELEC-PAS |

Send us the real table and we will swap it in — it is one object in one file.
The same goes for **Order Policy**, where your sheet defines the field but names
no values; we offer Lot for lot, Fixed order quantity and Min/Max.

## 15. Create BoM — three label questions

We read this form's labels out of your live system's own resource bundle, so
they are verbatim. Three need you:

1. **"Create Custom Template" or "Create Customer Template"?** Your Testing
   Guideline writes the second; your live app shows the first — beside a
   separate field it calls *Customer Template*. We used your live wording. If
   the button creates a template *for a customer*, the live label may be the
   typo rather than the sheet.
2. **Material Type and BoM Type** are in your live BoM form's label set and not
   in the sheet's Assembly Info list. We built the sheet's list. Should either
   appear on Create BoM?
3. **Select Action is two checkboxes on your sheet** ("Import New BoM
   (checkbox, default selected)", "Load Existing BoM (checkbox)"). They are
   mutually exclusive in every other line of the same sheet — the whole form
   changes with the choice — so we built a radio group. Confirm that is right;
   if they really are checkboxes, what does ticking both mean?

## 16. MFG–MPN (AML) — two rules your sheet does not state

1. **Should the MPN Mapping table appear on every part, or only MAKE and
   MAKE/BUY?** Your step 1 says "Open a Part detail (Part has Part Source is
   MAKE, MAKE/BUY)", which reads as how to reach the screen rather than a rule
   about when it shows — elsewhere you write display rules explicitly ("the BoM
   button should be displayed **only when** Part Source = MAKE, MAKE/BUY or
   MAKE/PHAN"). We show it on every part, because an Approved Manufacturer List
   is most obviously needed on BUY parts, which are the ones you purchase. Tell
   us if it should be hidden on those.

2. **Can a part have more than one Primary, or none?** Order Preference is
   "purchasing priority (Primary/Alternate) guiding buyers", which implies one
   default — but you state no constraint, so we have not enforced one. The form
   *defaults* to Primary for a part's first manufacturer and warns when a part
   ends up with none. If the rule is exactly one Primary, we will enforce it.

Also, two label notes from your live system, for confirmation rather than
decision: it writes **"Total On Hand"** where the sheet writes "Total On-Hand"
(we used yours), and its Add MPN Mapping modal has a field labelled **"Is
Exsisting Mfg"** — a misspelling we have corrected to "Is Existing Mfg" on
screen, and one worth fixing in the live app too.

## 17. Switches — your system has four and we have none

Your bundle ships Kendo's **Switch**, four times (`k-switch` ×4). Nothing in the
prototype is a switch, so somewhere your users are flicking something ours makes
them tick. We cannot tell from the bundle *which* four fields, and that is the
whole question — it can say a component exists, never where it is used.

**Why we did not simply guess.** A switch is an **on/off** control, and we have
two families it could mean, only one of which it can actually be:

**a) The ten on/off flags** — currently checkboxes. This is what a switch
normally replaces, and our first guess if you tell us nothing more than "four".

> Insp Request · SN Request · NCNR · First Article · ITAR · Broker ·
> Cert Request · Lot Code Request · Conformal Coating ·
> Provide Alt AML For Out of Stock

**b) The seven either/or choices** — currently radio groups. We think a switch is
**wrong** for these, and would want to be talked into it:

| where | the choice |
|---|---|
| Import Parts | Import All / Import by Customer |
| Create BoM | Import New BoM / Load Existing BoM |
| Create BoM | AML format: Vertical / Horizontal |
| BoM Comparison | three ways to compare — **a switch cannot express three** |
| Run Quotation | Action |
| Run Quotation | BoM Options |
| Part records | any field whose values are a short fixed list |

Two reasons we would push back on (b). A switch has **one** label and an on/off
state, so "Import All / Import by Customer" would have to lose one of its two
names — the user reads one option and has to infer the other from the switch
being off. And three of these have **three** options, which a switch cannot hold
at all.

**What we need:** the four field names, or the screens they are on. If a switch
turns out to be one of the flags in (a), it is a small change and we will make
it. If your four are in (b), tell us and we will do it your way — but we would
rather ask than quietly ship a control that hides half of a choice.

**Until you answer:** flags stay checkboxes and choices stay radios. Nothing is
blocked; this is the last thing standing between us and retiring the final piece
of the old component library, which is our housekeeping rather than your problem.

## 18. An error message that names fields the user cannot see

Step 1 of Run Quotation, on the Import New BoM flow, refuses to continue with:

> Please input information for **assemblyPartNumber, partRev, partDesc**

Those are internal field names. On the same screen, a few centimetres above the
message, the fields they refer to are labelled:

| the message says | the field on screen says |
|---|---|
| `assemblyPartNumber` | **Assembly Part Number** |
| `partRev` | **Revision** |
| `partDesc` | **Description** |

**We built it that way on purpose and would not change it without asking.** The
string is your Testing Guideline's, word for word, and our rule for anything in
that tier is that layout may be redesigned and content may not — same fields,
same words. A tester matching your sheet against the build is looking for that
exact sentence, and quietly improving it is how a build stops matching the
document it is supposed to be checked against.

So this is a question about your document, not about our screen.

**Three ways to go, and the middle one is probably what you want:**

**a) Leave it exactly as it is.** Your guideline and the build stay identical.
The cost is that a planner who has never seen the code has to work out that
`partRev` is the box labelled Revision. This is what we do today.

**b) Keep the string, add the labels.**

> Please input information for assemblyPartNumber, partRev, partDesc
> — that is Assembly Part Number, Revision and Description.

A tester searching for the original sentence still finds it; a user gets told
which boxes to fill. This is the only option that serves both, and our
suggestion.

**c) Replace it with the labels**, and update the guideline to match. Cleanest
result, but the sheet and the build have to change together or testing breaks.

**One thing worth deciding once rather than per message.** This is not the only
place your text reaches the screen verbatim — "Select assembly first!" sits
beside it, and there are labels elsewhere we have quoted rather than reworded,
including the misspelling in question 16. If the answer here is (b) or (c), tell
us whether it is a rule for all user-facing text or a one-off for this message,
and we will apply it consistently rather than asking again each time.

**Until you answer:** the message stays exactly as your guideline writes it.

## Two defects in the live system, for your backlog

Not questions, just things we noticed and you may not have:

- The grid column reads **`OrderType`** with no space, and **`Created Date `**
  carries a trailing space. Both are in the column definitions.
- The **Sort** tab of View Setting repeats the Column tab's instruction word for
  word — it tells the user to "add or remove **columns**" on a sorting panel —
  and its add button reads **"Add a column"**.
- The stock demo chart *"World Population by Broad Age Groups"* is still on the
  live Home page in production.
