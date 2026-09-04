import * as RDialog from '@radix-ui/react-dialog';
import * as RPopover from '@radix-ui/react-popover';
import * as RTabs from '@radix-ui/react-tabs';
import * as RToggle from '@radix-ui/react-toggle-group';
import * as RProgress from '@radix-ui/react-progress';
import * as RCheckbox from '@radix-ui/react-checkbox';
import * as RRadio from '@radix-ui/react-radio-group';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';

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

  const parentDepth = useContext(DialogDepth);
  const depth = parentDepth + 1;
  /* Ten a level: enough room for the scrim to sit under its own panel and above
     everything below, and still far short of the next token up. */
  const step = (depth - 1) * 10;

  return (
    <DialogDepth.Provider value={depth}>
    <RDialog.Root open={open} onOpenChange={o => !o && onClose()}>
      <RDialog.Portal>
        <RDialog.Overlay className="vy-scrim"
                         style={{ zIndex: `calc(var(--vy-z-dialog) + ${step})` }} />
        <RDialog.Content className="vy-dialog" data-size={size} data-maximised={maximised || undefined}
                         style={{ zIndex: `calc(var(--vy-z-dialog) + ${step + 1})` }}>
          <header className="vy-dialog-head">
            <div>
              <RDialog.Title className="vy-dialog-title">{title}</RDialog.Title>
              {subtitle && <RDialog.Description className="vy-dialog-sub">{subtitle}</RDialog.Description>}
            </div>
            <div className="vy-window-actions">
              <button type="button" className="vy-icon-btn"
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
              <RDialog.Close className="vy-icon-btn" aria-label="Close" title="Close" data-state-layer>
                <svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor"
                     strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                  <path d="m5 5 10 10M15 5 5 15" />
                </svg>
              </RDialog.Close>
            </div>
          </header>
          <div className="vy-dialog-body">{children}</div>
          {actions && <footer className="vy-dialog-actions">{actions}</footer>}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
    </DialogDepth.Provider>
  );
}

export function Tabs({ tabs, value, onValueChange }: {
  tabs: { value: string; label: string; count?: number; content: ReactNode }[];
  value: string; onValueChange: (v: string) => void;
}) {
  return (
    <RTabs.Root value={value} onValueChange={onValueChange} className="vy-tabs">
      <RTabs.List className="vy-tablist">
        {tabs.map(t => (
          <RTabs.Trigger key={t.value} value={t.value} className="vy-tab" data-state-layer>
            {t.label}
            {t.count !== undefined && t.count > 0 && <span className="vy-tab-count">{t.count}</span>}
          </RTabs.Trigger>
        ))}
      </RTabs.List>
      {tabs.map(t => (
        <RTabs.Content key={t.value} value={t.value} className="vy-tabpanel">{t.content}</RTabs.Content>
      ))}
    </RTabs.Root>
  );
}

/** Segmented control. One click, current state always visible — the reason the
 *  density control stopped being a dropdown in the first place. */
export function SegmentedControl<T extends string>({ options, value, onChange, label }: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string;
}) {
  return (
    <RToggle.Root type="single" value={value} aria-label={label} className="vy-segmented"
                  onValueChange={v => v && onChange(v as T)}>
      {options.map(o => (
        <RToggle.Item key={o.value} value={o.value} className="vy-segment" data-state-layer>
          {o.label}
        </RToggle.Item>
      ))}
    </RToggle.Root>
  );
}

export function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <RProgress.Root className="vy-progress" value={value} aria-label={label}>
      <RProgress.Indicator className="vy-progress-bar" data-value={value} />
    </RProgress.Root>
  );
}

export function Checkbox({ checked, onCheckedChange, label }: {
  checked: boolean; onCheckedChange: (c: boolean) => void; label: ReactNode;
}) {
  return (
    <label className="vy-check">
      <RCheckbox.Root checked={checked} onCheckedChange={c => onCheckedChange(Boolean(c))}
                      className="vy-check-box" data-state-layer>
        <RCheckbox.Indicator>
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
            <path d="M3 8.5 6.2 11.5 13 4.5" fill="none" stroke="currentColor"
                  strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </RCheckbox.Indicator>
      </RCheckbox.Root>
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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = `${id ?? label ?? 'sel'}-list`;

  /* Contains and case-insensitive, matching the live filter descriptor. */
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter(o => o.toLowerCase().includes(q)) : options;
  }, [options, query]);

  /* While closed the field shows the VALUE; open, it shows what is being typed.
     One input doing both is what makes it a combobox rather than a button that
     happens to sit above a list. */
  const shownText = open ? query : value;

  const commit = (v: string) => { onChange(v); setQuery(''); setOpen(false); };

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) { setOpen(true); return; }
      const d = e.key === 'ArrowDown' ? 1 : -1;
      setActive(i => (i + d + shown.length) % Math.max(shown.length, 1));
    } else if (e.key === 'Enter') {
      if (open && shown[active] !== undefined) { e.preventDefault(); commit(shown[active]); }
    } else if (e.key === 'Escape') {
      setQuery(''); setOpen(false);
    } else if (e.key === 'Home' && open) { e.preventDefault(); setActive(0); }
    else if (e.key === 'End' && open) { e.preventDefault(); setActive(shown.length - 1); }
  }

  return (
    <RPopover.Root open={open} onOpenChange={o => { setOpen(o); if (!o) setQuery(''); }}>
      <RPopover.Anchor asChild>
        <div className="vy-select" data-invalid={invalid || undefined} data-open={open || undefined}>
          <input
            ref={inputRef}
            id={id}
            className="vy-select-input"
            /* The ARIA a combobox owes: what it controls, whether it is open,
               and which option is current — the last via activedescendant, so
               focus can stay in the input while the highlight moves. */
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-label={label}
            aria-required={required || undefined}
            aria-invalid={invalid || undefined}
            aria-activedescendant={open && shown[active] ? `${listId}-${active}` : undefined}
            value={shownText}
            placeholder={open && value ? value : undefined}
            onChange={e => { setQuery(e.target.value); setActive(0); if (!open) setOpen(true); }}
            onKeyDown={onKeyDown}
            onMouseDown={() => setOpen(true)}
          />
          <button type="button" className="vy-select-caret" tabIndex={-1} aria-hidden
                  onMouseDown={e => { e.preventDefault(); setOpen(o => !o); inputRef.current?.focus(); }}>
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor"
                 strokeWidth="1.8" strokeLinecap="round"><path d="m5 8 5 5 5-5" /></svg>
          </button>
        </div>
      </RPopover.Anchor>

      <RPopover.Portal>
        <RPopover.Content
          className="vy-menu vy-select-menu" sideOffset={4} align="start"
          /* Focus stays in the field. Without this Popover moves it into the
             content and the next keystroke goes nowhere useful. */
          onOpenAutoFocus={e => e.preventDefault()}
          onCloseAutoFocus={e => e.preventDefault()}
        >
          <ul className="vy-select-list" role="listbox" id={listId} aria-label={label}>
            {shown.map((o, i) => (
              <li key={o || `blank-${i}`}>
                <button type="button" role="option" id={`${listId}-${i}`}
                        aria-selected={o === value}
                        className="vy-menu-item" data-active={i === active || undefined}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => commit(o)}>
                  {o || <span className="vy-empty">—</span>}
                </button>
              </li>
            ))}
            {shown.length === 0 && (
              <li className="vy-menu-empty">No option matches “{query}”.</li>
            )}
          </ul>
        </RPopover.Content>
      </RPopover.Portal>
    </RPopover.Root>
  );
}
