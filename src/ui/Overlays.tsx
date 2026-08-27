import * as RDialog from '@radix-ui/react-dialog';
import * as RTabs from '@radix-ui/react-tabs';
import * as RToggle from '@radix-ui/react-toggle-group';
import * as RProgress from '@radix-ui/react-progress';
import * as RCheckbox from '@radix-ui/react-checkbox';
import * as RRadio from '@radix-ui/react-radio-group';
import * as RSelect from '@radix-ui/react-select';
import { useEffect, useState, type ReactNode } from 'react';

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
export function Dialog({ open, onClose, title, subtitle, children, actions, size = 'md' }: {
  open: boolean; onClose: () => void; title: string; subtitle?: ReactNode;
  children: ReactNode; actions?: ReactNode; size?: 'md' | 'lg' | 'xl';
}) {
  const [maximised, setMaximised] = useState(false);
  /* A dialog reopens at its normal size. Carrying "maximised" across two
     unrelated dialogs would surprise whoever opens the next one. */
  useEffect(() => { if (!open) setMaximised(false); }, [open]);

  return (
    <RDialog.Root open={open} onOpenChange={o => !o && onClose()}>
      <RDialog.Portal>
        <RDialog.Overlay className="vy-scrim" />
        <RDialog.Content className="vy-dialog" data-size={size} data-maximised={maximised || undefined}>
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

export function Select({ options, value, onChange, label, id, required, invalid }: {
  options: string[]; value: string; onChange: (v: string) => void;
  label?: string; id?: string; required?: boolean; invalid?: boolean;
}) {
  return (
    <RSelect.Root value={value} onValueChange={onChange}>
      <RSelect.Trigger className="vy-select" aria-label={label} id={id}
                       aria-required={required || undefined}
                       aria-invalid={invalid || undefined} data-state-layer>
        <RSelect.Value />
        <RSelect.Icon>
          <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor"
               strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="m5 8 5 5 5-5" /></svg>
        </RSelect.Icon>
      </RSelect.Trigger>
      <RSelect.Portal>
        <RSelect.Content className="vy-menu" position="popper" sideOffset={4}>
          <RSelect.Viewport>
            {options.map(o => (
              <RSelect.Item key={o} value={o} className="vy-menu-item" data-state-layer>
                <RSelect.ItemText>{o}</RSelect.ItemText>
              </RSelect.Item>
            ))}
          </RSelect.Viewport>
        </RSelect.Content>
      </RSelect.Portal>
    </RSelect.Root>
  );
}
