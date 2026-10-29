import type { ReactNode } from 'react';
import { Loader as KendoLoader } from '@progress/kendo-react-indicators';
import { RocketLaunch } from './RocketLaunch';
import { BOOT_STAGES } from './bootStages';

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
 *
 * ONE LINE OF TEXT, NOT FIVE — the customer's redesign of 29 Oct, and she is
 * right. This screen used to name each stage as it finished: five labels that
 * go past in under a second, which is five things nobody reads and a line of
 * text that flickers. The five-segment bar carries the same information
 * without asking the eye to read it, and the sentence changes only when it has
 * something new to say: that it is taking a while, or that it is done.
 */
export function BootScreen({ step = 0, label = LAUNCHING, exiting = false }: {
  /** How many boot stages are done. Fills that much of the bar. */
  step?: number;
  label?: string;
  /** The last 0.4s: the craft leaves the top of the frame. */
  exiting?: boolean;
}) {
  return (
    <div className="vy-boot" data-exiting={exiting || undefined}
         role="status" aria-live="polite" aria-busy="true">
      {/* ONE INDICATOR, NOT TWO. The `V` tile and the Kendo Loader both used to
          stand here; the rocket replaces both. A spinner beside an animating
          illustration is two things saying the same thing, which is how a
          loading screen starts looking busy rather than working.

          Kendo's Loader keeps every other wait in the product. This is the one
          screen with nothing else on it, which is the only place an
          illustration earns its room. */}
      <RocketLaunch step={step} />
      {/* `key` on the label, so a change replaces the node rather than editing
          its text. A live region announces replaced content reliably; a
          mutated text node is where screen readers disagree. */}
      <p className="vy-busy-label" key={label}>{label}</p>
      {/* The bar is the progress; the sentence above it is the mood. Hidden
          from the reader who is being read to, because the label already says
          what this says. */}
      <div className="vy-boot-bar" aria-hidden="true">
        {BOOT_STAGES.map((s, i) => (
          <span key={s.key} data-done={i < step || undefined} data-now={i === step || undefined} />
        ))}
      </div>
    </div>
  );
}

export const LAUNCHING = 'Launching your mission…';
export const STILL_CLIMBING = 'Still climbing…';
export const WELCOME = 'Welcome aboard';
