# Validation

This repository is a lightweight static production site. Validation combines deterministic source checks with targeted real-browser rendering and interaction checks.

## Deterministic checks

Run from the repository root:

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

`tests/check_site.py` requires `lxml` and validates the current multipage architecture, five-project portfolio, three case studies, independent-demo disclosures, canonical links, local assets, cookie surfaces, founder identity rules, v8 portfolio motion and the current v14 typography/spatial-text layer.

## Current typography and motion-pass checks

The current production candidate verifies:

- founder names remain visibly concentrated in the two numbered cards on `/studio.html`;
- Geist and IBM Plex Mono are wired into the typography layer and Instrument Sans is no longer active there;
- legacy typography tokens resolve into the Geist system so Policy/404 and older component rules do not silently fall back to another family;
- homepage display, page headings, section headings, case-study headings, supporting copy and technical labels use distinct responsive hierarchy rules;
- the homepage hero is allowed to wrap responsively instead of preserving its old fixed line breaks;
- the refined Precision Depth system is active across Homepage, Studio, Contact, Call and all three case-study routes;
- motion uses spring interpolation rather than direct cursor snapping;
- hero, statement, section and compact headings use shared physics with different restrained intensity profiles;
- pointer exit returns headings toward their baseline state with soft settling;
- adjacent buttons/cards/links use a smaller matching tactile press response;
- touch/mobile receives only low-amplitude scroll depth and does not rely on hover;
- `prefers-reduced-motion: reduce` removes transforms, pseudo-depth layers and motion animation;
- typography remains semantic/selectable rather than being replaced by Higgsfield media.

## Browser matrix for v14

The typography pass is exercised at the requested representative widths:

- mobile: 320, 375, 390, 430px;
- tablet: 768, 1024px;
- desktop: 1280, 1440, 1920px.

Routes covered by the layout/font matrix:

- `/`
- `/studio.html`
- `/metodo.html`
- `/progetti.html`
- `/contatti.html`
- `/prenota-call.html`
- `/progetti/nodo.html`
- `/progetti/innesto.html`
- `/progetti/trama-zero.html`
- `/cookie-policy.html`
- `/404.html`

The matrix checks computed font-family resolution, document horizontal overflow and H1 viewport clipping. A separate Chromium interaction pass checks pointer motion/settling and reduced-motion behavior. Network failures intentionally created by blocking heavyweight image/media resources during layout-only tests are not treated as JavaScript regressions; critical-route clean-console checks are run without those artificial blocks before promotion.

## Browser boundary

Render success confirms the page can execute and paint without fatal browser errors and that the scripted interaction layer behaves within the tested Chromium environment. It is not a substitute for physical-device testing, Safari/WebKit review or measured Core Web Vitals.

CSS uses resilient fallback stacks and standards-based features so unsupported `text-wrap` or advanced visual refinements degrade to normal readable text rather than hiding content.

## Not claimed by this validation

- physical-device testing;
- exhaustive browser matrix coverage;
- measured production Core Web Vitals;
- legal advice or compliance certification;
- availability/performance of third-party services outside this repository.

Those checks should be added when the project or technology stack requires them.
