import { ComboBox } from '@progress/kendo-react-dropdowns';
import { Dialog as KendoDialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout';
import * as RRadio from '@radix-ui/react-radio-group';
import { cloneElement, createContext, type ReactNode, useContext, useEffect, useId, useMemo, useState } from 'react';

/* =============================================================================
   Radix primitives, styled from tokens.
   Radix ships behaviour and WAI-ARIA wiring with no styling — focus trapping,
   roving tabindex, escape handling, screen-reader semantics — which is the part
   that is genuinely hard to get right and the part a design system should not
   be reinventing. Appearance is entirely ours.
   ========================================================================== */

/**
 * Dialog, with the window controls the customer's guideline specifies:
 * "Allow user to use modal window actions: Minimize · Maximize/Restore Down ·
 * Close."
 *
 * MAXIMIZE is built. It earns its place — Run Quotation's pricing grid has
 * fourteen columns, and being able to fill the screen with it is the difference
 * between reading the table and scrolling it sideways.
 *
 * MINIMIZE is NOT built, deliberately. In Kendo it collapses a draggable window
 * to its title bar, in place. These dialogs are centred and modal, not
 * draggable, so a minimised one would be a title bar floating in the middle of a
 * dimmed screen — which does not do the thing minimising is for. What a user
 * wants there is to see the list behind, and Close already does that without
 * losing anything, since nothing here is a long-running form.
 *
 * Raised as question 9 rather than guessed at: if their users minimise dialogs
 * to compare against the list underneath, the answer is a non-modal draggable
 * window, which is a different component and worth knowing before it is built.
 */
/**
 * How deep the dialog we are inside is. 0 means "not in one".
 *
 * This app stacks dialogs three deep — a Part record opens a Stock Report,
 * which opens Update Quantity — and every one of them used to carry the same
 * z-index, as did every scrim. Two consequences, both invisible until you look:
 *
 *   1. The innermost dialog was on top only because its portal MOUNTED LAST.
 *      Correct by accident is the same fault that put an error toast behind the
 *      Run Quotation dialog.
 *   2. A child's scrim (below every dialog) could not dim its parent, so three
 *      stacked dialogs all rendered at full brightness with nothing to say
 *      which one was live.
 *
 * Each level now steps its own scrim and panel above the level before it.
 */
const DialogDepth = createContext(0);

export function Dialog({ open, onClose, title, subtitle, children, actions, size = 'md' }: {
  open: boolean; onClose: () => void; title: string; subtitle?: ReactNode;
  children: ReactNode; actions?: ReactNode; size?: 'md' | 'lg' | 'xl';
}) {
  const [maximised, setMaximised] = useState(false);
  /* A dialog reopens at its normal size. Carrying "maximised" across two
     unrelated dialogs would surprise whoever opens the next one. */
  useEffect(() => { if (!open) setMaximised(false); }, [open]);

  /* A UNIQUE ID, and it is an accessibility fix rather than bookkeeping.

     Kendo builds its ARIA ids as `${props.id ?? "accessibility"}-id`, so with no
     `id` passed EVERY dialog on the page gets `dialog-title-accessibility-id`.
     Measured with a BoM dialog open inside a Part record: that id appeared
     twice, and `aria-labelledby` resolves to the first match in the document —
     so the nested dialog announced itself with its PARENT's title. This app
     stacks dialogs three deep, so it is not a corner case. */
  const uid = useId();

  const parentDepth = useContext(DialogDepth);
  const depth = parentDepth + 1;
  /* Ten a level: enough room for the scrim to sit under its own panel and above
     everything below, and still far short of the next token up. */
  const step = (depth - 1) * 10;

  if (!open) return null;

  return (
    <DialogDepth.Provider value={depth}>
      <KendoDialog
        id={uid}
        className={`vy-dialog vy-dialog--${size}${maximised ? ' vy-dialog--max' : ''}`}
        onClose={onClose}
        /* ONE z-index a level now, where Radix needed two. Kendo puts the scrim
           and the panel inside a single positioned wrapper, and `style` lands on
           that wrapper — so raising it lifts both together, and a child's scrim
           dims its parent's panel because the whole child wrapper sits above the
           whole parent one. The two-value scheme this replaces existed because
           Radix portals the overlay and the content as siblings. */
        style={{ zIndex: `calc(var(--vy-z-dialog) + ${step})` }}
        title={
          <div className="vy-dialog-titlewrap">
            <div>
              <div className="vy-dialog-title">{title}</div>
              {subtitle && <div className="vy-dialog-sub">{subtitle}</div>}
            </div>
            <button type="button" className="vy-icon-btn vy-dialog-max"
                    aria-pressed={maximised}
                    aria-label={maximised ? 'Restore down' : 'Maximize'}
                    title={maximised ? 'Restore down' : 'Maximize'}
                    onClick={() => setMaximised(m => !m)}>
              <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor"
                   strokeWidth="1.7" strokeLinejoin="round" aria-hidden>
                {maximised
                  ? <path d="M7 7V4h9v9h-3M4 7h9v9H4z" />
                  : <rect x="4" y="4" width="12" height="12" rx="1" />}
              </svg>
            </button>
          </div>
        }
      >
        {/* No wrapper of our own: `.k-dialog-content` IS the scroll box, and
            nesting a second padded, scrolling div inside it doubled the padding
            and gave the dialog two scrollbars in the same axis. */}
        {children}
        {/* `DialogActionsBar` rather than our own footer. Kendo renders it as a
            SIBLING of the content, so it stays pinned; our footer was inside the
            content and scrolled away with the form, which is the one place a
            dialog's buttons must not go. */}
        {actions && <DialogActionsBar>{actions}</DialogActionsBar>}
      </KendoDialog>
    </DialogDepth.Provider>
  );
}

/**
 * Tabs — our API, Kendo's TabStrip underneath.
 *
 * PHASE B of docs/radix-to-kendo-scope.md, and the swap chosen to go first
 * because it is the one with the strongest evidence and the smallest surface:
 * `k-tabstrip` is the second-most-common marker in the live bundle (×12), so
 * these are tabs the customer already looks at every day, and all six call
 * sites go through this wrapper.
 *
 * THE API DOES NOT CHANGE, so none of those six were touched. Ours is keyed by
 * VALUE — `'general'`, `'quantity'` — and Kendo's is keyed by INDEX. Translating
 * here rather than at the call sites keeps the tab identity in the caller's own
 * vocabulary: a reordered tab array would silently change which tab an index
 * selects, and a string cannot drift that way.
 *
 * THE UNKNOWN-VALUE CASE IS A REAL DIFFERENCE, not a rounding error. Radix
 * showed no panel when `value` matched no tab; `findIndex` returns -1, which
 * Kendo would treat as "none selected" and render an empty strip. Clamping to
 * the first tab is the better failure: a mistyped value shows the wrong tab,
 * which someone notices, rather than an empty box, which reads as a broken
 * screen. No current caller can reach it — every one initialises from its own
 * tab list — so this is a guard, not a behaviour anyone relies on.
 *
 * The count badge stays ours. Kendo's `title` takes a ReactNode, so it rides
 * along inside the tab label with no wrapper of its own.
 */
export function Tabs({ tabs, value, onValueChange }: {
  tabs: { value: string; label: string; count?: number; content: ReactNode }[];
  value: string; onValueChange: (v: string) => void;
}) {
  const found = tabs.findIndex(t => t.value === value);
  const selected = found === -1 ? 0 : found;

  return (
    <TabStrip
      selected={selected}
      onSelect={e => { const t = tabs[e.selected]; if (t) onValueChange(t.value); }}
      className="vy-tabs"
    >
      {tabs.map(t => (
        <TabStripTab
          key={t.value}
          contentClassName="vy-tabpanel"
          title={
            <>
              {t.label}
              {t.count !== undefined && t.count > 0 && <span className="vy-tab-count">{t.count}</span>}
            </>
          }
        >
          {t.content}
        </TabStripTab>
      ))}
    </TabStrip>
  );
}

/**
 * Checkbox — Kendo's, and deliberately NOT Kendo's React component.
 *
 * PHASE C of docs/radix-to-kendo-scope.md. Phase A found three checkboxes in
 * this app and collapsed the unstyled one into our own; this finishes the job
 * by making all of them Kendo's, which is what the customer's live system uses.
 *
 * WHY THE CLASS AND NOT `<Checkbox>` FROM `kendo-react-inputs`. Kendo's React
 * component cannot express two things this app needs:
 *
 *   - `indeterminate`. There is no prop for it. The grid's select-all box needs
 *     it to mean "some rows on this page, not all", and it is set through the
 *     DOM node either way.
 *   - `aria-label`. Only `ariaLabelledBy` / `ariaDescribedBy` are offered, and
 *     the grid names every row's box individually — "Select 01455-387-9552" —
 *     because a screen reader moving down twenty identical labels learns
 *     nothing from "Select row".
 *
 * Kendo's component renders exactly this markup: a native input carrying
 * `k-checkbox`. Using the class directly gives the same pixels, keeps both
 * capabilities, and avoids a React wrapper around each of the ~300 checkboxes a
 * full grid page renders. Kendo styles `.k-checkbox:indeterminate` — the native
 * pseudo-class — so the state comes through with no help from us.
 *
 * `k-checkbox-lg` is 20px, measured, which is exactly the size the hand-written
 * box was. `md` is 16px and would have quietly shrunk every checkbox in the app
 * by a fifth — including the grid's, where the label's 24px target is switched
 * off and the box IS the pointer target.
 */
export function Checkbox({ checked, onCheckedChange, label }: {
  checked: boolean; onCheckedChange: (c: boolean) => void; label: ReactNode;
}) {
  return (
    <label className="vy-check">
      <input type="checkbox" className="k-checkbox k-checkbox-lg"
             checked={checked}
             onChange={e => onCheckedChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export function RadioGroup({ options, value, onChange, label }: {
  options: { value: string; label: string }[]; value: string;
  onChange: (v: string) => void; label: string;
}) {
  return (
    <RRadio.Root value={value} onValueChange={onChange} aria-label={label} className="vy-radios">
      {options.map(o => (
        <label className="vy-radio" key={o.value}>
          <RRadio.Item value={o.value} className="vy-radio-dot" data-state-layer>
            <RRadio.Indicator className="vy-radio-fill" />
          </RRadio.Item>
          <span>{o.label}</span>
        </label>
      ))}
    </RRadio.Root>
  );
}

/**
 * A combobox: the field IS the input, and the list filters as you type.
 *
 * Rebuilt from Radix Select onto Popover, for two reasons that turned out to be
 * the same reason.
 *
 * FOCUS. The previous version put a filter box inside Radix Select's content and
 * it could never hold focus — Select keeps a focus scope on its listbox and
 * returns focus to the selected option. autoFocus, a frame and a macrotask after
 * it were all beaten. Popover has no such scope.
 *
 * SHAPE. Checking the live bundle after An asked about the Customer control
 * settled what it should have been anyway: `onComboBoxKeyDown` appears in the
 * app's own code, and the ComboBox implementation with `allowCustom` ships. A
 * ComboBox's trigger is the text input — you type in the FIELD, as An's Assigned
 * To screenshot shows — not in a box that appears after opening a button. So the
 * filter box was never the right shape; the field itself is.
 *
 * IT STILL WILL NOT ACCEPT A VALUE OUTSIDE THE LIST. Kendo's `allowCustom`
 * permits that and this does not, because `docs/bundle-evidence.md` established
 * that Customer is a lookup: typing a customer who does not exist has to be
 * impossible. Type to narrow, then choose.
 */
export function Select({ options, value, onChange, label, id, required, invalid }: {
  options: string[]; value: string; onChange: (v: string) => void;
  label?: string; id?: string; required?: boolean; invalid?: boolean;
  /** Accepted and ignored: every list filters now. Kept so call sites compile. */
  filterable?: boolean;
}) {
  /* FILTERING IS CONTROLLED, on purpose. Kendo can filter its own data, but its
     default operator is not ours: `bundle-evidence.md` read a `contains` filter
     descriptor with `ignoreCase` off the live app, and that is what this does.
     Holding the filter here keeps the operator ours and visible, rather than a
     prop whose meaning changes with a Kendo release. */
  const [filter, setFilter] = useState('');
  const shown = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return q ? options.filter(o => o.toLowerCase().includes(q)) : options;
  }, [options, filter]);

  return (
    <ComboBox
      id={id}
      className="vy-select"
      data={shown}
      value={value}
      /* `e.value` is null when the field is cleared; the 37 call sites are typed
         for a string and several write it straight into a record. */
      /* NULL IS IGNORED, and this is a data-loss fix rather than a preference.
         With `allowCustom` false, Kendo answers unmatched text by setting the
         value to null — so typing over a chosen customer and clicking away
         CLEARED it. Caught with "Nonexistent Customer Ltd": the customer went
         blank while the Part Number kept the `00455-` prefix that customer had
         put there, leaving a form that referred to a customer it no longer had.

         The control this replaces could not do that: typing filtered, and only
         choosing an option changed the value. Ignoring null restores exactly
         that, and `clearButton` is off because it is the other route to null —
         leaving it on would be a button that does nothing. Neither is a loss:
         where empty is a legal answer the option list already carries a blank
         entry, which renders as an em dash below. */
      onChange={e => { if (e.value != null) onChange(e.value); setFilter(''); }}
      clearButton={false}
      filterable
      /* NOTE: `filter` is deliberately NOT passed back as a prop, though Kendo
         accepts it. Controlling it means handing Kendo a defined string on every
         render, which puts the ComboBox permanently into filter-display mode:
         the field then shows the filter — empty — instead of the chosen value.
         The symptom was a committed selection that left the box looking blank,
         while the Part Number field beside it correctly grew its `00455-`
         customer prefix, proving the value HAD reached the form.

         So Kendo owns the input text, and we own only the filtering: the query
         arrives here, and `data` is what we decide it means. */
      onFilterChange={e => setFilter(e.filter.value)}
      /* THE ONE CONSTRAINT THIS COMPONENT EXISTS TO KEEP. `allowCustom` would let
         a user type a customer who does not exist and have it accepted;
         `bundle-evidence.md` established Customer is a LOOKUP, so that has to be
         impossible. False is Kendo's default — stated anyway, because a default
         is not a decision and this one was argued from evidence. */
      allowCustom={false}
      ariaLabel={label}
      /* Kendo has no `required` or `invalid` prop. `inputAttributes` puts them on
         the real input, which is where a screen reader looks for them. */
      inputAttributes={{
        'aria-required': required || undefined,
        'aria-invalid': invalid || undefined,
      }}
      /* An empty option is a real choice in this data — "no package type" — and
         rendering it as a blank row gives the user nothing to aim at. */
      itemRender={(li, itemProps) =>
        itemProps.dataItem === ''
          ? cloneElement(li, li.props, <span className="vy-empty">—</span>)
          : li}
      listNoDataRender={() => (
        <div className="vy-menu-empty">No option matches “{filter}”.</div>
      )}
    />
  );
}
