import { useMemo, useRef, useState } from 'react';
import * as RPopover from '@radix-ui/react-popover';
import { PEOPLE_DIRECTORY, type Person } from '../data/quotations';

/**
 * A multi-select of people — chips for the chosen, avatar and email for the rest.
 *
 * Built from the live control An sent on 31 Aug 2026 and confirmed in the
 * bundle: `component: "MultiSelect"` with `tagRender` and `onTagDelete` for the
 * chips, and options carrying an `avatar`. Our Assigned To was a single-value
 * dropdown of bare names, which was wrong twice — one value where the live
 * system takes several, and a name where it shows a face and an address.
 *
 * THE EMAIL IS NOT DECORATION. The live list holds "Linh 4 Tran", "Linh Tran 5"
 * and "Linh Tran 1"; ours has "Linh Tran" and "Toan Dinh", whose initials
 * collide at a glance. A directory of colleagues is precisely where names repeat,
 * and the email is the line that tells two of them apart. The avatar is what
 * makes the row scannable once you know which one you want.
 *
 * ON POPOVER, NOT SELECT. Radix Select holds options and manages focus for a
 * listbox — it cannot express multiple values, and its focus scope is what
 * stopped `Select`'s own filter box taking focus. Popover has no such scope, so
 * the filter input here is focusable and typing goes to it immediately, the way
 * the live filterable control behaves.
 */
export function PeoplePicker({ value, onChange, label, id, invalid }: {
  /** Names, matching `PEOPLE_DIRECTORY`. Empty means unassigned. */
  value: string[];
  onChange: (next: string[]) => void;
  label?: string;
  id?: string;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const chosen = useMemo(
    () => value.map(n => PEOPLE_DIRECTORY.find(p => p.name === n)).filter(Boolean) as Person[],
    [value]);

  /* Contains and case-insensitive, matching the live filter descriptor, and over
     BOTH fields — someone who knows the address rather than the spelling of the
     name should not have to guess. */
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PEOPLE_DIRECTORY;
    return PEOPLE_DIRECTORY.filter(p =>
      p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));
  }, [query]);

  const toggle = (name: string) =>
    onChange(value.includes(name) ? value.filter(n => n !== name) : [...value, name]);

  return (
    <RPopover.Root open={open} onOpenChange={o => { setOpen(o); if (!o) setQuery(''); }}>
      <div className="vy-people" data-invalid={invalid || undefined}>
        {/* Chips sit in the control itself, as the live one does, so the field
            shows its value without being opened. */}
        {chosen.map(p => (
          <span className="vy-people-chip" key={p.name}>
            <Avatar person={p} />
            <span className="vy-people-chip-name">{p.name}</span>
            <button type="button" className="vy-people-chip-x"
                    aria-label={`Remove ${p.name}`} title={`Remove ${p.name}`}
                    onClick={() => toggle(p.name)}>×</button>
          </span>
        ))}

        <RPopover.Trigger asChild>
          <button type="button" className="vy-people-add" id={id}
                  aria-label={chosen.length ? `Add to ${label ?? 'people'}` : (label ?? 'Choose people')}>
            {chosen.length ? 'Add…' : 'Choose…'}
          </button>
        </RPopover.Trigger>

        {chosen.length > 1 && (
          /* Only once there is more than one to clear — at a single chip its own
             × is nearer and less ambiguous. */
          <button type="button" className="vy-people-clear"
                  aria-label={`Clear all ${chosen.length}`} title="Clear all"
                  onClick={() => onChange([])}>Clear</button>
        )}
      </div>

      <RPopover.Portal>
        <RPopover.Content className="vy-menu vy-people-menu" sideOffset={4} align="start"
                          onOpenAutoFocus={e => { e.preventDefault(); inputRef.current?.focus(); }}>
          <div className="vy-menu-filter">
            <input ref={inputRef} className="vy-input" value={query}
                   placeholder="Filter by name or email"
                   aria-label="Filter people by name or email"
                   onChange={e => setQuery(e.target.value)} />
          </div>

          <ul className="vy-people-list" role="listbox" aria-multiselectable>
            {shown.map(p => {
              const on = value.includes(p.name);
              return (
                <li key={p.name}>
                  <button type="button" role="option" aria-selected={on}
                          className="vy-people-option" data-on={on || undefined}
                          onClick={() => toggle(p.name)}>
                    <Avatar person={p} />
                    <span className="vy-people-text">
                      <span className="vy-people-name">{p.name}</span>
                      <span className="vy-people-email">{p.email}</span>
                    </span>
                    {on && <span className="vy-people-tick" aria-hidden>✓</span>}
                  </button>
                </li>
              );
            })}
            {shown.length === 0 && (
              <li className="vy-menu-empty">No one matches “{query}”.</li>
            )}
          </ul>
        </RPopover.Content>
      </RPopover.Portal>
    </RPopover.Root>
  );
}

/* Initials, not an image. The live options carry avatar images; this prototype
   has no photographs and inventing them would put fictional faces on a
   colleague list. Initials on the same coloured disc keep the row scannable and
   claim nothing that is not true. */
function Avatar({ person }: { person: Person }) {
  return <span className="vy-avatar vy-avatar--sm" aria-hidden>{person.initials}</span>;
}
