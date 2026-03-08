# Architecture — Aviation Legislation Digital Index

## File structure

```
/index.html            HTML structure (~400 lines)
/assets/styles.css     All CSS — themes, layout, components, responsive (~400 lines)
/assets/app.js         All JS — interactions, search, state (~700 lines)
/docs/architecture.md  This file
/tasks/todo.md         Planning checklist
/.claude/              Project rules + skills
/.gitignore            Excludes backup files + local settings
```

No build tools, frameworks, or npm. Open `index.html` by double-clicking.

## How it works

### Theming
- CSS custom properties on `[data-theme="dark"|"light"]` selectors in `styles.css`.
- **Auto-detect on first visit**: OS `prefers-color-scheme` > time-of-day fallback (6am–6pm = light, else dark).
- **Manual toggle**: `toggleTheme()` swaps the `data-theme` attribute and persists to `localStorage` (`avTheme` key). Saved preference is used on return visits.
- Theme toggle switch is visible on all screen sizes (only the emoji label is hidden on small phones).

### Layout
- **Topbar** (fixed): logo, search input, Zulu clock, theme toggle.
- **Home view** (`#homeView`): shelf (3D book cards), popular sections, recent items.
- **Section views** (`#sec-international`, `#sec-primary`, `#sec-casr`, `#sec-mos`, `#sec-caos`, `#sec-supporting`): category detail pages with legislation cards and CASR/CAO accordion.
- **Search results view** (`#sec-search`): shown when results span multiple sections.
- **Footer** + back-to-top button (`#btt`).

### Navigation
- Single-page app pattern — `showHome()` / `showSection(id)` toggle visibility via `display` and `.active` class.
- No `#hash` routing; purely JS-driven.

### Shelf (3D curved bookshelf)
- 7 book buttons split across two `.shelf-arc` rows (top: 4, bottom: 3) inside a `.shelf-scene` wrapper.
- Each row has a `.shelf-rail` (decorative wooden ledge) and a `.shelf-grid[data-row]` with books arranged in a curved arc via per-child `rotateY` + `translateZ` transforms.
- Each book has three sub-elements: `.shelf-book-spine` (left 3D edge), `.shelf-book-cover` (front face with title/tag), `.shelf-book-edge` (right page-edge).
- Section colors (international=blue, primary=gold, casr=green, mos=crimson, supporting=purple) applied to cover + spine via `data-section`.
- **Open interaction**: hover lifts book up (`translateY(-18px)`). Click triggers a "reach" animation (book lifts further + scales up over 350ms), then FLIP animation flies `.book-viewer-book` from the lifted position to viewport center, then 3D cover opens on left-edge hinge (`rotateY(-160deg)`).
- `closeBook()` reverses: cover closes, FLIP flies back, source card restored with reaching class cleaned up.
- Active source card is hidden with `opacity:0`, `tabindex="-1"`, `aria-hidden="true"`.
- Focus trapped inside viewer (Tab cycles, Esc closes).
- All events bound via JS delegation on `.shelf-scene` — no inline `onclick`.
- Filter tabs toggle `data-filtered-out` attribute for CSS opacity animation.

### Search
- **Search Index**: `buildSearchIndex()` runs once at page load, scanning all `.cp` and `.leg-card` elements into a `searchIndex` array. Each entry stores code, title, sectionId, icon, type, DOM reference, and a lowercase haystack string.
- **Predictive Dropdown**: As the user types, `showDropdown(q)` filters the search index and renders up to 20 grouped results in a `.search-dropdown` below the input. Keyboard navigation (ArrowDown/Up/Enter/Escape) and click-to-navigate are supported. `navigateToItem()` jumps to the section and opens the accordion if needed.
- **Section Filter Chips**: A `.search-filters` bar (fixed below topbar) with chip buttons for All, ICAO, Acts, CASR, MOS, CAO, Supporting. Clicking a chip sets `activeSearchFilter` and re-runs both dropdown and full search. Visible when search input is focused.
- **Full Search**: `handleSearch(q)` runs on every keystroke against `data-search` attributes + text content, filtered by `activeSearchFilter`.
- Single-section results: navigates to that section, hides non-matching cards/accordion parts, applies text highlights.
- Multi-section results: clones matching elements into `#sec-search` with section counts breakdown and text highlights.
- **Text Highlighting**: `highlightText(container, words)` wraps matched text in `<mark class="search-hl">` within `.leg-card-title`, `.leg-card-desc`, `.ct`, `.cn`, `.sn` elements. `clearHighlights()` removes all marks.

### CASR accordion
- `.cp` panels toggled via `tog(el)` — sets `.open` class which triggers `max-height` CSS transition.
- Opening a part adds it to recent items in `localStorage` (`avRecent` key).

### Recent items
- Stored in `localStorage` as JSON array (max 8 entries).
- Tracks: book opens, accordion opens, and external link clicks.
- Rendered as pill buttons on home view.

### Mobile responsiveness
- Three breakpoints: 1024px (tablet), 768px (mobile), 480px (small phone).
- Accordion items wrap on narrow screens; section headers and fonts scale down.
- Shelf tabs left-align with horizontal scroll on mobile.
- Search dropdown scales down; section badges hidden on mobile.
- Filter chips scroll horizontally with smaller sizing.
- Theme toggle stays visible on all sizes; emoji label hidden on small phones.

### External dependencies
- Google Fonts: Outfit (body) + JetBrains Mono (code/clock).
- No other external resources.

## Deployment
- **GitHub repo**: https://github.com/cnabarrier/Digital-Index
- **Live site**: https://cnabarrier.github.io/Digital-Index/ (GitHub Pages, served from `master` branch root)
- Push to `master` auto-deploys to GitHub Pages (takes ~1 minute).

## Key conventions
- All JS functions are global (no modules). Events are bound via delegation in an init block at the end of `app.js` — no inline `onclick` in HTML.
- CSS class names are short and stable (`.cp`, `.ch`, `.cn`, `.ct`, etc.).
- IDs are stable and referenced by both HTML and JS.
