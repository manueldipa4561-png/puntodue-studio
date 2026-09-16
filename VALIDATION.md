# Validation scope

## Automated checks

The current production architecture is a lightweight static multipage site. The portfolio upgrade preserves the existing interaction/privacy layers and adds source checks for the five-project portfolio.

Available checks:

- `node --check site-v4.js`
- `node --check dual-field-v5.js`
- `node --check brief.js`
- `node tests/interactions.cjs`
- `node tests/brief.cjs`
- `node tests/experience.cjs`
- `python tests/check_site.py` (requires `lxml`)

`tests/check_site.py` now validates the current site rather than the superseded four-package homepage. It checks:

- unique IDs and primary heading structure;
- the three premium homepage territories: NODO, INNESTO and TRAMA ZERO;
- the five-project `/progetti.html` architecture;
- the exact five live-demo destinations;
- explicit independent-demo disclosure language;
- local asset/style/script references;
- `noopener` protection on external blank-target links;
- lazy/async loading attributes on archive preview media;
- inclusion of `site-v7.css` and its reduced-motion fallback;
- native cookie-preferences dialogs and dialog-only forms;
- canonical/Open Graph metadata;
- sitemap inclusion for homepage, projects and Cookie Policy.

## Portfolio performance safeguards

The three new premium project identities are drawn with native CSS/DOM geometry rather than video, WebGL or externally generated media. This keeps the portfolio editable and responsive while avoiding extra network payloads, autoplay media and continuous render loops.

Motion is limited to transform/opacity-style decoration and hover feedback. `prefers-reduced-motion: reduce` disables the non-essential portfolio animation and transition layer.

## Cookie / storage state

The source does not intentionally install analytics, advertising or profiling tools and does not use `localStorage`, `sessionStorage` or `document.cookie` for the current portfolio experience. The cookie UI therefore remains informational and does not manufacture optional consent categories.

## Browser verification boundary

Repository/source validation and Figma visual review are available in the connected tool environment. A local clone/browser run cannot be claimed when the execution sandbox cannot resolve GitHub over normal network DNS.

Accordingly, do not describe this pass as measured Core Web Vitals testing, physical-device QA or exhaustive cross-browser rendering unless those checks are run separately in an environment with browser/network access.
