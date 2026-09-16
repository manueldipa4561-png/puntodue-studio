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

`tests/check_site.py` requires `lxml` and validates the current multipage architecture, five-project portfolio, three case studies, independent-demo disclosures, canonical links, local assets, cookie surfaces, founder identity rules, v8 portfolio motion and the current typography/spatial-text layer.

## Current motion-pass checks

The current production candidate additionally verifies:

- founder names remain visibly concentrated in the two numbered cards on `/studio.html`;
- Instrument Sans and IBM Plex Mono remain wired into the typography layer;
- the refined 3D text system is active across Homepage, Studio, Contact, Call and all three case-study routes;
- motion uses spring interpolation rather than direct cursor snapping;
- perspective origin follows pointer position at restrained amplitude;
- hero, statement, section and compact headings use shared physics with different intensity profiles;
- pointer exit returns headings toward their baseline state with soft settling;
- adjacent buttons/cards/links use a small matching tactile press response;
- touch/mobile receives only low-amplitude scroll depth and does not rely on hover;
- `prefers-reduced-motion: reduce` removes transforms, pseudo-depth layers and motion animation;
- no tested page reports horizontal overflow at a 390px viewport;
- no JavaScript console/page errors were observed during the automated Chromium interaction pass.

## Browser coverage used for this pass

Chromium was exercised against the local branch at representative desktop/mobile viewports for:

- `/`
- `/studio.html`
- `/contatti.html`
- `/prenota-call.html`
- `/progetti/nodo.html`
- `/progetti/innesto.html`
- `/progetti/trama-zero.html`

The interaction harness verified that spatial transforms change on pointer movement, spring back after pointer exit, tactile controls respond to press/release, and reduced-motion resolves to `transform: none` with both generated depth layers hidden.

Full-page Chromium screenshots were also produced for homepage, Studio, Contact, Call and NODO at representative desktop/mobile widths before promotion.

## Browser boundary

Render success confirms the page can execute and paint without fatal browser errors and that the scripted interaction layer behaves within the tested Chromium environment. It is not a substitute for physical-device testing, Safari/WebKit review or measured Core Web Vitals.

## Not claimed by this validation

- physical-device testing;
- exhaustive browser matrix coverage;
- measured production Core Web Vitals;
- legal advice or compliance certification;
- availability/performance of third-party services outside this repository.

Those checks should be added when the project or technology stack requires them.
