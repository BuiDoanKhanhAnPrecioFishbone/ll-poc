import { useState } from 'react';
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
 * THE BRAND stays VOYAGER / Linh Long Engineering. The deck also asks for a
 * rename to "Voyager IQ" with a new tagline, and that is deliberately NOT done
 * here: the tagline sentence reads two ways and its wording may carry a typo, so
 * it is logged in `docs/kickoff-deck-gaps.md` as a question for the customer
 * rather than guessed at on the screen that carries their name.
 *
 * NOTHING IS AUTHENTICATED. This is a mockup: the form posts nowhere, stores
 * nothing, and validates nothing beyond both boxes being non-empty. Sign In
 * navigates to Home and says as much, on the same rule every other
 * unimplemented control in this prototype follows.
 */
export function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const ready = username.trim() !== '' && password.trim() !== '';

  function signIn(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
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
      <aside className="vy-login-brand">
        <div className="vy-login-brandmark">
          <span className="vy-brand-mark" aria-hidden>V</span>
          <div>
            <strong>VOYAGER</strong>
            <span>Linh Long Engineering</span>
          </div>
        </div>
        <p className="vy-login-pitch">ERP solutions for corporate.</p>
        <p className="vy-login-note">
          A design prototype. No account is required and nothing you type here is sent anywhere.
        </p>
      </aside>

      {/* Right: the form, held to a readable width inside its half rather than
          stretched to fill it. */}
      <main className="vy-login-panel">
        <form className="vy-login-form" onSubmit={signIn}>
          <h1 className="vy-login-title">Welcome Back</h1>
          <p className="vy-login-sub">Please sign in to continue</p>

          <TextField
            label="Username"
            placeholder="Enter Username"
            autoComplete="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            placeholder="Enter Password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <div className="vy-login-row">
            <Checkbox checked={remember} onCheckedChange={setRemember} label="Remember me" />
            <button type="button" className="vy-link vy-login-forgot"
                    onClick={() => toast.notImplemented('start password recovery')}>
              Forgot Password?
            </button>
          </div>

          {/* Filled primary, white on blue-600 — 8.6:1. The live button is pale
              blue on white, which is the contrast fault the deck names. Disabled
              until both boxes have something in them, so the one control on the
              page never fails silently. */}
          <Button type="submit" variant="filled" className="vy-login-submit" disabled={!ready}>
            Sign In
          </Button>

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
