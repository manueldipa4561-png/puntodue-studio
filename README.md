# Punto Due Studio

Italian boutique web-studio website. Production remains a lightweight static HTML/CSS/JavaScript site with no framework, build step or runtime dependency.

## Local preview

Run `python -m http.server 8000` from the repository root, then open `http://localhost:8000`.

## Deployment

Netlify deploys `main` and serves the repository root as configured in `netlify.toml`. Domain and HTTPS settings are managed outside this repository.

## Experience architecture

- `index.html`: cross-sector positioning, interactive Dual Field hero, selected-work portfolio and production contact paths.
- `progetti.html`: five-project demonstration portfolio. NODO, INNESTO and TRAMA ZERO are the premium featured concepts; Beer Hops and Cultura Tattoo remain visible as additional concept work.
- `progetti/nodo.html`, `progetti/innesto.html`, `progetti/trama-zero.html`: individual concept case studies with explicit independent-demo disclosure.
- `site-v4.css`: shared responsive foundation.
- `site-v5.css`: core Punto Due visual system.
- `site-v6.css`: positioning/call-experience refinements loaded by `site-v4.js`.
- `site-v7.css`: “Projects as Digital Territories” portfolio system using native CSS/DOM artwork rather than heavy media.
- `site-v8.css`: case-study layout and progressive portfolio micro-motion.
- `site-v8-benchmark.css`: editorial proof/benchmark refinements derived from the agency reference study without copying source layouts or code.
- `site-v9.css`: current typography and v10-refined spatial-text styling. Instrument Sans is used for editorial/display/UI typography and IBM Plex Mono for technical metadata; both are requested through Google Fonts.
- `site-v4.js`: shared navigation, reveal, cookie-dialog and contact-flow interactions; it also loads the current type/depth layer on site pages.
- `site-v9.js`: founder-name routing plus the v10 motion system: spring-smoothed 3D typography, pointer-responsive perspective origin, subtle scroll depth, tactile adjacent controls and reduced-motion-safe behavior.
- `portfolio-v8.js`: case-study/portfolio pointer motion and progress feedback.
- `dual-field-v5.js`: interactive hero object.
- `brief.js`: local-only WhatsApp message composer; nothing is submitted or stored by the site.
- `cookie-policy.html`: factual cookie/storage/external-resource disclosure for the current implementation.
- `404.html`: branded static 404.
- `assets/`: local brand/social assets and historical demo previews.

## Motion system

The current typography motion pass uses one shared interaction grammar across homepage, Studio, Contact, Call and case-study pages:

- pointer input is normalized against the surrounding stage instead of the glyph bounds, preventing twitchy edge behavior;
- spring interpolation provides visible inertia and soft settling instead of direct cursor snapping;
- perspective origin follows the pointer at a restrained amplitude;
- the foreground text, depth layer and highlight layer respond at different rates to create tactile depth without becoming an effect showcase;
- major hero/statement/section/compact headings use different intensity profiles while sharing the same physics;
- touch devices receive only a low-amplitude scroll-depth response;
- buttons, direct-contact cards, case-next links and text links receive a small matching physical response;
- `prefers-reduced-motion: reduce` removes transforms, pseudo-depth layers and motion transitions.

## Founder identity rule

Visible founder names are intentionally concentrated in the two numbered cards on `/studio.html` rather than repeated across navigation, contact, call and footer surfaces.

- 01 — Manuel Di Paolo — Creative Director & Lead Developer
- 02 — Nicolas Di Paolo — Strategy & Quality Director

The contact and call pages keep two direct routes, labelled `linea 01` and `linea 02`, without repeating the names throughout the interface.

## Portfolio disclosure

All portfolio entries are explicitly presented as independent demonstration/concept projects. They do not imply a commercial relationship, commission, approval or endorsement by the represented businesses unless that status is separately verified.

Current showcased concepts:

1. NODO — Ortodonzia / Cura Integrata
2. INNESTO — Ristrutturazione Integrata
3. TRAMA ZERO — Fashion / Product concept
4. Beer Hops — Craft Beer concept
5. Cultura Tattoo — Tattoo Studio concept

## Privacy / cookie state

The current code does not intentionally install analytics, advertising or profiling tools and does not use `localStorage`, `sessionStorage` or `document.cookie`. Because there are no optional tracking categories in the current implementation, the site does not display a first-visit consent banner. The persistent “Preferenze cookie” control opens an informational native dialog and the full disclosure lives at `/cookie-policy.html`.

The visual system currently requests Instrument Sans and IBM Plex Mono from Google Fonts. The cookie policy identifies remote font delivery alongside the site's other external resources. If optional analytics/marketing technology is added later, both the policy and consent mechanism must be reviewed before activation.

## Checks

Run:

```bash
node --check site-v4.js
node --check site-v9.js
node --check portfolio-v8.js
node --check dual-field-v5.js
node --check brief.js
node tests/interactions.cjs
node tests/brief.cjs
node tests/experience.cjs
python tests/check_site.py
```

`tests/check_site.py` requires `lxml`. JavaScript interaction tests are dependency-free DOM simulations; they are not real browser-layout tests. Browser screenshots should also be checked at desktop and mobile widths before promotion to `main`. See `VALIDATION.md` for the verification boundary.
