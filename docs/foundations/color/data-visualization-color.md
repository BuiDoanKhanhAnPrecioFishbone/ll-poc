# Data visualization

| Token | Value | Resolves to | Dark |
|---|---|---|---|
| `--vy-chart-cancelled` | `var(--vy-grey-700)` | `#363e4b` | `#5d6878` |
> **A fill that carries no text takes the `-fg` half, not the `-bg` one.** The
> Home chart draws each series from this vocabulary, and a segment is not a
> chip: `-bg` is pale by design, because text sits on it. Measured on 9
> November, the In-Progress series read `--vy-status-progress-bg` and came to
> **1.12:1** against the light card and **1.37:1** against the dark one. The
> five chart fills are now in `contrast:check` for exactly that reason —
> nothing had ever measured a shape with no text on it.
>
> `--vy-chart-cancelled` is the one chart-only value. As badges, New and
> Cancelled sit on separate rows and a near-identical grey costs nothing; in a
> stacked bar they touch, and the badge greys are 1.35:1 apart in light and
> **identical** in dark. The badge tokens are the customer's specification and
> stay as they are. See [Dashboard](../../patterns/dashboard.md).
