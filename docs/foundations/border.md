# Border

`border` is **structure** — panel edges, table rules — which WCAG 1.4.11 does
not cover. `border-control` is the boundary of something you can **operate**,
which it does cover.

It is one of two values in the system chosen by **measurement** rather than by
the ramp — the other is [`on-surface-subtle`](color/index.md#text-colour--six-tiers).
The sweep of 5 September found why: the grey ramp has **no step that
conforms**. grey-400 `#97a2b2` is 2.58:1 against white and misses by 0.42; the
next step overshoots to 5.24, where it would be indistinguishable from the
text it sits beside. A value was introduced between them. It governs
boundaries only: input, textarea, combobox, checkbox, radio, and anything
else whose edge is its shape — a chip, an outlined button, a colour swatch.

> **"The lightest value that conforms" conformed against one ground, and that
> took until 8 November to notice.** The September value, `#8a94a6`, was
> measured on white. A control also sits on the page, in a sunken strip, on a
> hover tint, on a selected row. Swept across every ground on 8 Nov it cleared
> exactly one of them:
>
> | surface | subtle | app | hover | selected | sunken | strong |
> |---|---|---|---|---|---|---|
> | 3.06 | 2.98 | 2.85 | 2.85 | 2.78 | 2.65 | 2.35 |
>
> Which is how a checkbox measured **2.85** in the control sweep while the
> Kendo bridge was already pointing it at this token: the token was right and
> the value was short. **A boundary is set by its worst ground**, the same
> rule as a text tier. `#758096` is the lightest value on the same hue and
> saturation line that clears 3 on all of them, tightest at **3.05** on
> `surface-strong`. `contrast:check` now measures every boundary against
> every ground rather than against the panel, so this cannot come back.

> **And then the same mistake, one state along — 9 November.** 1.4.11 covers a
> control's **states**, and both checks were resting-state only: one reads the
> palette, the other sweeps a page nobody is pointing at. `.vy-input:hover`
> and `.vy-sup-btn:hover` drew their edge with `--vy-border-heavy`, and the
> comment beside the rule explains itself in light mode alone — *"grey-500,
> not grey-400; the resting border is now darker than grey-400, so the old
> hover was lighter than the state it was meant to emphasise."* True on white.
> In dark the resting border is `#707c8d` and grey-500 is **darker** than it,
> so one declaration made the hover both fainter than the resting state and
> non-conforming: measured in the running build at **2.68** on the panel, 2.41
> on a raised one, **2.02** on `surface-strong`.
>
> **One value cannot do it**, for the reason [Brand and danger](color/index.md#brand-and-danger)
> already gives about fill and text: *more visible* is darker on white and
> lighter on near-black. So the hover boundary is a role of its own. Light
> takes grey-500 from the ramp — 5.24 on a panel against the resting 3.97, so
> **nothing changes in light**. Dark has no step that works: grey-500 and
> `border-mid` are darker than the resting border, and grey-400 is lighter
> than `on-surface-subtle`, which would leave a hovered edge outshining the
> quietest text on the page. `#858f9e` is one notch up `border-control`'s own
> hue and saturation line — **5.23** on a panel, **3.95** on `surface-strong`,
> within 0.07 of what light gets. Both themes now land a hovered boundary at
> about 4:1 on their worst ground.
>
> Measured on `.vy-input`, both themes, with transitions stopped:
>
> | | rest | hover, was | hover, now | focus, was | focus, now |
> |---|---|---|---|---|---|
> | light | 3.97 | 5.24 | 5.24 | 4.48 | **6.82** |
> | dark | 4.04 | **2.68** | **5.23** | 3.82 | **9.58** |
>
> `border:check` now sweeps **three states**, so the next one is not found by
> hand. The full list, and the three attribute-borne states it still cannot
> reach, is in [`vien-state-09nov.md`](../vien-state-09nov.md).



| Token | Value | Resolves to | Dark |
|---|---|---|---|
| `--vy-border-control` | `#758096` | — | `#707c8d` |
| `--vy-border-control-hover` | `var(--vy-grey-500)` | `#626d7e` | `#858f9e` |
| `--vy-border-faint` | `var(--vy-grey-100)` | `#eceff3` | `#212936` |
| `--vy-border` | `var(--vy-grey-200)` | `#dde2e9` | `#2a323f` |
| `--vy-border-strong` | `var(--vy-grey-300)` | `#c3cbd6` | `#3b4553` |
| `--vy-border-mid` | `var(--vy-grey-400)` | `#97a2b2` | `#55606f` |
| `--vy-border-heavy` | `var(--vy-grey-500)` | `#626d7e` | `#55606f` |
| `--vy-border-emphasis` | `2px` | — | *(same)* |


