import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A small rich text editor, matching the toolbar the live Conversations tab has.
 *
 * Read off the live editor, in its order:
 *
 *   Undo · Redo | Bold · Italic · Underline · Strikethrough |
 *   Insert unordered list · Insert ordered list | Color · Background color |
 *   Outdent · Indent | Format | Clean formatting
 *
 * Reproduced exactly, because a comment written in the real system can contain
 * all of it — a plain textarea here would render a formatted note as a wall of
 * unstyled text, and an editor missing "Clean formatting" cannot undo a paste
 * from Word.
 *
 * NOT built: the live tab shows a "?" beside the toolbar. It looks like a help
 * control and is not — it is the current user's avatar with no initials to
 * show. Worth recording, because building a help affordance that does not exist
 * is exactly the kind of invention this project has had to keep undoing.
 *
 * IMPLEMENTATION. `contentEditable` plus `document.execCommand`. execCommand is
 * deprecated and its replacement is to ship a full editor framework, which for
 * a prototype toolbar is a large dependency to prove a small point. It is
 * supported in every current browser, and the seam is one file: swapping in a
 * real editor later means replacing this component, not its callers.
 */
const BLOCKS = [
  { value: 'p', label: 'Paragraph' },
  { value: 'h3', label: 'Heading' },
];

/**
 * A short palette rather than a full colour wheel.
 *
 * The live control is Kendo's colour picker, which opens a full spectrum. In a
 * comment thread that is more freedom than anyone needs and a reliable way to
 * produce unreadable text on a white background — so this offers the system's
 * own ink colours, all of which are legible here.
 */
const TEXT_COLORS = [
  { value: 'var(--vy-grey-900)', label: 'Default' },
  { value: 'var(--vy-red-600)', label: 'Red' },
  { value: 'var(--vy-accent-warning)', label: 'Amber' },
  { value: 'var(--vy-accent-positive)', label: 'Green' },
  { value: 'var(--vy-blue-600)', label: 'Blue' },
];
const HIGHLIGHTS = [
  { value: 'transparent', label: 'None' },
  { value: 'var(--vy-status-open-bg)', label: 'Amber' },
  { value: 'var(--vy-status-done-bg)', label: 'Green' },
  { value: 'var(--vy-blue-50)', label: 'Blue' },
];

type Cmd = {
  cmd: string;
  label: string;
  /** Toolbar glyph. Drawn rather than lettered so B/I/U do not depend on the UI font. */
  path: string;
  /** Undo and redo have no on/off state to reflect. */
  stateless?: boolean;
};

/* Grouped and ordered as the live toolbar is. */
const UNDO_GROUP: Cmd[] = [
  { cmd: 'undo', label: 'Undo', stateless: true, path: 'M4 9h8a4 4 0 0 1 0 8H8M4 9l3-3M4 9l3 3' },
  { cmd: 'redo', label: 'Redo', stateless: true, path: 'M16 9H8a4 4 0 0 0 0 8h4M16 9l-3-3M16 9l-3 3' },
];
const MARK_GROUP: Cmd[] = [
  { cmd: 'bold', label: 'Bold', path: 'M6 4h5a3 3 0 0 1 0 6H6zM6 10h6a3 3 0 0 1 0 6H6z' },
  { cmd: 'italic', label: 'Italic', path: 'M12 4H8M12 16H8M11 4 9 16' },
  { cmd: 'underline', label: 'Underline', path: 'M6 3v6a4 4 0 0 0 8 0V3M5 17h10' },
  { cmd: 'strikeThrough', label: 'Strikethrough', path: 'M4 10h12M7 6a3 3 0 0 1 6 0M13 13a3 3 0 0 1-6 0' },
];
const LIST_GROUP: Cmd[] = [
  { cmd: 'insertUnorderedList', label: 'Insert unordered list', path: 'M7 5h9M7 10h9M7 15h9M4 5h.01M4 10h.01M4 15h.01' },
  { cmd: 'insertOrderedList', label: 'Insert ordered list', path: 'M8 5h8M8 10h8M8 15h8M4 4v3M3.5 12h1.5l-1.5 2h1.5' },
];
const INDENT_GROUP: Cmd[] = [
  { cmd: 'outdent', label: 'Outdent', path: 'M8 5h8M8 10h8M8 15h8M5 8 2.5 10 5 12' },
  { cmd: 'indent', label: 'Indent', path: 'M8 5h8M8 10h8M8 15h8M2.5 8 5 10 2.5 12' },
];
const COMMANDS: Cmd[][] = [UNDO_GROUP, MARK_GROUP, LIST_GROUP, INDENT_GROUP];

export function RichText({ value, onChange, placeholder, ariaLabel }: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [block, setBlock] = useState('p');

  /* Which formats apply where the cursor is, so the toolbar reflects the text
     rather than only issuing commands at it. */
  const readState = useCallback(() => {
    const next: Record<string, boolean> = {};
    for (const group of COMMANDS) {
      for (const c of group) {
        if (c.stateless) continue;
        try { next[c.cmd] = document.queryCommandState(c.cmd); } catch { /* unsupported */ }
      }
    }
    setActive(next);
    try {
      const b = document.queryCommandValue('formatBlock').toLowerCase();
      setBlock(BLOCKS.some(x => x.value === b) ? b : 'p');
    } catch { /* unsupported */ }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML !== value) el.innerHTML = value;
  }, [value]);

  const run = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    onChange(ref.current?.innerHTML ?? '');
    readState();
  };

  const empty = !value || value === '<br>' || value === '<p></p>';

  return (
    <div className="vy-richtext">
      <div className="vy-rt-toolbar" role="toolbar" aria-label={`${ariaLabel} formatting`}>
        <Group cmds={UNDO_GROUP} active={active} run={run} />
        <Group cmds={MARK_GROUP} active={active} run={run} />
        <Group cmds={LIST_GROUP} active={active} run={run} />

        {/* Colour and highlight. The live control is a full spectrum picker;
            these are the system's own ink colours, every one of which is
            legible on white — a comment thread is not the place to be able to
            set yellow text. */}
        <div className="vy-rt-group">
          <Swatches label="Color" swatches={TEXT_COLORS}
                    onPick={c => run('foreColor', c)}
                    path="M6 15 10 5l4 10M7.5 12h5" />
          <Swatches label="Background color" swatches={HIGHLIGHTS}
                    onPick={c => run('hiliteColor', c)}
                    path="M4 16h12M6 13l6-8 3 3-6 8z" />
        </div>

        <Group cmds={INDENT_GROUP} active={active} run={run} />

        {/* "Format" on the live toolbar, and it sits AFTER indent rather than
            leading — the position is theirs. */}
        <div className="vy-rt-group">
          <label className="vy-rt-block">
            <span className="vy-sr-only">Format</span>
            <select value={block} onChange={e => run('formatBlock', `<${e.target.value}>`)}>
              {BLOCKS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </label>
          {/* The one command that undoes a paste from Word. */}
          <button type="button" className="vy-rt-btn"
                  aria-label="Clean formatting" title="Clean formatting"
                  onMouseDown={e => { e.preventDefault(); run('removeFormat'); }}>
            <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor"
                 strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M7 4h9M11 4 8 16M4 16h6M13 11l4 4M17 11l-4 4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="vy-rt-body">
        <div
          ref={ref}
          className="vy-rt-input"
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label={ariaLabel}
          onInput={e => onChange((e.target as HTMLDivElement).innerHTML)}
          onKeyUp={readState}
          onMouseUp={readState}
          onFocus={readState}
        />
        {/* A real element rather than a CSS ::before, so the placeholder can be
            hidden from assistive tech — the field already has its own label. */}
        {empty && placeholder && (
          <span className="vy-rt-placeholder" aria-hidden>{placeholder}</span>
        )}
      </div>
    </div>
  );
}

/** One group of toggle buttons. */
function Group({ cmds, active, run }: {
  cmds: Cmd[]; active: Record<string, boolean>; run: (cmd: string, arg?: string) => void;
}) {
  return (
    <div className="vy-rt-group">
      {cmds.map(c => (
        <button key={c.cmd} type="button" className="vy-rt-btn"
                aria-label={c.label} title={c.label}
                aria-pressed={c.stateless ? undefined : Boolean(active[c.cmd])}
                /* mousedown, not click: click fires after the caret has already
                   left the text, so the command lands nowhere. */
                onMouseDown={e => { e.preventDefault(); run(c.cmd); }}>
          <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor"
               strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d={c.path} />
          </svg>
        </button>
      ))}
    </div>
  );
}

/**
 * A colour button that opens its swatches on click.
 *
 * Native `<details>` rather than a popover component: it closes on Escape and
 * on outside click for free, and the whole control is four colours.
 */
function Swatches({ label, swatches, onPick, path }: {
  label: string;
  swatches: { value: string; label: string }[];
  onPick: (c: string) => void;
  path: string;
}) {
  return (
    <details className="vy-rt-swatches">
      <summary className="vy-rt-btn" aria-label={label} title={label}>
        <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor"
             strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d={path} />
        </svg>
      </summary>
      <div className="vy-rt-swatch-list">
        {swatches.map(sw => (
          <button key={sw.label} type="button" className="vy-rt-swatch"
                  title={sw.label} aria-label={`${label}: ${sw.label}`}
                  style={{ background: sw.value } as React.CSSProperties}
                  onMouseDown={e => { e.preventDefault(); onPick(sw.value); }} />
        ))}
      </div>
    </details>
  );
}
