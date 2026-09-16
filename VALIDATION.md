# Validation

This repository is a lightweight static production site. Validation combines deterministic source checks with targeted real-browser rendering.

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

`tests/check_site.py` requires `lxml` and validates the current multipage architecture, five-project portfolio, three case studies, independent-demo disclosures, canonical links, local assets, cookie surfaces, founder identity rules, v8 motion and the v9 typography/spatial-text layer.

## Current v9 checks

The current production candidate additionally verifies:

- founder names are visibly concentrated in the two numbered cards on `/studio.html`;
- card 01 carries `Creative Director & Lead Developer` and card 02 carries `Strategy & Quality Director`;
- direct contact paths remain functional without repeating founder names across the interface;
- Instrument Sans and IBM Plex Mono are wired into the v9 typography layer;
- the spatial-text effect uses progressive enhancement and a `prefers-reduced-motion` fallback;
- the policy explicitly identifies Google Fonts as an external resource;
- homepage, Studio, Contact and Call pages render successfully at desktop/mobile viewport widths;
- case-study routes and their motion layer remain intact.

## Browser boundary

Before promotion, run full-page Chromium renders at representative widths (desktop 1440px and mobile 390px) for the homepage and Studio page, plus mobile renders for Contact and Call. Render success confirms the page can execute and paint without fatal browser errors, but it is not a substitute for physical-device testing, Safari/WebKit review or measured Core Web Vitals.

## Not claimed by this validation

- physical-device testing;
- exhaustive browser matrix coverage;
- measured production Core Web Vitals;
- legal advice or compliance certification;
- availability/performance of third-party services outside this repository.

Those checks should be added when the project or technology stack requires them.
