import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField } from '../ui/Field';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Overlays';
import { useToast } from '../ui/Toast';

/**
 * Login.
 *
 * The kick-off deck spends two slides on this screen and names two faults:
 * "Too much empty space" and "Lack of contrast". Both are fair — the live page
 * is a 400px card adrift in a full-width white field, and its Sign In button is
 * pale blue on white. This answers those two, and nothing else.
 *
 * CONTENT IS UNCHANGED. Every field, label, link and line of copy is the live
 * page's: Welcome Back, Please sign in to continue, Username, Password, Remember
 * me, Forgot Password?, Sign In, Privacy Notice, Term of service. Per
 * `docs/precedence.md` tier 2, layout may be redesigned and content may not, and
 * a login screen is the last place to start renaming things people type into
 * daily.
 *
 * THE EMPTY SPACE is answered by giving the width a job rather than by
 * stretching the form. A form is the one thing on this page that must NOT be
 * wide — a 900px username field is worse than a 360px one — so the width goes to
 * a brand panel beside it. Two panels also produce the contrast the deck asks
 * for, at the scale of the page rather than of one button.
 *
 * THE BRAND IS VOYAGER IQ / Linh Long Engineering, settled 7 Sep 2026. It read
 * VOYAGER while the rename sat in `docs/kickoff-deck-gaps.md` as an open
 * question; the customer's answer is that it was never a naming question at all
 * — the name is Voyager IQ and the work is a design system.
 *
 * THE TAGLINE IS STILL NOT ON THIS SCREEN. The deck asks to "improve the
 * tagline, 'The completed ERP/MES Solution'", a sentence that reads two ways and
 * may carry a typo, and no answer has been given. Better absent than guessed at
 * on the screen carrying their name.
 *
 * NOTHING IS AUTHENTICATED. This is a mockup: the form posts nowhere, stores
 * nothing, and validates nothing beyond both boxes being non-empty. Sign In
 * navigates to Home and says as much, on the same rule every other
 * unimplemented control in this prototype follows.
 */
/* Microsoft's four squares, at their own brand colours. Drawn rather than
   linked: an <img> to a CDN is a network dependency on a login screen, and
   these four hex values are the one place in this app where a brand colour
   legitimately ignores our token layer — they are someone else's mark. */
function MicrosoftLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden focusable="false">
      <rect x="0" y="0" width="7" height="7" fill="#f25022" />
      <rect x="9" y="0" width="7" height="7" fill="#7fba00" />
      <rect x="0" y="9" width="7" height="7" fill="#00a4ef" />
      <rect x="9" y="9" width="7" height="7" fill="#ffb900" />
    </svg>
  );
}

export function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  /* Caps Lock is the single commonest reason a correct password is rejected,
     and the one thing a password field can warn about without knowing the
     password. Read from the key event's modifier state — no key logging. */
  const [caps, setCaps] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const userRef = useRef<HTMLInputElement>(null);

  /* The cursor belongs in the first field. This page has one job. */
  useEffect(() => { userRef.current?.focus(); }, []);

  const missing = [
    username.trim() === '' ? 'Username' : null,
    password.trim() === '' ? 'Password' : null,
  ].filter(Boolean) as string[];
  const ready = missing.length === 0;

  function signIn(e: React.FormEvent) {
    e.preventDefault();
    setAttempted(true);
    if (!ready) { userRef.current?.focus(); return; }
    /* Deliberately not "signed in as {username}" — echoing back what was typed
       into a password form is the shape of a thing that checked it. */
    toast.success('Not in this prototype — this would sign you in. No credentials are sent or stored.');
    navigate('/');
  }

  return (
    <div className="vy-login">
      {/* Left: the brand panel. On-dark surface, which is the one high-contrast
          ground this design system already owns — the sidebar uses it, so the
          login and the app agree before you have signed in. */}
      {/* THREE ZONES, not one centred stack. The first version answered the
          deck's "too much empty space" by moving the empty space to the left —
          a small block floating in a tall dark field is the same fault on a
          different ground. Anchoring the mark to the top, the statement to the
          optical centre and the small print to the foot is how the panel earns
          its 45% of the page. */}
      <aside className="vy-login-brand">
        <div className="vy-login-brandmark">
          <span className="vy-brand-mark" aria-hidden>V</span>
          <div>
            <strong>VOYAGER IQ</strong>
            <span>Linh Long Engineering</span>
          </div>
        </div>

        <div className="vy-login-statement">
          {/* Replaces "ERP solutions for corporate." — the live logo's strapline,
              which reads as a fragment when it is set as a headline. This says
              what the system actually does, in the order the work happens:
              a quote becomes a BoM, a BoM becomes a build, a build ships. */}
          <p className="vy-login-pitch">One record for a part, from quote to shipment.</p>
          <ul className="vy-login-scope">
            <li>Quotations and BoM comparison</li>
            <li>Parts, manufacturers and approved MPNs</li>
            <li>Production, stock and packing</li>
          </ul>
        </div>

        <div className="vy-login-foot">
          <p className="vy-login-note">
            A design prototype. No account is required and nothing you type here
            is sent anywhere.
          </p>
        </div>
      </aside>

      {/* Right: the form, held to a readable width inside its half rather than
          stretched to fill it. */}
      <main className="vy-login-panel">
        <form className="vy-login-form" onSubmit={signIn}>
          <h1 className="vy-login-title">Welcome Back</h1>
          <p className="vy-login-sub">Please sign in to continue</p>

          {/* Shown only after a real attempt, so the page does not greet you
              with an error you have not earned. `role="alert"` so it is
              announced rather than only seen. */}
          {attempted && missing.length > 0 && (
            <p className="vy-login-error" role="alert">
              {missing.length === 2
                ? 'Enter your username and password.'
                : `Enter your ${missing[0].toLowerCase()}.`}
            </p>
          )}

          <TextField
            ref={userRef}
            label="Username"
            placeholder="Enter Username"
            autoComplete="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            aria-invalid={attempted && username.trim() === '' ? true : undefined}
          />
          <div className="vy-login-pw">
            <TextField
              label="Password"
              type="password"
              placeholder="Enter Password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyUp={e => setCaps(e.getModifierState('CapsLock'))}
              onBlur={() => setCaps(false)}
              aria-invalid={attempted && password.trim() === '' ? true : undefined}
            />
            {caps && <p className="vy-login-caps" role="status">Caps Lock is on.</p>}
          </div>

          <div className="vy-login-row">
            <Checkbox checked={remember} onCheckedChange={setRemember} label="Remember me" />
            <button type="button" className="vy-link vy-login-forgot"
                    onClick={() => toast.notImplemented('start password recovery')}>
              Forgot Password?
            </button>
          </div>

          {/* Filled primary. Measured 10 Sep: white on blue-600 is 9.16:1 in
              light, and near-black on blue-300 is 6.86:1 in dark. This comment
              said 8.6:1 long after the palette moved to hue 222 — a number
              carried forward rather than re-measured, which is how a wrong
              figure reaches a client document.

              The live button is pale blue on white, the contrast fault the deck
              names.

              IT IS NO LONGER DISABLED WHEN THE FIELDS ARE EMPTY. That was here
              so the one control on the page could not fail silently, and the
              intent was right — but a dead button is the silent failure. It
              gives a keyboard or screen-reader user nothing to act on and does
              not say which field is missing. Pressing it now names the field
              instead. */}
          <Button type="submit" variant="filled" className="vy-login-submit">
            Sign In
          </Button>

          {/* MICROSOFT SSO — gap M1. The live page offers a second way in and
              this one did not: an `OR` rule, `Sign in with Microsoft`, and the
              line below it. The bundle carries a `login/callback` route, so it
              is a real OAuth round trip rather than a decorative button.

              It sits BELOW the username form, where the live page puts it. That
              ordering is worth keeping even though SSO is likely the path most
              staff take: the form above is the fallback for anyone whose
              account is not federated, and burying it under the button that
              will not work for them is the worse failure. */}
          <div className="vy-login-or"><span>OR</span></div>

          <Button
            type="button"
            variant="outlined"
            className="vy-login-sso"
            onClick={() => toast.notImplemented('sign in with your Microsoft account')}
          >
            <MicrosoftLogo />
            Sign in with Microsoft
          </Button>
          <p className="vy-login-sso-hint">
            Use your organization account to sign in securely.
          </p>

          <p className="vy-login-legal">
            <button type="button" className="vy-link"
                    onClick={() => toast.notImplemented('open the privacy notice')}>Privacy Notice</button>
            <span aria-hidden>·</span>
            <button type="button" className="vy-link"
                    onClick={() => toast.notImplemented('open the terms of service')}>Term of service</button>
          </p>
        </form>
      </main>
    </div>
  );
}
