# For developers

1. **Is there a token?** If yes, use it. If no, add one — and say in the code
   why the scale did not already have it.
2. **Do not invent content.** Field names, option lists, status words and
   behaviour are facts about the business, not design decisions. Look them up
   before drawing them.
3. **Both themes, both densities, 820px.** A screen that has only been seen in
   light mode on a 1920px monitor has been seen once.
4. **A magic number carries a note.** A width that deviates from its role
   needs a `widthNote` saying what was measured.
5. **Say what is not real.** A derived figure, an unbuilt action and a fake
   send are each labelled where they appear, not only in a commit message.

**A colour token**
1. Add or change it in **all three** blocks of `tokens.css` ([B1.8](../foundations/color/index.md#how-dark-mode-is-wired)).
2. If it lands on text or a control boundary, re-run the contrast sweep.
3. `npm run check:fast` — lint, stylesheet check, typecheck, build.

**A component**
1. Check whether Kendo already does it ([E2](../tools.md)).
2. Build it in `src/ui`, referencing semantic tokens only.
3. Add a specimen to `/design-system` if it has states worth seeing.
4. Cover every state: default, hover, focus, active, disabled, busy, error.

**A new screen**
1. Which of the four states ([D5](../patterns/screen-states.md)) can it be in? Build all of them.
2. Column roles, not pixel widths.
3. Check it at 1180, 980 and 820, in both themes.

**What CI runs on every push:** `contrast:check` (inside `css:check`, so it
gates the build) · `render:check` · `touch:check` · `mobile:check` ·
`focus:check` · `hover:check` · `border:check`.
