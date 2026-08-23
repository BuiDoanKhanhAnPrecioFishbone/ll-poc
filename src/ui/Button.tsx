import { Slot } from '@radix-ui/react-slot';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'filled' | 'tonal' | 'outlined' | 'text' | 'danger';
type Size = 'sm' | 'md';

/**
 * Button.
 *
 * MD3's variant ladder — filled / tonal / outlined / text — because it encodes
 * emphasis rather than colour. One primary action per view gets `filled`;
 * everything else steps down. `danger` is the one addition, since an ERP
 * destroys records and Material folds that into `filled` with an error colour,
 * which reads as "the main thing to do here".
 *
 * `asChild` renders the styling onto a child element (a router Link, say)
 * instead of a <button>, so navigation stays a real anchor.
 */
export function Button({
  variant = 'outlined', size = 'md', icon, asChild, className = '', children, ...rest
}: {
  variant?: Variant; size?: Size; icon?: ReactNode; asChild?: boolean; children?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={`vy-btn vy-btn--${variant} vy-btn--${size} ${className}`.trim()}
      data-state-layer
      data-on-dark={variant === 'filled' || variant === 'danger' ? '' : undefined}
      {...rest}
    >
      {icon && <span className="vy-btn-icon" aria-hidden>{icon}</span>}
      {children}
    </Comp>
  );
}
