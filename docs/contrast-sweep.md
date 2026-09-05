# Contrast sweep — 5 September 2026

Recorded as undone in three places (`kendo-migration-scope.md` twice,
`ux-audit.md` once) since the Kendo surfaces landed. This is that measurement.

**Headline: all text passes. Three control BORDERS fail, and the reason is a gap
in the palette rather than a mistake in any one component.**

## Method, and why it can be trusted

Colours are read through a **canvas pixel** rather than parsed from strings —
Kendo emits `oklch()`, which no regex over `getComputedStyle` handles. Backgrounds
are composited up the ancestor chain, so a semi-transparent surface is measured
against what is actually behind it rather than assumed to be white.

**The harness was validated before its results were believed.** A `#bbbbbb`-on-
white element was planted in the page: it was caught at **1.92:1** against an
expected ~2.0. A sweep that reports no failures is only worth reading if it can
prove it would have found one.

## Text — passes everywhere measured

| surface | distinct colour/size/weight combinations | failures |
|---|---|---|
| Part Master (grid, toolbar, pager, filters) | 35 | **0** |
| Add Part Master Detail (form, tabs, buttons) | 43 | **0** |

Thresholds applied per WCAG 1.4.3: 4.5:1 normal, 3:1 for large text
(≥24px, or ≥18.66px at weight ≥700).

## States — all pass

| indicator | ratio | |
|---|---|---|
| Checked checkbox fill vs surface | **7.94** | pass |
| Tick glyph vs its own fill | **7.94** | pass |
| Inactive tab text | **10.74** | pass |
| Active tab text | **7.85** | pass |
| Focus ring vs white | **5.87** | pass |
| Outlined button border | **10.12** | pass |

The first three of these initially read as failures at ~1.0. They were not:
setting `checked` on a React-controlled input does not survive its next render,
and the active tab is not marked by a bottom border, which is what the probe had
assumed. Measured properly, all three are comfortable.

## Non-text — three real failures (WCAG 1.4.11, 3:1)

| control boundary | colour | ratio |
|---|---|---|
| Combobox / picker | `#dde2e9` grey-200 | **1.30** |
| Text input, textarea | `#c3cbd6` grey-300 | **1.64** |
| Checkbox, unchecked | `#97a2b2` grey-400 | **2.55** |

These are the three most-used controls in the application, and the boundary is
the only thing that says where the control is when it is empty.

**Not counted as failures**, though the raw numbers look similar: the grid's
header rule and cell dividers (~1.21), and an inactive tab's bottom border.
1.4.11 covers user-interface components and graphical objects — a table rule is
structural decoration, and reporting it would pad the list without helping
anyone.

## The actual finding: the palette has no step that conforms

| token | hex | vs white |
|---|---|---|
| grey-200 | `#dde2e9` | 1.30 |
| grey-300 | `#c3cbd6` | 1.64 |
| grey-400 | `#97a2b2` | 2.58 |
| **— nothing here —** | | **3.00 needed** |
| grey-500 | `#626d7e` | 5.24 |
| grey-600 | `#4d5766` | 7.32 |

grey-400 misses by **0.42**, and the next step overshoots to nearly double what
is required. So this was never fixable by "pick the next grey" — which is
presumably why the checkbox was left at grey-400 in phase C, and why it stayed
at 2.55 after being explicitly flagged.

**Applied** — `--vy-border-control: #8a94a3`, measured **3.07:1**: the lightest
value that conforms, one shade off grey-400 and in the same blue-grey family, so
it buys the conformance and changes as little as possible about how the app
looks. It governs boundaries only — input, textarea, combobox, checkbox, radio.
Panel edges, card outlines, table rules and dashed drop zones stay on the grey
scale, because 1.4.11 does not cover structure.

`.vy-input:hover` moved from grey-400 to grey-500 with it. The resting border is
now darker than grey-400, so the old hover was lighter than the state it was
meant to emphasise.

### Verified after applying

| boundary | before | after |
|---|---|---|
| Combobox / picker | 1.30 | **3.07** |
| Text input, textarea | 1.64 | **3.07** |
| Checkbox, unchecked | 2.55 | **3.03** |
| Radio, unchecked | 2.58 | **3.07** |

Text re-swept on the same page afterwards: 40 combinations, **0 failures** — the
change is confined to borders.

## A fifth failure, found while verifying rather than by the sweep

`.vy-chip` renders on one screen, conditionally, so it was on neither page
swept — it only appears when a queue filter is active, and always in its
selected state. Its border was **blue-300 at 2.50**.

It is a real failure rather than a technicality: the chip's fill is blue-50,
which measures **1.11:1** against the page — effectively white — so the border
is the only thing defining the chip's shape.

Unlike the grey scale, the blue scale already had a conforming step, so this
needed no new token: **blue-400 at 3.88**.

## One thing that is weak rather than failing

The active tab is distinguished from its neighbours essentially **by colour**:
active blue against inactive grey is **1.37:1** between the two text colours. A
non-colour cue does exist — Kendo boxes the active tab on three sides — but that
box is grey-200 at **1.21:1**, so it carries very little of the load. Not a hard
1.4.1 failure, because the cue is present; worth knowing that it is thin.

## Run Quotation wizard — swept 5 September

| step | combinations | failures among ACTIVE content |
|---|---|---|
| 1 — Config BoM | 58 | **0** |
| 2 — Review BoM | 60 | **0** |
| Review Excluded Parts (nested) | 64 | **0** |
| 3 — Quoting | 67 | **0** |

The amber "excluded parts cannot be recovered" banner passes. So does the
validation toast — white on red-600, **5.52:1**.

**Every failure the wizard produces is a dimmed INACTIVE control**, and the same
three every time: the steps you have not reached yet. Measured at effective
opacity 0.55 — step name **3.00**, step description **2.20** — plus a disabled
`Next` at **3.96**.

WCAG 1.4.3 exempts text that is part of an inactive user-interface component, and
these are disabled buttons, so they are **conformant as they stand**. Recording
them anyway because the exemption is a technicality here: "Cost estimation and
submission" is a sentence describing what the user is about to do, and at 2.2:1
it is hard to read while it is still useful to read.

Worth knowing if it is ever addressed: **opacity cannot fix it**. Raising 0.55 to
0.7 gives roughly 2.9 and 3.9 — still short of 4.5. Conformance would mean not
dimming the text at all and signalling "not reached" some other way, e.g. through
the pip alone. That is a design change, not a defect fix.

### Not reached

**Step 4, Summary.** It unlocks only once a supplier is chosen on all 21 quoted
lines, and the browser pane clamps timers on a hidden page, so scripting that is
about twenty round trips. Three steps and the nested dialog all produced the same
single pattern, so the marginal value was low — but it is unswept, and said so
rather than assumed.

## Result tab and checklist screens — swept 5 September

Both were swept in **two states each**, because an empty state and a populated
table are different surfaces and only one of them was reachable by default.

| surface | combinations | failures among ACTIVE content |
|---|---|---|
| Checklists & Assignment — 4 open tasks | 51 | **0** |
| Checklists & Assignment — 3 of 3 done, documents attached | 47 | **0** |
| Quotation Result — empty state | 38 | **0** |
| Quotation Result — populated, US$2,083.62 summary and cost table | 44 | **0** |

180 combinations, and the same single pattern as everywhere else: the only
failures are **disabled controls** — a greyed `Approve` on one record and a
greyed `Upload` on the other, both at opacity 0.6, measuring 3.30 and 3.41.
Inactive components, exempt under 1.4.3.

Everything that carries meaning passes, including the parts most likely not to:
the red **"179 days late"** badge, the `Quoted` status pill, the money figures in
the results summary, and the document links in the task table.

**Reaching the populated Result tab is worth writing down**, because it is not
obvious: results exist only for RFQs whose status is `Quoted` or `Completed`, and
the Project Requirement list opens filtered to the **Open only** queue, which
excludes exactly those. Clear the queue filter, then filter Status = Quoted —
four records — and any of them has a costed result.

Dark mode does not exist to sweep. The Run Quotation wizard's step 4 remains the
only surface still unreached, for the reason given above.

## A harness gap, found and closed mid-sweep

The first version of the probe composited background alpha but **ignored ancestor
`opacity`** — so text dimmed by a parent was measured at full strength. It found
the wizard's stepper only after being taught to multiply opacity up the tree.

**The earlier results were re-checked rather than assumed still valid.** With the
corrected probe, Part Master and the Add Part dialog contain three dimmed texts
between them — the two pager arrows at 3.01 and the disabled Save at 3.96 — all
inactive, all exempt. The published "0 failures" for both stands.

One more artefact worth recording: measured while the dialog's entrance animation
was frozen, **every element in it reads `opacity: 0`**. A hidden browser pane
does not advance CSS animations, so the whole dialog appeared to fail at 1.00:1.
Disabling animations before measuring is not optional here.
