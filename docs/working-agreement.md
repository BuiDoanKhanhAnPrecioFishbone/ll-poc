# Working agreement

How screens get specified, built and reviewed in this repo.

The failure this exists to prevent: **a mockup that looks right and cannot be maintained.**
It has two forms, and the second is the more common one.

1. The screenshot shows something Kendo can't do, so the tempting move is CSS that fakes it.
2. The screenshot shows something Kendo *might* do, so the tempting move is a prop that sounds
   plausible — `<Grid stickyHeader>`, `<TabStrip scrollable>` — and doesn't exist.

Both produce code that demos fine and rots. The protocol below forces each into the open.

---

## 1. How you brief a screen

```
SCREEN:     <name the customer uses>
ROUTE:      /path
USERS:      <which role, what they're doing here>
FREQUENCY:  daily / weekly / rare
TASKS:      1. …   (priority order — the first one wins every layout argument)
            2. …
DATA:       <field> | <type> | <sortable? editable? conditional colour?>
PAIN:       - …
WANT BACK:  recommendation only | component code | full screen
```

Plus a screenshot if you have a target design.

**I fill in what I can observe myself.** Route, data, column types, enum values, current
defects and measurements come from the live system — I don't need you to type them. What I
genuinely cannot observe is **USERS, FREQUENCY, TASKS in priority order**, and **WANT BACK**.
Those four are the brief. If you give me only those, that's enough.

## 2. What I return, in this order

1. **UX read** — what's wrong and why, before any code.
2. **Kendo component map** — every component named explicitly with its import path, verified
   against the version installed in `package.json`. No component or prop appears in the map
   unless I have confirmed it exists in that version.
3. **The code** — TSX, classes from the stylesheet, values from tokens.
4. **GAP list** — anything the design needs that Kendo doesn't ship.

## 3. The GAP rule

If a design needs something Kendo can't do, I don't quietly write custom CSS. I raise it:

> **GAP-01 — fixed-width status pill.** Kendo `Badge` sizes to content; the brief requires
> constant width. Options: (a) accept variable width, (b) ~12 lines in the stylesheet,
> (c) fixed-width column with `Badge` inside. Recommend (b). Needs approval.

You approve or reject each one. Approved gaps are logged in [`gap-register.md`](gap-register.md)
and the CSS carries a comment naming the GAP number, so every custom rule traces to a decision.

A gap is also the honest answer when Kendo *can* do it but only via an undocumented internal
class. Depending on `.k-grid-header-wrap` is a gap, not a solution.

## 4. Two things I won't do unless you override me

**No static inline styles.** `style={{ padding: 12 }}` in a component is how a themed app
becomes unthemeable.

*Carve-out:* a style attribute is allowed when the value is computed at runtime **and**
interpolates a token — `style={{ background: \`var(${tokenName})\` }}`. A page that renders the
token palette cannot work any other way. Static values are never allowed.

**No raw hex, px, or font-weight outside the token file.** Every colour, size, radius and
weight resolves to a custom property. This is the rule most likely to be violated by accident,
so it is the one worth policing.

*Carve-out:* structural CSS with no design intent — `1px` hairline borders, `100%`, `0`,
`50%` for a circle — is not a design token. Everything with a design opinion is.

*Known exception:* `@media` cannot read custom properties, so breakpoint values stay raw and
are commented where they appear.

## 5. Evidence rule

Any number I state about the current system carries its source and date. "Clipped in 85% of
rows" means I measured it in the rendered DOM, not that it looked bad. If I haven't measured
it, I say "appears to" and mark it unverified. If I haven't opened a screen, it goes in
"not examined" rather than being described.

## 6. Verification rule

A screen isn't delivered until it has been built and driven in a browser, with the claim
measured — column widths, clip ratios, row counts, contrast ratios. "It compiles" is not
"it works".
