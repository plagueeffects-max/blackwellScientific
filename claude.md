# Project Context – BlackwellScientific

## Overview
The **BlackwellScientific** repository is a lightweight, client‑side web application that visualises scientific/DNA‑related information.  It is built entirely with vanilla HTML, CSS and JavaScript and is intended to run as a static site (e.g. GitHub Pages, Netlify, Vercel).  The goal is to have a **production‑ready, performant, and visually premium** experience with smooth animations, responsive design, SEO‑optimised markup, and a clear separation of concerns so that future contributors (including Claude) can easily extend or refactor the code.

---

## Directory Structure & File Responsibilities
```
blackwell/
├─ .git/                     ← Git metadata
├─ .gitattributes            ← Line‑ending & diff settings
├─ .gitignore                ← Files/folders ignored by Git
├─ .vscode/                  ← VS Code workspace settings
├─ copy_images.js            ← Utility script that copies image assets from
│                              `data/` to the public `logos/` folder during
│                              local development (used by CI/CD pipelines).
├─ css/                      ← All styling files (global, component, and
│   ├─ reset.css            ← CSS reset / normalize
│   ├─ layout.css           ← Grid/flex layout helpers
│   ├─ typography.css       ← Font imports (Google Fonts: Inter, Outfit)
│   ├─ theme.css            ← Dark‑mode colour tokens, gradient utilities
│   └─ animation.css        ← Keyframes, scroll‑triggered animations
├─ data/                     ← JSON / CSV data sources (e.g. gene‑info, UI
│                              configuration, mock API responses)
├─ image_4e426d.png          ← Example asset used on the landing page
├─ index.html                ← **Home page** – entry point, loads the main UI
│                              (hero section, navigation, interactive DNA
│                              visualisation).  Includes the primary script
│                              bundle (`js/main.js`).
├─ js/                       ← JavaScript source files
│   ├─ main.js               ← Bootstraps the app, initialises DOM refs,
│   │                          registers event listeners, and triggers the
│   │                          first animation frames.
│   ├─ scrollHandler.js      ← Handles smooth scroll‑based reveals, parallax
│   │                          effects, and lazy‑loading of sections.
│   ├─ animationEngine.js    ← Central animation engine – uses
│   │                          `requestAnimationFrame` and CSS‑custom
│   │                          properties to animate DNA strands, particle
│   │                          effects and logo transitions.
│   ├─ dataLoader.js         ← Fetches JSON from `data/`, caches it in
│   │                          `localStorage`/IndexedDB for offline use.
│   ├─ uiComponents.js       ← Re‑usable UI helpers (modal, tooltip, toast).
│   └─ utils.js              ← Small utility library (debounce, throttle,
│                              query selector shortcuts).
├─ logo_white.png            ← White version of the brand logo (used on dark
│                              backgrounds).
├─ logos/                    ← Folder for generated logo assets (populated
│   └─ …                     ← by `copy_images.js` during build).
├─ mydna.html                ← **Secondary page** that displays a detailed
│                              DNA‑analysis view.  Imports the same CSS and
│                              JS bundle but adds page‑specific sections
│                              (gene table, interactive chromosome map).
└─ README.md                 ← Project description, setup instructions.
```

---

## Core Functional Areas
| Area | Primary Files | Description |
|------|---------------|-------------|
| **Landing Page UI** | `index.html`, `css/layout.css`, `css/theme.css`, `js/main.js` | Renders the hero banner, navigation bar, and introductory content.  Applies the dark‑mode theme and triggers the initial page‑load animation (logo fade‑in, background gradient shift). |
| **Scroll‑Based Animations** | `js/scrollHandler.js`, `css/animation.css` | Listens to `window.scroll` events, calculates element visibility, and adds CSS classes (`.animate‑fade`, `.animate‑slide`).  Supports lazy‑loading of heavy SVG assets for performance. |
| **DNA Visualisation Engine** | `js/animationEngine.js`, `js/utils.js` | Generates SVG/Canvas‑based DNA helices, animates nucleotide particles, and synchronises with user interaction (hover, click).  Uses requestAnimationFrame for smooth 60 fps motion. |
| **Data Loading & Caching** | `js/dataLoader.js`, `data/` folder | Loads static JSON files (`genes.json`, `config.json`) via `fetch`.  Caches results in `localStorage` with a TTL to minimise network‑round‑trips. |
| **Secondary Page – MyDNA** | `mydna.html`, `js/uiComponents.js`, `js/main.js` (re‑used) | Provides a deeper dive into a sample DNA profile.  Includes a searchable gene table, a chromosome‑map canvas, and a download‑PDF button. |
| **Asset Management** | `copy_images.js`, `logos/` | Simple Node script used in CI to copy image assets from the `data/` directory into `logos/` so they are available as static resources for the site. |
| **Theme & Styling** | `css/theme.css`, `css/typography.css` | Defines colour tokens (primary, secondary, accent), gradient backgrounds, dark‑mode media query, and imports Google Fonts (Inter, Outfit).  All components reference CSS variables (`--color-primary`, `--gradient-bg`) for easy theming. |
| **Build / Deployment** | `package.json` (if present), CI config (GitHub Actions) | Although the repo is a static site, a minimal npm script (`build`) can run `copy_images.js` and a CSS minifier.  Deployment to GitHub Pages is configured via the `gh‑pages` branch or Netlify build settings. |

---

## Current State & Known Gaps (for Claude to improve)
1. **Animation Performance** – Some scroll animations trigger layout thrashing.  Replace direct DOM style changes with CSS classes or the Web Animations API.
2. **Responsive Design** – Media queries exist but mobile breakpoints need refinement (e.g. navigation collapses, DNA visualisation canvas size).
3. **Accessibility** – No `aria‑` attributes on interactive elements, missing alt text for images, and color contrast should be audited.
4. **SEO** – `index.html` lacks proper `<title>`, meta description, Open Graph tags, and structured data (`schema.org`).
5. **Modularisation** – JavaScript files are monolithic; consider splitting the animation engine into separate modules (e.g. `helixRenderer.js`, `particleSystem.js`).
6. **Testing** – No unit or integration tests.  Add Jest + jsdom tests for data loading and UI component rendering.
7. **Error Handling** – `dataLoader.js` does not currently surface network errors to the UI.
8. **Build Optimisation** – CSS not minified, JS not bundled; set up a simple bundler (esbuild/rollup) for production builds.
9. **Internationalisation** – Text strings are hard‑coded in HTML; move to a JSON‑based i18n dictionary for future localisation.
10. **Analytics** – No analytics snippet; consider adding a privacy‑friendly analytics solution (e.g. Plausible, Umami).

---

## Desired Production‑Ready Vision
- **Zero‑lag UI**: All animations run at 60 fps on modern browsers, with graceful fallback on low‑end devices.
- **Full Accessibility**: WCAG 2.1 AA compliance, screen‑reader navigation, focus‑visible outlines.
- **SEO‑Optimised**: Structured meta tags, sitemap.xml, and fast LCP (< 1 s).
- **CI/CD**: Automated linting (`eslint`), formatting (`prettier`), build validation, and deployment to GitHub Pages on each push.
- **Scalable Architecture**: Ability to swap the static JSON data source for a real API without code changes, thanks to the abstraction in `dataLoader.js`.
- **Maintainable Codebase**: Clear module boundaries, comprehensive JSDoc comments, and style guide enforced via ESLint.

---

## Actionable Checklist for Claude (or future developer)
1. **Audit & Refactor Animations**
   - Replace direct style manipulations in `animationEngine.js` with CSS‑custom‑properties and `animate()`.
   - Debounce scroll events in `scrollHandler.js` using the utility in `utils.js`.
2. **Responsive Enhancements**
   - Add mobile‑first breakpoints in `css/layout.css`.
   - Ensure the canvas in `mydna.html` scales with viewport (use `viewBox`).
3. **Accessibility Overhaul**
   - Add `role`, `aria-label`, and `alt` attributes.
   - Verify colour contrast with a tool (e.g., axe‑core).
4. **SEO & Metadata**
   - Populate `<title>`, `<meta name="description">`, Open Graph tags in both HTML files.
   - Generate `sitemap.xml` and `robots.txt` via a simple script.
5. **Modularise JavaScript**
   - Create `js/helixRenderer.js`, `js/particleSystem.js` and export functions.
   - Update `main.js` to import the new modules (ESM syntax).
6. **Introduce Build Pipeline**
   - Add `package.json` scripts: `build`, `lint`, `test`.
   - Use `esbuild` to bundle/minify JS, `postcss` for CSS.
7. **Testing Suite**
   - Write Jest tests for `dataLoader.js` (mock fetch) and UI component rendering.
8. **Error & Loading UI**
   - Show a spinner while data loads; display friendly error toast on failure.
9. **Internationalisation Stub**
   - Add `i18n/en.json` and a small `i18n.js` loader; replace text nodes with look‑ups.
10. **Analytics Integration**
    - Insert Plausible script with `data-domain="blackwellscientific.com"`.

---

## How Claude Can Use This File
- **Contextual Prompting**: Paste this `claude.md` into Claude’s prompt to give the model full project insight.
- **Targeted Refactoring**: Ask Claude to rewrite specific modules (e.g., “Rewrite `animationEngine.js` to use the Web Animations API”).
- **Documentation Generation**: Use Claude to expand JSDoc comments, generate a `README.md` with setup steps, or produce a `CHANGELOG.md`.
- **Feature Ideation**: Request ideas for new interactive components (e.g., an interactive gene‑edit simulation) that match the existing architecture.

---

*Prepared for Claude‑code to accelerate the path to a polished production release.*
