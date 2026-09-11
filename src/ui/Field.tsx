import type { InputHTMLAttributes, Ref, TextareaHTMLAttributes } from 'react';

/* `ref` is declared rather than inherited: React 19 passes it to a function
   component as an ordinary prop, but `InputHTMLAttributes` does not carry it,
   so TypeScript rejects it. Login needs one to put the cursor in the first
   field and to send it back there when a submit finds the field empty. */
export function TextField({ label, hint, className = '', ...rest }: {
  label?: string; hint?: string; ref?: Ref<HTMLInputElement>;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`vy-field-control ${className}`.trim()}>
      {label && <span className="vy-field-label">{label}</span>}
      <input className="vy-input" {...rest} />
      {hint && <span className="vy-field-hint">{hint}</span>}
    </label>
  );
}

export function TextArea({ label, hint, className = '', ...rest }: {
  label?: string; hint?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={`vy-field-control ${className}`.trim()}>
      {label && <span className="vy-field-label">{label}</span>}
      <textarea className="vy-input vy-textarea" {...rest} />
      {hint && <span className="vy-field-hint">{hint}</span>}
    </label>
  );
}

/** Search input with a leading icon. Its own component because search is the
 *  single most-used control on every list screen and must look identical on
 *  all of them. */
export function SearchField({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`vy-search-field ${className}`.trim()}>
      <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor"
           strokeWidth="1.8" aria-hidden>
        <circle cx="9" cy="9" r="5.5" /><path d="m13.5 13.5 3 3" strokeLinecap="round" />
      </svg>
      <input className="vy-input" type="search" {...rest} />
    </div>
  );
}
