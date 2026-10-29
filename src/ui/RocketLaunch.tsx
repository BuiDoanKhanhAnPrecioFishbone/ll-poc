import { useEffect, useId, useState } from 'react';

/**
 * The rocket, in the three states a screen can be in.
 *
 * REPLACES THE HORIZONTAL JOURNEY — the customer's own redesign of 29 Oct, and
 * An's answer when asked whether to keep both: no. Two pictures for one moment
 * is two things a reader has to learn, and hers is the better metaphor for a
 * wait: the craft climbs, the planet falls away beneath it, streaks run down
 * past it, so the climb reads as progress without a number on it. The journey
 * between two planets said "a distance is closing", which is the same idea
 * told sideways and needed five stations drawn to tell it.
 *
 *   launching   lift-off and climb. The planet sinks a notch per boot stage.
 *   error       back on the pad, tilted, cracked, one fin off, smoking.
 *   building    whole on the pad, an arm welding it, the design doc ticking
 *               off beside it. Nothing is broken, so nothing is smoking.
 *
 * THE ART IS HERS, transcribed from her file rather than redrawn. The motion
 * is CSS, as it is in her prototype: this illustration owns pixels and no
 * state, so it can stop in a background tab and nothing is lost.
 *
 * WHY THE SVG IS INLINE. Two rules this project already follows. An `<img src>`
 * is a second request on the one screen whose job is to cover the first one;
 * and an `<img>` is its own document, where `var(--vy-brand)` resolves against
 * nothing and the token layer stops reaching the art.
 *
 * WHY THE ids ARE GENERATED. The masks and the grid pattern carry fixed ids in
 * the delivered file. Two instances on one page — the boot screen over a route
 * that is itself failing — would both define them, and the second would clip
 * against the first. `useId` ends that by construction.
 */
export type LaunchState = 'launching' | 'error' | 'building';

/** How far the planet has fallen away, per boot stage, in viewBox units. */
const SINK_PER_STAGE = 13;
const SINK_BASE = 14;
/** Where the craft sits on the pad, and where it settles once it is climbing. */
const PAD_Y = 112, CRUISE_Y = 70;

export function RocketLaunch({ step = 0, state = 'launching', className }: {
  /** Boot stages completed. Only the planet reads it — the climb is not a bar. */
  step?: number;
  state?: LaunchState;
  className?: string;
}) {
  const uid = useId().replace(/:/g, '');
  /**
   * LIFT-OFF NEEDS TWO FRAMES. Mounted straight at cruising height the craft
   * is simply *there* — the transition has nothing to transition from, and the
   * one moment this drawing exists to show never happens. So it mounts on the
   * pad and leaves on the next tick.
   *
   * A timeout rather than `requestAnimationFrame`, which the review found
   * fires zero times in a hidden page: a boot screen that opens in a
   * background tab would be a rocket parked on a pad for ever.
   */
  const [lifted, setLifted] = useState(false);
  useEffect(() => {
    if (state !== 'launching') return;
    const t = setTimeout(() => setLifted(true), 20);
    return () => clearTimeout(t);
  }, [state]);

  const flying = state === 'launching' && lifted;
  /* On the pad for both still states: a failure and a build both happen on the
     ground, and a planet that has sunk under a rocket standing on it is a
     planet the rocket is no longer on. */
  const sink = flying ? SINK_BASE + step * SINK_PER_STAGE : 0;

  return (
    <svg className={['vy-rocket-launch', className].filter(Boolean).join(' ')}
         data-state={flying ? 'launching' : state} viewBox="0 0 240 180"
         aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`fade-g-${uid}`} x1="0" y1="0" x2="0" y2="1"
                        gradientUnits="objectBoundingBox">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".12" stopColor="#fff" />
          <stop offset=".72" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        {/* The scene fades out at the top and bottom edges rather than being
            cut off by them, so the streaks arrive and leave instead of
            appearing. */}
        <mask id={`fade-${uid}`} maskUnits="userSpaceOnUse" x="-40" y="0" width="320" height="180">
          <rect x="-40" y="0" width="320" height="180" fill={`url(#fade-g-${uid})`} />
        </mask>
        <pattern id={`grid-${uid}`} width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M4 0H0V4" fill="none" stroke="var(--vy-rocket-trim)" strokeWidth=".5" />
        </pattern>
      </defs>

      <g fill="var(--vy-rocket-detail)">
        <path d={STAR} transform="translate(42 34) scale(1.1)" />
        <path d={STAR} transform="translate(196 26) scale(.8)" />
        <path d={STAR} transform="translate(186 98) scale(.9)" />
        <path d={STAR} transform="translate(58 112) scale(.7)" />
        <circle cx="160" cy="58" r="1.2" /><circle cx="78" cy="68" r="1" />
        <circle cx="214" cy="140" r="1" /><circle cx="24" cy="150" r="1.2" />
      </g>

      {/* THE WORLD MOVES DOWN, so the rocket reads as moving up. Nothing about
          the craft itself says "climbing" — a rocket drawn nose-up is a rocket
          drawn nose-up whether it is flying or parked. */}
      <g mask={`url(#fade-${uid})`}>
        <g className="vy-rl-streaks">
          <line x1="70" y1="0" x2="70" y2="12" style={{ animationDuration: '1.05s' }} />
          <line x1="92" y1="0" x2="92" y2="18" style={{ animationDuration: '.8s', animationDelay: '-.4s' }} />
          <line x1="150" y1="0" x2="150" y2="14" style={{ animationDuration: '.95s', animationDelay: '-.2s' }} />
          <line x1="172" y1="0" x2="172" y2="10" style={{ animationDuration: '1.2s', animationDelay: '-.7s' }} />
          <line x1="48" y1="0" x2="48" y2="10" style={{ animationDuration: '1.3s', animationDelay: '-.9s' }} />
          <line x1="196" y1="0" x2="196" y2="16" style={{ animationDuration: '.9s', animationDelay: '-.5s' }} />
        </g>
      </g>

      <g mask={`url(#fade-${uid})`}>
        <g className="vy-rl-planet" transform={`translate(0 ${sink})`}>
          <circle cx="120" cy="330" r="190" fill="var(--vy-rocket-ground)" />
          <path d="M-70 330a190 190 0 0 1 380 0a190 175 0 0 0-380 0z" fill="var(--vy-rocket-ground-sh)" />
          <ellipse cx="70" cy="152" rx="9" ry="2.6" fill="var(--vy-rocket-detail)" />
          <ellipse cx="176" cy="156" rx="6" ry="2" fill="var(--vy-rocket-detail)" />
          <ellipse cx="150" cy="168" rx="11" ry="3" fill="var(--vy-rocket-detail)" />
          <rect x="106" y="137.5" width="28" height="3" rx="1.5" fill="var(--vy-rocket-soft)" />
        </g>
      </g>

      {state === 'building' && <DesignDoc uid={uid} />}

      {state !== 'error' && (
        <g className="vy-rl-ship" transform={`translate(120 ${flying ? CRUISE_Y : PAD_Y})`}>
          <g className="vy-rl-bob">
            <g transform="scale(.9)">
              <g className="vy-rl-flame">
                <path d="M-5.5 22C-8 33-3 42 0 53C3 42 8 33 5.5 22Z" fill="var(--vy-rocket-soft)" />
                <path d="M-3.4 22C-4 29-1.5 36 0 42C1.5 36 4 29 3.4 22Z" fill="var(--vy-rocket-trim)" />
                <path d="M-1.6 22C-1.6 26 0 31 0 31C0 31 1.6 26 1.6 22Z" fill="#fff" />
              </g>
              <Craft />
            </g>
          </g>
        </g>
      )}

      {state === 'building' && <RobotArm />}
      {state === 'error' && <Wreck />}
    </svg>
  );
}

const STAR = 'M0-4Q0 0 4 0Q0 0 0 4Q0 0-4 0Q0 0 0-4Z';
const BODY = 'M0-31C13-23 15-4 14 10C14 16.5 11 20.5 0 20.5C-11 20.5-14 16.5-14 10C-15-4-13-23 0-31Z';
const FINS = 'M-12 6C-19 10-24 18-23 27C-23 28.5-21.5 28.5-20.5 27.5L-11 20ZM12 6C19 10 24 18 23 27C23 28.5 21.5 28.5 20.5 27.5L11 20ZM-6.5 19H6.5L5 24.5H-5Z';

/** The craft itself, upright: fins, body, shaded side, nose, stripe, window. */
function Craft() {
  return (
    <>
      <path d={FINS} fill="var(--vy-rocket-shade)" />
      <path d={BODY} fill="var(--vy-rocket-hull)" />
      <path d="M0-31C13-23 15-4 14 10C14 16.5 11 20.5 0 20.5Z" fill="var(--vy-rocket-shade)" opacity=".45" />
      <path d="M0-31C5-27.5 9-23 11-17.5H-11C-9-23-5-27.5 0-31Z" fill="var(--vy-rocket-shade)" />
      <rect x="-14.4" y="11" width="28.8" height="3.4" fill="var(--vy-rocket-trim)" />
      <circle cx="0" cy="-4" r="8" fill="var(--vy-rocket-trim)" />
      <circle cx="0" cy="-4" r="5.6" fill="var(--vy-rocket-trim)" opacity=".55" />
      <path d="M-3-6.5a4 4 0 0 1 3.5-1.6" stroke="#fff" strokeWidth="1.4"
            strokeLinecap="round" fill="none" opacity=".9" />
    </>
  );
}

/**
 * The failure: the same craft, back on the pad and no longer airworthy.
 *
 * IT IS NOT A DIFFERENT PICTURE. The reader has met this rocket on the way in,
 * so a tilt, a crack and a fin lying on the ground are legible before the
 * sentence under them is read. A separate illustration for failure would be a
 * second thing to learn at the worst possible moment.
 */
function Wreck() {
  return (
    <g>
      {/* The fin that came off, lying where it fell. */}
      <g transform="translate(152 139.5) rotate(96) scale(.9) translate(-17 -17)">
        <path d="M12 6C19 10 24 18 23 27C23 28.5 21.5 28.5 20.5 27.5L11 20Z" fill="var(--vy-rocket-shade)" />
      </g>
      <g transform="translate(121 138) rotate(11) translate(0 -25) scale(.9)">
        <path d="M-12 6C-19 10-24 18-23 27C-23 28.5-21.5 28.5-20.5 27.5L-11 20ZM-6.5 19H6.5L5 24.5H-5Z"
              fill="var(--vy-rocket-shade)" />
        {/* The stump where the other one was. */}
        <path d="M11 9L13 12L11 14L13.5 17" stroke="var(--vy-rocket-shade)" strokeWidth="1.2"
              fill="none" strokeLinejoin="round" />
        <path d={BODY} fill="var(--vy-rocket-hull)" />
        <path d="M0-31C13-23 15-4 14 10C14 16.5 11 20.5 0 20.5Z" fill="var(--vy-rocket-shade)" opacity=".45" />
        <path d="M0-31C5-27.5 9-23 11-17.5H-11C-9-23-5-27.5 0-31Z" fill="var(--vy-rocket-shade)" />
        <rect x="-14.4" y="11" width="28.8" height="3.4" fill="var(--vy-rocket-trim)" />
        <circle cx="0" cy="-4" r="8" fill="var(--vy-rocket-trim)" />
        <circle cx="0" cy="-4" r="5.6" fill="var(--vy-rocket-trim)" opacity=".55" />
        <path d="M-4.2-7.6L-1.4-4.6L-2.6-2.8L1.2 0.4" stroke="var(--vy-rocket-shade)" strokeWidth="1"
              strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M7 2L4 5.5L6.5 7.5L3.5 10.5" stroke="var(--vy-rocket-trim)" strokeWidth="1.2"
              strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle className="vy-rl-puff" cx="8" cy="3" r="5" />
        <circle className="vy-rl-puff" cx="9" cy="4" r="4" style={{ animationDelay: '-.8s' }} />
        <circle className="vy-rl-puff" cx="7" cy="4" r="4.5" style={{ animationDelay: '-1.6s' }} />
      </g>
    </g>
  );
}

/**
 * The design doc on its easel: a schematic of the craft and a checklist that
 * ticks off while you watch.
 *
 * THE CHECKLIST IS THE WHOLE POINT of this state. A screen that is not built
 * yet is not a screen that failed, and the difference has to be visible before
 * the heading is read — work in progress rather than wreckage.
 */
function DesignDoc({ uid }: { uid: string }) {
  return (
    <g>
      <path d="M55 121L53 151.6M89 121L91 142.6" stroke="var(--vy-rocket-soft)"
            strokeWidth="2" strokeLinecap="round" />
      <rect x="48" y="70" width="48" height="52" rx="3" fill="var(--vy-surface)" stroke="var(--vy-rocket-detail)" />
      <rect x="66" y="67" width="12" height="5" rx="1.5" fill="var(--vy-rocket-shade)" />
      <rect x="52" y="76" width="20" height="40" rx="1.5" fill="var(--vy-rocket-paper)" />
      <rect x="52" y="76" width="20" height="40" rx="1.5" fill={`url(#grid-${uid})`}
            stroke="var(--vy-rocket-trim)" strokeWidth=".6" />
      <path d="M62 79V113" stroke="var(--vy-rocket-soft)" strokeWidth=".5" strokeDasharray="2 1.5" />
      <g transform="translate(62 97.5) scale(.38)" fill="none" stroke="var(--vy-rocket-accent)"
         strokeWidth="2.6" strokeLinejoin="round">
        <path d={BODY} /><path d={FINS} /><circle cx="0" cy="-4" r="7" />
      </g>
      <path d="M74.5 76V116" stroke="var(--vy-rocket-trim)" strokeWidth=".8" />
      {[81, 90, 99].map((y, i) => (
        <g key={y}>
          <rect x="77" y={y - 2.5} width="5" height="5" rx="1" fill="var(--vy-surface)"
                stroke="var(--vy-rocket-soft)" strokeWidth=".9" />
          <rect x="84" y={y - 1} width={[8, 6, 7][i]} height="2" rx="1" fill="var(--vy-rocket-trim)" />
          <path className={`vy-rl-tick vy-rl-tick-${i + 1}`} d={`M78.1 ${y}l1.3 1.4 2.5-2.7`}
                stroke="var(--vy-rocket-accent)" strokeWidth="1.2" fill="none"
                strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
      <rect x="77" y="106" width="15" height="2" rx="1" fill="var(--vy-rocket-trim)" />
      <rect x="77" y="110.5" width="10" height="2" rx="1" fill="var(--vy-rocket-trim)" />
    </g>
  );
}

/** The arm: base, turret, shoulder, elbow, wrist, and sparks while it welds. */
function RobotArm() {
  return (
    <g>
      <path d="M154 146.4L178 146.4L175 141L157 141Z" fill="var(--vy-rocket-shade)" />
      <rect x="159" y="129" width="14" height="13" rx="2.5" fill="var(--vy-rocket-accent)" />
      <rect x="161" y="131" width="2.6" height="9" rx="1" fill="var(--vy-rocket-soft)" opacity=".7" />
      <g className="vy-rl-shoulder">
        <path d="M166 128L158 98" stroke="var(--vy-rocket-soft)" strokeWidth="7" strokeLinecap="round" />
        <path d="M164.4 126.4L157.2 99.4" stroke="var(--vy-rocket-detail)" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="166" cy="128" r="5" fill="var(--vy-rocket-shade)" />
        <circle cx="166" cy="128" r="1.9" fill="var(--vy-rocket-detail)" />
        <g className="vy-rl-elbow">
          <path d="M158 98L141 103" stroke="var(--vy-rocket-soft)" strokeWidth="5" strokeLinecap="round" />
          <path d="M156.6 96.9L142 101.2" stroke="var(--vy-rocket-detail)" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M141.5 101.6L136 103.5L136 104.4L141.8 105.2Z" fill="var(--vy-rocket-shade)" />
          <circle cx="141" cy="103" r="3" fill="var(--vy-rocket-shade)" />
          {/* Sparks only while the arm is holding against the seam, which is
              what makes it read as welding rather than waving. */}
          <g className="vy-rl-spark">
            <circle cx="134.4" cy="104" r="3.2" fill="var(--vy-rocket-detail)" opacity=".55" />
            <path d="M134.4 104l-2.8-3M134.4 104l-3.8 .4M134.4 104l-2.4 3.2M134.4 104l.4-3.6"
                  stroke="#fff" strokeWidth="1" strokeLinecap="round" />
            <circle cx="134.4" cy="104" r="1.3" fill="#fff" />
          </g>
          <circle cx="158" cy="98" r="4.2" fill="var(--vy-rocket-shade)" />
          <circle cx="158" cy="98" r="1.6" fill="var(--vy-rocket-detail)" />
        </g>
      </g>
    </g>
  );
}
