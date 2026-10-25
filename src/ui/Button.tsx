import { useCallback, type ButtonHTMLAttributes, type ReactNode, type Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { Button as KendoButton } from '@progress/kendo-react-buttons';
import { Loader } from './Loader';

type Variant = 'filled' | 'tonal' | 'outlined' | 'text' | 'danger';
type Size = 'xs' | 'sm' | 'md';

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
/* Kendo's own size names. `xs` is the row rung the standard asks for at 26px,
   configured in kendo-subset.scss out of `--vy-control-row`; `small` and
   `medium` are this product's dense and standard. The names differ on one rung
   only because Kendo spells it `xs` and not `xsmall`. */
const KSIZE: Record<Size, 'xs' | 'small' | 'medium'> = {
  xs: 'xs', sm: 'small', md: 'medium',
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
  variant = 'outlined', size = 'md', icon, busy, disabled, asChild, className = '', children, ref, ...rest
}: {
  variant?: Variant; size?: Size; icon?: ReactNode; asChild?: boolean; children?: ReactNode;
  /**
   * The action this button started is still running.
   *
   * Kendo's Button has no loading state of its own — `disabled` is the only
   * related prop it takes — so this composes the two things the state actually
   * needs: a Kendo `Loader` in the ICON slot, and `disabled`.
   *
   * DISABLING IS THE LOAD-BEARING HALF. The indicator tells the user something
   * is happening; the disable is what stops a second click spending a second
   * marketplace request. A spinner without it is decoration over a bug.
   *
   * The loader replaces the icon rather than sitting beside the label, so the
   * button keeps its width and nothing in the toolbar moves when the action
   * starts. `pulsing` rather than a spinner: the dots hold still, so the
   * control does not appear to rotate.
   */
  busy?: boolean;
  /** Pulled out of the spread deliberately — see the note above. */
  ref?: Ref<HTMLButtonElement>;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'ref'>) {
  /**
   * Hands whoever asked for our ref the DOM node, not Kendo's handle.
   *
   * Radix positions a popover against the node it is given; given
   * `{ element, selected }` it measures an object and never settles.
   */
  /* An icon with nothing beside it. Kendo has a class for exactly this and it
     carries the squareness, so the test is here rather than at each call site. */
  const iconOnly = icon != null && children == null;
  const shown = busy
    ? <span className="vy-btn-busy"><Loader size="small" type="pulsing"
             themeColor={variant === 'filled' || variant === 'danger' ? 'base' : 'primary'}
             label="Working" /></span>
    : icon;

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
            aria-disabled={disabled || undefined}
            {...rest}>
        {children}
      </Slot>
    );
  }

  return (
    <KendoButton
      ref={forwardToDom}
      /* `disabled` IS DESTRUCTURED OUT OF `rest` ON PURPOSE. Written as
         `disabled={busy || rest.disabled}` above the spread, `{...rest}` put
         its own `disabled={false}` back on top and the busy button stayed
         clickable — measured on Get Prices, which is the one button in this
         product where a second click costs money. Props are applied in source
         order, and the spread is the last word on anything still inside it. */
      disabled={busy || disabled}
      aria-busy={busy || undefined}
      themeColor={THEME[variant]}
      fillMode={FILL[variant]}
      size={KSIZE[size]}
      rounded="medium"
      /* ONLY the tonal class, and only for tonal. `components.css` loads after
         the Kendo subset and every `.vy-btn--*` rule there carries a full
         background at the same specificity as Kendo's, so passing them through
         would silently win and we would be running two button systems at once:
         Kendo's box with our paint.

         `k-icon-button` is Kendo's, and it is what makes an icon-only button a
         SQUARE: the class gives the box the same padding on both axes and
         `k-button-icon` floors the glyph at one line box, so width and height
         arrive at the same number out of the size scale. We add it because
         KendoReact only adds it for an icon passed through its own `icon` /
         `svgIcon` props, which take a Kendo icon name or an SVG descriptor —
         ours are arbitrary nodes and stay children. */
      className={[iconOnly && 'k-icon-button', variant === 'tonal' && 'vy-btn--tonal', className]
        .filter(Boolean).join(' ')}
      {...rest}
    >
      {/* Kendo takes an icon NAME or an SVG descriptor, not arbitrary nodes.
          Ours are arbitrary nodes, so they stay children — where they rendered
          before, in the same order. The class is Kendo's only when the icon is
          the whole button, because that is the case whose geometry Kendo owns;
          beside a label it is a 0-size inline-flex wrapper either way. */}
      {shown && (
        <span className={iconOnly ? 'k-button-icon' : 'vy-btn-icon'}
              /* Not hidden while busy: the Loader carries the only
                 machine-readable statement that the action is running. */
              aria-hidden={busy ? undefined : true}>{shown}</span>
      )}
      {children}
    </KendoButton>
  );
}
