import { useCallback, type ButtonHTMLAttributes, type ReactNode, type Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { Button as KendoButton } from '@progress/kendo-react-buttons';

type Variant = 'filled' | 'tonal' | 'outlined' | 'text' | 'danger';
type Size = 'sm' | 'md';

/**
 * Button — our API, KendoReact underneath.
 *
 * MD3's variant ladder — filled / tonal / outlined / text — because it encodes
 * emphasis rather than colour. One primary action per view gets `filled`;
 * everything else steps down. `danger` is the one addition, since an ERP
 * destroys records and Material folds that into `filled` with an error colour,
 * which reads as "the main thing to do here".
 *
 * ---------------------------------------------------------------------------
 * PHASE 1, AND WHY IT WAS BLOCKED.
 *
 * The first attempt made every page render nothing, with "Maximum update depth
 * exceeded" in dev AND in a production build. It was written up as "KendoReact
 * 16's Button loops under React 19" and the phase was abandoned.
 *
 * THAT DIAGNOSIS WAS WRONG, and the evidence was on screen the whole time:
 * Kendo Buttons were rendering happily in this app — twelve of them, inside the
 * Grid's own filter cells, with no errors. The fault was in the adapter, and it
 * was one prop.
 *
 * `{...rest}` carried a **`ref`**. In React 19 `ref` is an ordinary prop, so
 * when `Popover.Trigger asChild` clones this button it injects its ref along
 * with `data-radix-popper-*`, and the spread handed all of it to Kendo.
 *
 * Kendo's Button does not forward a DOM node: its `useImperativeHandle` exposes
 * `{ element, selected }`. Radix took that object as the element to position
 * against and re-measured it forever.
 *
 * So the fix is not to drop the ref — that would break the popovers needing it.
 * It is to UNWRAP Kendo's handle to the node underneath, because a DOM node is
 * what this component's contract promises anyone who asks for its ref. Kendo's
 * handle is an implementation detail and stops here.
 *
 * Found by bisection: minimal props rendered, `{...rest}` looped, `{...rest}`
 * minus `ref` rendered.
 *
 * THE MAPPING, and where it is not exact:
 *
 *   filled    themeColor primary, fillMode solid
 *   danger    themeColor error,   fillMode solid
 *   outlined  themeColor base,    fillMode outline
 *   text      themeColor primary, fillMode flat
 *   tonal     themeColor primary, fillMode SOLID + our own class
 *
 * `tonal` is the one that does not map. MD3's tonal is a filled button at low
 * emphasis — a tinted surface with dark text — and Kendo's ladder has no such
 * rung between `solid` and transparent `flat`. Rather than promote it to
 * Kendo's own `solid` primary (which would make seven buttons compete with the
 * page's primary action) or demote it to `text` (losing the surface that
 * distinguishes it), it takes Kendo's solid STRUCTURE and our tint. That is the
 * one place this file paints over Kendo, and it is deliberate.
 * ---------------------------------------------------------------------------
 */
const THEME: Record<Variant, 'primary' | 'error' | 'base'> = {
  filled: 'primary', danger: 'error', outlined: 'base', text: 'primary', tonal: 'primary',
};
const FILL: Record<Variant, 'solid' | 'outline' | 'flat'> = {
  filled: 'solid', danger: 'solid', outlined: 'outline', text: 'flat',
  /* SOLID, not flat, and the reason is Kendo's stylesheet rather than taste.
     `.k-button-flat` sets `background: initial !important`, which no amount of
     specificity beats — the tint simply vanished while the text colour from the
     same rule applied, which is what gave it away. `solid` sets its background
     normally, so our tint lands with an ordinary override.
     It is also the better mapping: MD3's tonal IS a filled button at low
     emphasis, not a flat one. */
  tonal: 'solid',
};

export function Button({
  variant = 'outlined', size = 'md', icon, asChild, className = '', children, ref, ...rest
}: {
  variant?: Variant; size?: Size; icon?: ReactNode; asChild?: boolean; children?: ReactNode;
  /** Pulled out of the spread deliberately — see the note above. */
  ref?: Ref<HTMLButtonElement>;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'ref'>) {
  /**
   * Hands whoever asked for our ref the DOM node, not Kendo's handle.
   *
   * Radix positions a popover against the node it is given; given
   * `{ element, selected }` it measures an object and never settles.
   */
  const forwardToDom = useCallback((handle: { element?: HTMLElement | null } | null) => {
    const node = (handle?.element ?? null) as HTMLButtonElement | null;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as { current: HTMLButtonElement | null }).current = node;
  }, [ref]);

  /* Kept for the case Kendo cannot express: rendering the styling onto a child
     element — a router Link — so navigation stays a real anchor. */
  if (asChild) {
    return (
      <Slot className={`vy-btn vy-btn--${variant} vy-btn--${size} ${className}`.trim()}
            data-state-layer
            data-on-dark={variant === 'filled' || variant === 'danger' ? '' : undefined}
            ref={ref}
            {...rest}>
        {children}
      </Slot>
    );
  }

  return (
    <KendoButton
      ref={forwardToDom}
      themeColor={THEME[variant]}
      fillMode={FILL[variant]}
      size={size === 'sm' ? 'small' : 'medium'}
      rounded="medium"
      /* ONLY the tonal class, and only for tonal. `components.css` loads after
         the Kendo subset and every `.vy-btn--*` rule there carries a full
         background at the same specificity as Kendo's, so passing them through
         would silently win and we would be running two button systems at once:
         Kendo's box with our paint. */
      className={[variant === 'tonal' && 'vy-btn--tonal', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {/* Kendo takes an icon NAME or an SVG descriptor, not arbitrary nodes.
          Ours are arbitrary nodes, so they stay children — where they rendered
          before, in the same order. */}
      {icon && <span className="vy-btn-icon" aria-hidden>{icon}</span>}
      {children}
    </KendoButton>
  );
}
