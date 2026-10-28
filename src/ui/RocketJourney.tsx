import { useEffect, useId, useRef } from 'react';

/**
 * The boot illustration — a rocket crossing from one planet to another.
 *
 * Drawn by the customer's designer; the art here is her horizontal light file
 * from `docs/assets/rocket-journey/`, transcribed to JSX. Its README records
 * what was corrected before it arrived in the codebase and what is still open.
 *
 * ---------------------------------------------------------------------------
 * WHY THE SVG IS INLINE AND NOT AN `<img>`. Two reasons, and both are rules
 * this project already follows. An `<img src>` is a second network request on
 * the one screen whose whole job is to cover the first one — the login screen
 * refuses a CDN `<img>` for the Microsoft mark on exactly this logic. And an
 * `<img>` is its own document: `var(--vy-brand)` inside it resolves against
 * nothing, so every colour would fall back to its hex and the token layer
 * would stop reaching the art.
 *
 * WHY THE ids ARE GENERATED. The delivered files carry a `clipPath` with a
 * fixed id. A static file cannot do better, but two instances of this
 * component on one page — the login panel and the boot screen, which can
 * overlap — would both define it and the second planet's highlight would clip
 * against the first one's shape. `useId` ends that by construction.
 *
 * WHY THE MOTION IS WRITTEN HERE RATHER THAN IMPORTED. The prototype that came
 * with the art ships a minified engine that also owns a hold-timer the app
 * would depend on. Measured during review: `requestAnimationFrame` fires zero
 * times in a hidden page. Anything the app waits for therefore cannot live in
 * an animation loop. This loop owns pixels and nothing else — it can stop for
 * a minute in a background tab and no state is lost, because there is no state
 * in it.
 * ---------------------------------------------------------------------------
 */

/**
 * The flight axis, in viewBox units: the five stations, then the landing.
 *
 * THE LANDING WAS MISSING UNTIL 28 OCT, and this comment named it the whole
 * time. The ship's position was `STATIONS[min(step, 4)]`, so at step 5 — every
 * stage done — it stayed at the last station while the final leg of the route
 * lit up behind it and the planet it was pointing at never got nearer. An saw
 * it on the specimen: "hình như tên lửa thiếu đáp hả?". 108 is where the route
 * ends and the planet's ring begins.
 */
const STATIONS = [38, 59, 73, 87, 94, 108] as const;
/** Every stage done: the ship is at the planet, not between stations. */
const LANDED = STATIONS.length - 1;
const at = (s: number) => STATIONS[Math.min(Math.max(s, 0), LANDED)];

/* The rocket's own geometry, read off the art rather than guessed, because the
   flame length below is computed from it. The ship group is drawn at scale
   0.42 and rotated 90°, so a local `y` of `n` sits at `station - 0.42n` on the
   flight axis. The flame runs from the nozzle at y=22 to its tip at y=53, and
   its transform scales about the nozzle — so scaling it shortens the flame
   rather than moving it. Planet A's disc ends at x=24: centre 14, radius 10. */
const SHIP_SCALE = 0.42, NOZZLE = 22, FLAME_TIP = 53, PLANET_A_EDGE = 24;

/**
 * How much of the flame fits between the rocket and the planet behind it.
 *
 * AT THE FIRST STATION THE FULL FLAME IS INSIDE PLANET A. The rocket rests at
 * x=38 and a full flame reaches back to 38 - 0.42 × 53 = 15.7, which is 8.3
 * units inside a disc that ends at 24 — on screen, the white-hot core sitting
 * on the planet's pale face as a notch cut out of it. Found by photographing
 * the boot screen and magnifying it, not by reading the file.
 *
 * Capping it by the room available is better than a short flame hard-coded for
 * station 0, for a reason that is about the drawing rather than the arithmetic:
 * the rocket hovers, and a cap computed from where it actually IS makes the
 * flame breathe as it drifts — the engine throttling up as it pulls away. By
 * the second station there is room for all of it and the cap stops applying.
 */
function flameFit(x: number) {
  const room = (x - PLANET_A_EDGE) / SHIP_SCALE - NOZZLE;
  return Math.max(0, Math.min(1, room / (FLAME_TIP - NOZZLE)));
}

export function RocketJourney({ step = 0, state = 'loading' }: {
  /**
   * How many boot stages have finished — lights that many route segments.
   *
   * NOTHING FEEDS THIS YET, and that is deliberate rather than unfinished.
   * `BootScreen` is a Suspense fallback: it knows that work is happening and
   * nothing about how far along it is, so it passes no step and the route
   * stays unlit. Inventing stages to make the rocket move would be drawing a
   * progress bar from a timer, which is the one thing a progress indicator
   * must never do.
   *
   * The live system does have real stages to wire this to — its store carries
   * `INITIALIZE`, `LOGIN_REQUEST` / `LOGIN_SUCCESS`, `isAuthInitialized`,
   * `isInitialized`, `navigation` and `getPermission`. Five stations is the
   * right count for production and the wrong one for this build.
   */
  step?: number;
  /**
   * `loading` hovers and burns; `error` is the same craft stopped.
   *
   * THE ERROR POSE IS NOT A DIFFERENT DRAWING. It is this one with the engine
   * out, crosses for eyes, two puffs of smoke and the destination dimmed —
   * the designer's own `error` state, and the reason it works is that the
   * reader has already met this rocket on the way in. A separate illustration
   * for failure would be a second thing to learn at the worst moment.
   *
   * It never animates. A failure that is still moving reads as a failure that
   * is still trying.
   */
  state?: 'loading' | 'error';
}) {
  const uid = useId();
  const clip = `vy-rocket-clip-${uid}`;
  const ship = useRef<SVGGElement>(null);
  const flame = useRef<SVGGElement>(null);
  const eyes = useRef<SVGGElement>(null);

  /**
   * Hover, flame and blink — the three things that say "still working" when
   * there is no progress to report.
   *
   * ATTRIBUTES, NOT CSS TRANSFORMS. The art positions every part with SVG
   * transform attributes; setting a CSS `transform` on the same elements makes
   * the two compete, and which one wins depends on `transform-box` defaults
   * that differ between browsers. The review found this misplacing the rocket,
   * so the rule is: whatever the art sets as an attribute, we also set as an
   * attribute.
   *
   * The hover travels along the FLIGHT axis only. Moving it across would lift
   * the rocket off the route line it is meant to be following.
   */
  useEffect(() => {
    if (state === 'error') return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;

    const draw = (t: number) => {
      /* One loop length for all three, so they never drift apart on screen. */
      const loop = 1400;
      const hover = 2 * (0.5 - 0.5 * Math.cos((2 * Math.PI * (t % loop)) / loop));
      const x = at(step) + hover;
      ship.current?.setAttribute(
        'transform', `translate(${x.toFixed(2)} 48) rotate(90) scale(${SHIP_SCALE})`);

      /* Half the loop, so the flame beats twice per pass — a flame that
         flickers at the speed of the hover reads as one movement, not two.
         Multiplied by the room it has, so it never reaches into the planet. */
      const f = flameFit(x) * (1 + 0.1 * Math.sin((2 * Math.PI * (t % (loop / 2))) / (loop / 2)));
      flame.current?.setAttribute(
        'transform', `translate(0 22) scale(1 ${f.toFixed(3)}) translate(0 -22)`);

      /* Twice the loop and closed for a twentieth of it: a blink is an event
         in a cycle, not a cycle of its own. */
      const b = (t % (loop * 2)) / (loop * 2);
      const open = b < 0.9 ? 1 : b < 0.95 ? 1 - (b - 0.9) / 0.05 : (b - 0.95) / 0.05;
      eyes.current?.setAttribute(
        'transform', `translate(0 -5.6) scale(1 ${open.toFixed(3)}) translate(0 5.6)`);

    };

    /* Reduce-motion gets the pose, drawn once and never scheduled. The global
       stylesheet cannot cover this one: its rule caps CSS animation, and there
       is no CSS animation here to cap. */
    if (reduce.matches) { draw(0); return; }

    /* ARRIVED IS A POSE, NOT A LOOP. Hovering at the planet would say the ship
       is still flying, and the flame would say the engine is still burning —
       both after the thing being waited for has finished. It parks: at the
       landing, engine out, eyes open. Nothing is scheduled, for the same
       reason reduce-motion schedules nothing. */
    if (step >= LANDED) {
      ship.current?.setAttribute(
        'transform', `translate(${STATIONS[LANDED]} 48) rotate(90) scale(${SHIP_SCALE})`);
      flame.current?.setAttribute('transform', 'translate(0 22) scale(1 0) translate(0 -22)');
      eyes.current?.setAttribute('transform', 'translate(0 -5.6) scale(1 1) translate(0 5.6)');
      return;
    }

    const tick = (t: number) => { draw(t); frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [step, state]);

  /* The error pose does not hover, so one value covers it. */
  const errFit = flameFit(at(step));
  const star = 'M0 -3.2 Q0 0 3.2 0 Q0 0 0 3.2 Q0 0 -3.2 0 Q0 0 0 -3.2Z';
  const dot = { fill: 'none', strokeWidth: 2.4, strokeLinecap: 'round' as const,
                strokeDasharray: '0.1 6.9' };
  /* The passed segments. Their colour is the one thing the review changed in
     the art: at `--vy-blue-300` they stood 1.52:1 from the unpassed dots,
     against a 3:1 floor for a graphic that carries information. */
  const seg = { ...dot, stroke: 'var(--vy-blue-500, #2754bc)' };

  /* HIDDEN FROM THE ACCESSIBILITY TREE, and it has to be. The caller puts this
     inside a `role="status"` region that already carries the sentence in
     visible text; giving the drawing `role="img"` and the same sentence as a
     label made that region announce it twice. The picture says nothing the line
     beneath it does not, so it says nothing. */
  return (
    <svg className="vy-rocket-journey" viewBox="0 0 144 96"
         aria-hidden="true" focusable="false">
      <path d={star} transform="translate(22 18) scale(1.2)" fill="var(--vy-blue-200, #b0c2ea)" />
      <path d={star} transform="translate(60 14) scale(0.8)" fill="var(--vy-blue-200, #b0c2ea)" />
      <path d={star} transform="translate(100 80) scale(1)" fill="var(--vy-blue-200, #b0c2ea)" />

      <clipPath id={clip}><circle cx="14" cy="48" r="10" /></clipPath>
      <g>
        <circle cx="14" cy="48" r="10" fill="var(--vy-blue-200, #b0c2ea)" />
        <circle cx="17.5" cy="45" r="10" fill="var(--vy-blue-100, #dae2f3)"
                clipPath={`url(#${clip})`} />
      </g>

      <g transform="rotate(-14 122 48)" opacity={state === 'error' ? 0.5 : 1}>
        <path d="M109 48 A13 4 0 0 1 135 48" fill="none"
              stroke="var(--vy-blue-200, #b0c2ea)" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="122" cy="48" r="7" fill="var(--vy-blue-300, #7f9ce1)" />
        <path d="M109 48 A13 4 0 0 0 135 48" fill="none"
              stroke="var(--vy-blue-200, #b0c2ea)" strokeWidth="2.4" strokeLinecap="round" />
      </g>

      <path d="M38 48 L108 48" {...dot} stroke="var(--vy-blue-200, #b0c2ea)" />
      <path d="M38 48 L59 48"  {...seg} opacity={step >= 1 ? 1 : 0} />
      <path d="M59 48 L73 48"  {...seg} opacity={step >= 2 ? 1 : 0} />
      <path d="M73 48 L87 48"  {...seg} opacity={step >= 3 ? 1 : 0} />
      <path d="M87 48 L94 48"  {...seg} opacity={step >= 4 ? 1 : 0} />
      <path d="M94 48 L108 48" {...seg} opacity={step >= 5 ? 1 : 0} />

      <g ref={ship}
         transform={`translate(${at(step)} 48) rotate(90) scale(${SHIP_SCALE})`}>
        {/* The resting pose carries the cap too. Left at `scale(1 1)` the flame
            painted at full length for one frame before the first animation
            tick trimmed it — a flicker through the planet on every mount. */}
        <g ref={flame} opacity={state === 'error' ? 0 : 1}
           transform={`translate(0 22) scale(1 ${(step >= LANDED ? 0 : flameFit(at(step))).toFixed(3)}) translate(0 -22)`}>
          <path d="M-5.5 22 C-8 33 -3 42 0 53 C3 42 8 33 5.5 22 Z" fill="var(--vy-blue-300, #7f9ce1)" />
          <path d="M-3.4 22 C-4 29 -1.5 36 0 42 C1.5 36 4 29 3.4 22 Z" fill="var(--vy-blue-100, #dae2f3)" />
          {/* White because it is the hottest part of a flame, not because it is
              a surface: `--vy-surface` flips to #161c25 in dark and this would
              have become a hole in the middle of the flame. */}
          <path d="M-1.6 22 C-1.6 26 0 31 0 31 C0 31 1.6 26 1.6 22 Z" fill="var(--vy-grey-0, #ffffff)" />
        </g>
        {/* Smoke where the flame was. Two puffs, the second fainter and
            further out, so it reads as drifting rather than as a second
            exhaust.

            THEY TAKE THE SAME CAP AS THE FLAME, and they needed it: measured
            at station 0, the puffs sat at x 23.7 and 19.1 inside a planet that
            ends at 24 — the flame bug again, in the state nobody looks at
            until something has gone wrong. Their offsets from the nozzle are
            scaled rather than their radii, so the smoke stays the same size
            and only drifts less far. */}
        {state === 'error' && (
          <g fill="var(--vy-blue-200, #b0c2ea)">
            <circle cx="0" cy={NOZZLE + 12 * errFit} r="4.4" />
            <circle cx="0" cy={NOZZLE + 23 * errFit} r="3" opacity=".6" />
          </g>
        )}
        <path d="M-12 6 C-19 10 -24 18 -23 27 C-23 28.5 -21.5 28.5 -20.5 27.5 L-11 20 Z M12 6 C19 10 24 18 23 27 C23 28.5 21.5 28.5 20.5 27.5 L11 20 Z M-6.5 19 H6.5 L5 24.5 H-5 Z"
              fill="var(--vy-blue-800, #112960)" />
        <path d="M0 -31 C13 -23 15 -4 14 10 C14 16.5 11 20.5 0 20.5 C-11 20.5 -14 16.5 -14 10 C-15 -4 -13 -23 0 -31 Z"
              fill="var(--vy-brand, #1a419e)" />
        <path d="M0 -31 C13 -23 15 -4 14 10 C14 16.5 11 20.5 0 20.5 Z"
              fill="var(--vy-blue-800, #112960)" opacity=".45" />
        <path d="M0 -31 C5 -27.5 9 -23 11 -17.5 H-11 C-9 -23 -5 -27.5 0 -31 Z"
              fill="var(--vy-blue-800, #112960)" />
        <rect x="-14.4" y="11" width="28.8" height="3.4" fill="var(--vy-blue-100, #dae2f3)" />
        <circle cx="0" cy="-4" r="9.4" fill="var(--vy-blue-100, #dae2f3)" />
        <circle cx="0" cy="-4" r="7" fill="var(--vy-blue-800, #112960)" />
        {state === 'error' ? (
          <path d="M-4.6 -6.6 L-1.4 -3.4 M-1.4 -6.6 L-4.6 -3.4 M1.4 -6.6 L4.6 -3.4 M4.6 -6.6 L1.4 -3.4"
                fill="none" stroke="var(--vy-blue-100, #dae2f3)"
                strokeWidth="1.5" strokeLinecap="round" />
        ) : (
          <g ref={eyes} fill="var(--vy-blue-100, #dae2f3)"
             transform="translate(0 -5.6) scale(1 1) translate(0 5.6)">
            <circle cx="-2.3" cy="-5.6" r="1.9" />
            <circle cx="2.9" cy="-5.6" r="1.9" />
          </g>
        )}
      </g>
    </svg>
  );
}
