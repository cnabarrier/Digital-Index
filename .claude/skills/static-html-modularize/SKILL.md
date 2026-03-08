---

name: static-html-modularize

description: Split a single-file HTML prototype into HTML+CSS+JS (static, no build step). Use when code is getting too large or agents need clean separation of concerns.

---



\## Goal

Keep the site runnable by opening `index.html` directly, but separate concerns:

\- `index.html` only structure and links to assets

\- `assets/styles.css` all CSS

\- `assets/app.js` all JS behaviors

\- optional `assets/data.js` for content arrays / configuration



\## Rules

\- Do not change UI appearance or behavior unless explicitly requested.

\- Move code, don’t rewrite it.

\- Keep IDs/classes stable.

\- No frameworks. No bundlers. No npm. Plain HTML/CSS/JS only.



\## Procedure

1\. Create `/assets/` and move CSS into `assets/styles.css`.

2\. Move JS into `assets/app.js`. Ensure functions referenced by HTML remain global (attach to `window` if needed).

3\. If large hardcoded content blocks exist, move the data into `assets/data.js` and render it from JS, but ONLY if it reduces duplication.

4\. Verify:

&nbsp;  - No console errors

&nbsp;  - Search works

&nbsp;  - Theme toggle works

&nbsp;  - Navigation works

&nbsp;  - Mobile layout still works



\## Output

\- Provide a short summary of moved sections and new file paths.

\- Update `docs/architecture.md` with the new structure.

