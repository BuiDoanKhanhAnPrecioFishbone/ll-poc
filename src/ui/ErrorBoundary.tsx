import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorState } from './ErrorState';

/**
 * Catches a render that threw, so the app shows a state instead of nothing.
 *
 * THE FAILURE THIS EXISTS FOR WAS OBSERVED, not imagined. On 10 Sep, opening
 * every sidebar disclosure at once on the customer's production system threw
 * `useNavigationLoading must be used within a NavigationLoadingProvider` and
 * **blanked the React root** — a white page, with no way back except a reload
 * the user had to think of themselves. Written up in
 * `docs/live-recheck-10sep.md`. An uncaught render error is not a rare
 * theoretical; it is the one failure mode we have actually seen on their
 * system.
 *
 * A CLASS COMPONENT, because `componentDidCatch` has no hook equivalent. This
 * is the one place in the codebase that needs one, and React has not moved.
 *
 * IT SITS INSIDE THE SHELL. Outside it, a thrown route would take the sidebar
 * and the top bar with it, and the user would lose the navigation they need to
 * leave the broken screen. Inside, the shell stands and only the page is
 * replaced.
 *
 * `key` RESETS IT. "Try again" cannot simply clear the flag: the same props
 * would render the same throw, and the button would look broken too. Bumping
 * the key remounts the subtree so the render is genuinely attempted afresh.
 */
type State = { error: Error | null; attempt: number };

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null, attempt: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    /* The console is where a developer looks and the only reporter this
       prototype has. On the live system this is the hook for whatever
       collects errors — the component stack is the useful half. */
    console.error('[voyager] render failed', error, info.componentStack);
  }

  render() {
    const { error, attempt } = this.state;
    if (!error) return <div key={attempt}>{this.props.children}</div>;

    return (
      <ErrorState
        title="This screen stopped loading"
        /* NOT the exception text. `Cannot read properties of null` tells a
           cost estimator nothing and reads as their fault. What they need is
           whether their work survived — and it did, because nothing here had
           been sent anywhere. */
        body="Nothing you entered has been lost — the screen failed while drawing, not while saving. Trying again reloads just this screen; the rest of Voyager IQ is still working."
        onRetry={() => this.setState({ error: null, attempt: attempt + 1 })}
        retryLabel="Reload this screen"
      />
    );
  }
}
