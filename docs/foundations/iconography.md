# Iconography

One set. **20×20 viewBox, stroke only, no fill, one stroke weight.** A heavier
line at a smaller size is how an icon set stops looking like one set.

An unknown name renders **nothing**, with the name left in the DOM, rather
than falling back to a document glyph that hides the bug.

| | |
|---|---|
| Default size | 16px · `--vy-icon-sm` |
| In a grid row | 15px inside a 26px button |
| Colour | `currentColor` — the icon takes the text colour around it |
| Decorative | `aria-hidden`, and the state it marks gets words of its own |

**The 45 names:**
`task · chat · log · quote · order · return · customer · requisition ·
supplier · factory · simulate · bom · transfer · adjust · pcb · tool ·
machine · invoice · journal · lock · people · template · job · plug · menu ·
globe · metadata · queue · doc · home · sell · buy · parts · stock · make ·
finance · insight · settings · chevron-down · chevron-right · eye · download ·
clip · trash · check`

Two directional glyphs, each with one job: **down** opens a menu below itself,
**right** says "this opens somewhere else".
