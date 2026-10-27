import type { ReactNode } from 'react';
import { Loader as KendoLoader } from '@progress/kendo-react-indicators';
import { RocketJourney } from './RocketJourney';

/**
 * The loading indicator — KendoReact's, not ours.
 *
 * WHY THIS FILE IS A THIN WRAPPER AND NOT A DESIGN. The customer's live bundle
 * already ships `k-loader`, with `k-loader-sm/md/lg`, the eleven theme colours
 * and all three animation types (`pulsing` 2 segments, `infinite-spinner` 3,
 * `converging-spinner` 4). The indicator was never an open question — we simply
 * did not have `@progress/kendo-react-indicators` installed, so the one thing
 * the product already uses was the one thing we could not draw.
 *
 * KENDO'S TYPE NAMES ARE KEPT VERBATIM. `Button` maps MD3's variant ladder onto
 * Kendo's fill modes because MD3 has a ladder worth keeping; a loader has no
 * such vocabulary to reconcile, so inventing `dots` / `spinner` / `ring` here
 * would be a second set of names for one set of things. The names are Kendo's.
 *
 * WHICH TYPE TO USE, and it is a real distinction rather than taste:
 *
 *   pulsing             Three dots, no rotation. Inside a button or a cell —
 *                       it holds still, so the control it sits in does not
 *                       appear to spin.
 *   converging-spinner  Rotating. For the whole page or a blocking overlay,
 *                       where rotation is the point: something is working and
 *                       there is nothing else to look at.
 *   infinite-spinner    Also rotating. Not used; kept reachable so a third
 *                       case does not have to reach past this file.
 */
type LoaderType = 'pulsing' | 'infinite-spinner' | 'converging-spinner';

export function Loader({
  size = 'medium', type = 'pulsing', themeColor = 'primary',
  label = 'Loading', className,
}: {
  size?: 'small' | 'medium' | 'large';
  type?: LoaderType;
  themeColor?: 'base' | 'primary' | 'secondary' | 'tertiary';
  /** Goes to `aria-label`. Say what is loading, not that something is. */
  label?: string;
  className?: string;
}) {
  return (
    <KendoLoader size={size} type={type} themeColor={themeColor}
                 ariaLabel={label} className={className} />
  );
}

/**
 * Content that stays on screen while it is being replaced.
 *
 * THE RULE THIS EXISTS FOR. Once a user has seen rows, taking them away to show
 * a skeleton is a step backwards — they read data, and now they read less than
 * they did. So a second page, a server-side filter or a re-price dims what is
 * there and puts the indicator over it; a FIRST load, where there is nothing to
 * keep, gets a skeleton instead. Two different states, two different answers.
 *
 * `aria-busy` on the wrapper and `aria-hidden` on the stale content: a screen
 * reader should not read numbers that are being withdrawn. The live region is
 * the indicator's own label.
 */
export function BusyOverlay({ busy, label, children, blocking = false }: {
  busy: boolean;
  /** What is happening, in words — this is read aloud and shown. */
  label: string;
  children: ReactNode;
  /** True when the user must not interact with what is underneath. */
  blocking?: boolean;
}) {
  return (
    <div className="vy-busy" data-busy={busy || undefined}>
      <div className="vy-busy-content" aria-hidden={busy || undefined}
           /* `inert` would be the right word and React 19 passes it through,
              but it is only honoured once the overlay is actually up. */
           inert={busy && blocking ? true : undefined}>
        {children}
      </div>
      {busy && (
        <div className="vy-busy-veil" role="status" aria-live="polite">
          <Loader type="converging-spinner" size="large" label={label} />
          <p className="vy-busy-label">{label}</p>
        </div>
      )}
    </div>
  );
}

/**
 * The whole window, for the one wait where nothing else can be shown: the app
 * booting after sign-in, when it is fetching the navigation tree and the
 * permission set and therefore does not yet know what to draw a skeleton OF.
 *
 * It carries the rocket rather than a bare spinner because this is the first
 * screen after a password, and a blank page with a spinner on it is
 * indistinguishable from a page that has failed.
 */
export function BootScreen({ step = 0, label = 'Loading Voyager IQ' }: {
  /** How many boot stages are done — lights that much of the route. */
  step?: number;
  label?: string;
}) {
  return (
    <div className="vy-boot" role="status" aria-live="polite" aria-busy="true">
      {/* `key` on the label, so a stage change replaces the node rather than
          editing its text. A live region announces replaced content reliably;
          a mutated text node is where screen readers disagree. */}
      {/* ONE INDICATOR, NOT TWO. The `V` tile and the Kendo Loader both used to
          stand here; the rocket replaces both. The tile was the mark, and the
          illustration carries the brand better at this size than a 40px square
          of it does — and a spinner beside an animating illustration is two
          things saying the same thing, which is how a loading screen starts
          looking busy rather than working.

          Kendo's Loader keeps every other wait in the product. This is the one
          screen with nothing else on it, which is the only place an
          illustration earns its room. */}
      <RocketJourney step={step} />
      <p className="vy-busy-label" key={label}>{label}</p>
    </div>
  );
}
