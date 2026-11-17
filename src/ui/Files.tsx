import type { ReactNode } from 'react';

/**
 * The BA's file row, 16 Nov 2026, and the chip that labels it.
 *
 * Her row is 34px with four states — view, edit, uploading, rejected — and
 * the chip is what makes a list of files scannable: at 30×20 and 9px 700 it
 * says PDF or XLS before the name has been read at all.
 */

const KNOWN = ['pdf', 'xls', 'doc', 'img'] as const;
type Kind = (typeof KNOWN)[number] | 'other';

/* Her five: "PDF red, XLS green, DOC blue, IMG teal, ZIP and others gray".
   The mapping is on EXTENSION rather than on MIME type, because the only
   thing a file row ever has is a name. */
const BY_EXT: Record<string, Kind> = {
  pdf: 'pdf',
  xls: 'xls', xlsx: 'xls', csv: 'xls',
  doc: 'doc', docx: 'doc', rtf: 'doc', txt: 'doc',
  png: 'img', jpg: 'img', jpeg: 'img', gif: 'img', webp: 'img', svg: 'img', heic: 'img',
};

export function fileKind(name: string): Kind {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return BY_EXT[ext] ?? 'other';
}

/** The three-letter badge. Its own export because grids want it without a row. */
export function FileTypeChip({ name }: { name: string }) {
  const kind = fileKind(name);
  const ext = name.split('.').pop()?.toUpperCase() ?? '';
  /* The LABEL is the real extension, trimmed to three; the COLOUR is the
     family. So a .docx reads DOC and a .heic reads HEI, both in their own
     colour, and an unknown type still says what it is rather than "FILE". */
  return (
    <span className="vy-file-chip" data-kind={kind}>{ext.slice(0, 3) || '—'}</span>
  );
}

export function FileRow({
  name, meta, state = 'view', progress, reason, action,
}: {
  name: string;
  /** "ver. 1 · 2.4 MB" — her format, built by the caller. */
  meta?: ReactNode;
  /**
   * `view` is a link that opens the preview; `edit` is the same row with More
   * instead of Download; `added` is an edit row not yet saved, which she
   * fills with the information tint; `uploading` shows the bar; `rejected`
   * replaces the whole row with the reason.
   */
  state?: 'view' | 'edit' | 'added' | 'uploading' | 'rejected';
  /** 0–100, for `uploading`. */
  progress?: number;
  /** Why it was refused, for `rejected`. */
  reason?: ReactNode;
  /** The trailing control — a download button, a More menu. */
  action?: ReactNode;
}) {
  if (state === 'rejected') {
    return (
      <div className="vy-file-row" data-state="rejected">
        {/* The octagon, the same shape an error toast uses, for the same
            reason: the tint is not allowed to carry this alone. */}
        <svg className="vy-file-mark" viewBox="0 0 16 16" width="16" height="16" aria-hidden
             fill="none" stroke="currentColor" strokeWidth="1.6"
             strokeLinecap="round" strokeLinejoin="round">
          <path d="M5.4 1.4h5.2l3.9 3.9v5.4l-3.9 3.9H5.4L1.5 10.7V5.3z" />
          <path d="M8 4.6v4.1M8 11.3h.01" />
        </svg>
        <span className="vy-file-name vy-file-name--plain">{name}</span>
        <span className="vy-file-meta">{reason}</span>
      </div>
    );
  }
  return (
    <div className="vy-file-row" data-state={state}>
      <FileTypeChip name={name} />
      {state === 'view'
        /* A link, because her note is explicit: "the name is a link that
           opens the preview; no eye icon". A separate eye button would be a
           second control for the thing the name already does. */
        ? <a className="vy-file-name" href="#preview" onClick={e => e.preventDefault()}>{name}</a>
        : <span className="vy-file-name vy-file-name--plain">{name}</span>}
      {state === 'uploading'
        ? (
          <span className="vy-file-progress">
            <span className="vy-file-bar"><span style={{ inlineSize: `${progress ?? 0}%` }} /></span>
            <span className="vy-file-meta">{progress ?? 0}%</span>
          </span>
        )
        : meta && <span className="vy-file-meta">{meta}</span>}
      {action && <span className="vy-file-action">{action}</span>}
    </div>
  );
}

/**
 * Her **Image (view)** and **Image (empty, edit)** in one component, because
 * they are one slot in two states and a record form switches between them.
 *
 * Her sizes: as tall as the record header, max 220 × 132. The empty state is
 * the same box with a dashed border, which is what keeps the layout from
 * jumping when an image arrives.
 */
export function ImageBox({ src, alt, onOpen, types, hint }: {
  src?: string;
  alt?: string;
  /** Click opens the image popup — her note on the view state. */
  onOpen?: () => void;
  /** "PNG, JPG · max 5 MB" — shown only when empty. */
  types?: ReactNode;
  hint?: ReactNode;
}) {
  if (!src) {
    return (
      <div className="vy-image-box vy-image-box--empty">
        <p className="vy-image-prompt">
          {hint ?? 'Drop an image or'} <button type="button" className="vy-image-browse">Browse</button>
        </p>
        {types && <p className="vy-image-types">{types}</p>}
      </div>
    );
  }
  return (
    <button type="button" className="vy-image-box" onClick={onOpen}>
      <img src={src} alt={alt ?? ''} />
    </button>
  );
}
