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
- `site-v9.css`: current v14 typography and Precision Depth styling. Geist is the editorial/display/body family and IBM Plex Mono remains the technical/metadata voice; both are requested through Google Fonts.
- `site-v4.js`: shared navigation, reveal, cookie-dialog and contact-flow interactions; it also loads the current type/depth layer on site pages.
- `site-v9.js`: founder-name routing plus the current typography motion system: spring-smoothed 3D type, responsive hero wrapping, pointer-responsive perspective origin, subtle scroll depth, tactile adjacent controls and reduced-motion-safe behavior.
- `portfolio-v8.js`: case-study/portfolio pointer motion and progress feedback.
- `dual-field-v5.js`: interactive hero object.
- `brief.js`: local-only WhatsApp message composer; nothing is submitted or stored by the site.
- `cookie-policy.html`: factual cookie/storage/external-resource disclosure for the current implementation.
- `404.html`: branded static 404.
- `assets/`: local brand/social assets and historical demo previews.

## Typography system

The v14 pass replaces Instrument Sans with Geist while preserving IBM Plex Mono as the studio's technical voice. The system is defined centrally so old `--sans`, `--serif`, `--v5-font`, `--font-sans` and `--font-serif` paths also resolve into the same production family rather than producing route-specific typography.

The hierarchy is responsive rather than a simple desktop scale-down:

- homepage display, page H1, section H2, project/case headings, lead, body, metadata and controls each have dedicated scale, line-height and tracking behavior;
- the homepage hero removes its authored line-break composition at runtime and lets the browser balance the sentence against the available measure;
- mobile rules are tuned for narrow widths and touch, while tablet/desktop rules cap growth on large displays;
- long-form/supporting copy uses constrained reading measures and `text-wrap: pretty` where supported;
- Italian diacritics remain normal Unicode text and all production text stays semantic/selectable.

## Motion system

The current typography motion pass uses one shared interaction grammar across homepage, Studio, Contact, Call and case-study pages. v14 refines it into a shallower “Precision Depth” language informed by three Higgsfield motion studies rather than embedding generated video in the site:

- pointer input is normalized against the surrounding stage instead of the glyph bounds, preventing twitchy edge behavior;
- spring interpolation provides visible inertia and soft settling instead of direct cursor snapping;
- perspective origin follows the pointer at restrained amplitude;
- Geist uses a shallower foreground/depth/highlight stack than the previous pass, reducing duplicate-shadow appearance while keeping tactile dimensionality;
- hero, statement, section and compact headings use different intensity profiles while sharing the same physics;
- touch devices receive only a low-amplitude scroll-depth response;
- buttons, direct-contact cards, case-next links and text links receive a smaller matching physical response;
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

The current code does not intentionally install analytics, advertising or profiling tools and does not use `localStorage`, `sessionStorage` or `document.cookie` for profiling or analytics. Because there are no optional tracking categories in the current implementation, the site does not display a first-visit consent banner. The persistent “Preferenze cookie” control opens an informational native dialog and the full disclosure lives at `/cookie-policy.html`.

The visual system currently requests Geist and IBM Plex Mono from Google Fonts. The cookie policy identifies remote font delivery alongside the site's other external resources. If optional analytics/marketing technology is added later, both the policy and consent mechanism must be reviewed before activation.

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

`tests/check_site.py` requires `lxml`. JavaScript interaction tests are dependency-free DOM simulations; they are not real browser-layout tests. Browser layout, font resolution, pointer motion and reduced-motion behavior should also be checked at desktop/mobile widths before promotion to `main`. See `VALIDATION.md` for the verification boundary.
