# These stylesheets are copies

Everything in this folder is copied from the EmpowerSDGs x THUAS design system, so
that the prototype does not reach across folders at runtime
(`design/platform-phase-a.md`, section 9). The originals live at:

    OneDrive - De Haagse Hogeschool/House Style/THUAS systems/empowersdgs

with `styles.css` as the entry point and `readme.md` as the statement of rules.

Copied on 29 September 2026:

| Here | Original |
| --- | --- |
| `styles.css` | `styles.css`, unchanged |
| `tokens/colors.css`, `layout.css`, `type.css`, `base.css` | `tokens/`, unchanged |
| `tokens/fonts.css` | `tokens/fonts.css`, **changed**: Archivo and Archivo Narrow load from local files instead of Google Fonts, because the prototype makes no network calls; and, since 2 October 2026, the display face is Outfit in place of GT Walsheim Pro |
| `css/components.css` | `css/components.css`, unchanged |
| `assets/fonts/GT-Walsheim-Pro-*.otf` | `assets/fonts/`, unchanged |
| `assets/fonts/archivo-*.woff2` | Not in the design system. From the npm packages `@fontsource/archivo` and `@fontsource/archivo-narrow`, SIL Open Font License |
| `assets/fonts/outfit-latin-400-normal.woff2`, `outfit-latin-600-normal.woff2`, `LICENSE-outfit-OFL` | Not in the design system. From the npm package `@fontsource/outfit` 5.2.5 through jsDelivr, SIL Open Font License, downloaded 2 October 2026. The display face for print and screen since then (Ashley's decision of 2 October); the GT Walsheim Pro files are kept as copies but no longer used |

Not copied, because they do not carry over (`design/basis.md`): the logos, the
EMPOWERSDGs wordmark, the SDG wheel, and the Systems Workbook app.

If the originals change, copy them again. Do not edit the copies, apart from
`tokens/fonts.css` as described. Anything the prototype adds lives in
`../src/app.css`.
