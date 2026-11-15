# Tools

What this system actually ships, rather than what a design system is usually
expected to ship. There is no Figma library, no ESLint plugin and no Storybook
addon here. There are eleven checks, four generators and a bridge — and the
checks are the part worth copying.

## The checks

Eight guard the product, three guard this documentation. The split between
them is deliberate: the hook runs what is cheap enough to be certain about
before a push, and the slow ones run in CI, because a ten-minute wait on every
push is a hook people disable in a week.

| Check | What it measures | Runs in |
|---|---|---|
| `contrast:check` | 184 token pairs in both themes, resolved out of `tokens.css` with no browser. Self-tests by planting a failing pair | pre-push |
| `css:orphans` | Declared classes nothing uses, and classes built at runtime that only look orphaned | pre-push |
| `css:consistency` | Values off the scale, colours duplicating a token, `!important`, and Kendo selectors with no `.vy-` ancestor | pre-push |
| `ia:check` | The site tree against the code: every page reachable, every component's library verified against its own imports | pre-push |
| `tokens:build` | Every token declaration rebuilt from the parsed model and compared to the line it came from — 414 of 414 | pre-push |
| `render:check` | A state painted as its own backdrop, or as another state's | CI |
| `touch:check` | Touch targets against the floor | CI |
| `mobile:check` | The content box at twelve widths | CI |
| `focus:check` | Every control focused one at a time, in three passes | CI |
| `hover:check` | Hover states that move layout | CI |
| `border:check` | Every line against the border scale | CI |
| `grid:check` | Sixteen column minimums across six routes | CI |
| `deploy:check` | The deployed site: every asset a page references, resolved against the URL the browser ends on, answering the right content type | by hand, after a deploy |

`deploy:check` exists because every other check walks files. One of them
verified sixteen thousand links on disk, all correct, while the site served
with no stylesheet at all — the fault was in the hosting, and only a real
request could see it.

## The generators

| | |
|---|---|
| `md-doc.mjs` | Markdown to a single self-contained HTML file, images inlined. Feeds the handover PDF |
| `ds-site.mjs` | This site: the tree, tabs, search index, live example frames |
| `tokens-build.mjs` | The token table and the machine-readable export, from the CSS |
| `capture-*.mjs` | Photographs components **inside the real product**, in both themes |

Both the site and the single-file handover come from one renderer, so they
cannot drift.

## The bridge

The live system already ships KendoReact 16. The bridge is three files:

| File | Job |
|---|---|
| `kendo-subset.scss` | Compiles only the Kendo components actually used |
| `_kendo-size.scss` | **Configures** Kendo's size scale — does not override it |
| `kendo-bridge.css` | Maps Kendo's variables onto ours, and fixes what cannot be configured |

**Specificity is the trap.** `.k-button.k-button-solid.k-button-base.k-focus`
weighs (0,4,0), so a one-class rule of ours loses silently. The bridge
prefixes with `html[data-kendo-bridged]` rather than repeating a class five
times.

Two Kendo behaviours worth knowing before debugging a component:

- **Kendo disables with a `.k-disabled` CLASS, not the `:disabled`
  attribute.** A plain `<input disabled class="k-radio">` renders identically
  to an enabled one.
- **KendoReact 16 locks grid columns with sticky cells in one table**
  (`position: sticky`), not with two panes.
