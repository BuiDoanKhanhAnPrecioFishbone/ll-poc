# Release phases

Every component and foundation carries a phase, shown as a badge beside its
name in the navigation. General Availability carries none, which is how
atlassian.design does it: the badge marks the exception, not the norm.

## Phases

| Phase | What it means |
|---|---|
| **Early Access** | New and experimental. Expect breaking changes; do not build on it unless you are prepared to follow them. |
| **Beta** | Ready to use and supported. Still improving, and breaking changes are possible but rare. |
| **General Availability** | Stable. No badge. |
| **Intent to Deprecate** (badge: *Caution*) | Being considered for removal. If you are not already using it, use the alternative the page names. |
| **Deprecated** | No longer supported, and it will be removed. The page names what replaces it. |

**The phase is evidence, not opinion.** Each one is recorded in
`docs/ia.config.mjs` beside the measurement that justifies it — how many files
import the component, when its API last moved, whether an open question still
hangs over it — and `npm run ia:check` fails on a phase with no evidence
behind it. A label nobody can check is a label nobody should trust.

## Governance

| | |
|---|---|
| Source of truth | `src/theme/` and the components in `src/ui`. This site describes them; it does not define them |
| Where a decision is recorded | In the code, at the rule it governs — and in a dated note under `docs/` when a reader would otherwise have to re-derive it |
| Judgement | Allowed where nothing else answers, and **labelled as judgement** where it is used |
| Versioning | A token or rule change is a minor version; a change that requires screens to be rebuilt is a major one |

**Three rules that keep this documentation true:**

1. **A magic number needs a note** saying what was measured.
2. **A comment states what was measured, not what was intended.** Three
   corrections in this project came from a comment describing behaviour the
   code did not have.
3. **The living page beats the document.** The specimen renders the real
   components; if the two disagree, the specimen is right and the page is
   stale.
