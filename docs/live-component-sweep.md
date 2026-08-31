# Live components vs ours — a sweep

Read from the production build on 31 Aug 2026: `index.html` →
`assets/lib-bundle-BxbBltK-.js` → **all 239 `assets/chunk-*.js`**, every one
fetched and scanned. No login, no writes.

Prompted by An finding that the live Customer picker filters as you type while
ours was a plain dropdown. That was one control; this asks the same question of
every control, because the written sources describe **data and rules** well and
are nearly silent on **behaviour** — the gap that produced it.

> **Read the hash out of `index.html`.** The entry bundle is
> `lib-bundle-BxbBltK-.js` today and was `lib-bundle-D109_KxB.js` when
> `bundle-evidence.md` was written. They redeploy; a hash written down here will
> go stale.

## What the live app ships

Component names are `KendoReact*` display names; the `k-*` are CSS class markers.
Counts are occurrences across entry + 239 chunks.

| Live | Evidence | Ours |
|---|---|---|
| **Grid**, with a pager | `KendoReactGrid` ×8, `k-grid` ×23, `k-pager` ×6 | `DataGrid` — TanStack table + virtualiser |
| **Per-column filter cells** | `k-filtercell` ×4 | **absent** — see below |
| **DropDownList**, filterable | `KendoReactDropDownList`, filter descriptor with `ignoreCase` | `Select` — now filters above 8 options |
| **DatePicker** | `k-datepicker` ×1 | native `<input type="date">` |
| **Dialog / Window** | `KendoReactDialog`, `k-window` ×5, `k-dialog` ×4 | `Dialog` on Radix |
| **TabStrip** | `k-tabstrip` ×12 | `Tabs` on Radix |
| **Upload** | `k-upload` ×3 | **absent** — no `type="file"` anywhere |
| **Switch** | `KendoReactSwitch`, `k-switch` ×4 | `Checkbox` / toggle group |
| **Checkbox** | `k-checkbox` ×1 | `Checkbox` on Radix |
| **Notification** | `k-notification` ×1 | `Toast` on Radix |
| **Menu** | `k-menu` ×8 | Popover menus |
| **DropDownButton** | `KendoReactDropDownButton` | **absent** — plain buttons |
| **Draggable** | `KendoReactDraggable` | **absent** |
| Form primitives | `Field`, `FormElement`, `Label`, `Hint`, `Error` | `Field.tsx`, `RecordField.tsx` |

## Absent from the live app, confirmed across all 239 chunks

- **`ComboBox`** — zero occurrences. The pickers are DropDownLists that filter;
  they never accept a value that is not in the list. This matters because
  "combobox" in conversation suggests free text, and free text would contradict
  `bundle-evidence.md`'s "Customer is a lookup, not text".
- **`MultiSelect`** — zero. No multi-value picker anywhere.
- **`NumericTextBox`** — zero. Numbers are plain inputs, as ours are.

## The one real gap: per-column filter cells

`k-filtercell` is the Kendo Grid's in-header filter row — the control that gives
"Contains, Does not contain, Is [not] equal to, Starts/Ends with, Is null", which
is exactly what the Testing Guideline describes for the BoM **Components Part**
tab. We have no equivalent.

**It does not contradict `filter-spec.md`.** That document reads the LIST
screen's filter toolbar and correctly records it as having no operators. The two
are different controls on different grids: a toolbar of pickers above the list,
and an operator menu per column inside a component grid. Four occurrences is
consistent with the latter being used on a handful of grids rather than
everywhere.

**Worth asking before building.** Which grids carry filter cells is not
answerable from the bundle, and operators are a different filtering model from
the one this prototype has committed to.

## Smaller gaps

**Upload.** `k-upload` ships and we have no file input at all — every upload in
this prototype reports what it would do. That is defensible while the flows
behind them are unbuilt (Create BoM, Import parts, Update BOM), but the control
itself has never been designed, and three separate places now need it.

**Switch.** The live app has a real switch; our binary choices are checkboxes or
a toggle group. Cosmetic unless a specific field is a switch in the live UI,
which the bundle cannot tell us.

**DropDownButton.** A button with a menu attached. Nothing in our app currently
needs one — worth knowing it exists if a split action turns up.

**DatePicker.** Live uses Kendo's; ours is the native control. Native is
arguably better — it is keyboard and locale aware for free — but it looks
different, and `open-questions.md` item 4 already has an open date-format
question this belongs with.

## What this sweep does not answer

Which SCREEN uses which control. The bundle proves a component is shipped, not
where. Every mapping above between a live component and one of ours is by kind,
not by verified screen — matching a control to a field still needs the live UI,
which needs a login we do not have.
