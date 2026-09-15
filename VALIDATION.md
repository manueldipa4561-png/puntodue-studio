# Validation scope

## Automated checks

The production upgrade is designed to preserve the existing regression suite while adding tests for the new spatial/privacy layer.

Available checks:

- `node --check script.js`
- `node --check brief.js`
- `node --check experience.js`
- `node tests/interactions.cjs`
- `node tests/brief.cjs`
- `node tests/experience.cjs`
- `python tests/check_site.py` (requires `lxml`)

The existing interaction suite simulates mobile-menu state, inert regions, focus restoration, hero controls, reduced-motion behavior and portfolio-image fallback at 320, 375, 390, 430, 768, 1024 and 1440px.

The new experience test verifies the presence of:

- the signature spatial layer;
- the convergence brand moment;
- fine-pointer-only portfolio depth hooks;
- reduced-motion CSS fallback;
- native cookie-preferences dialog;
- Cookie Policy route;
- sitemap inclusion;
- absence of known analytics/marketing integrations and optional browser storage in the new implementation.

The structural Python test validates:

- unique IDs and heading structure;
- six FAQ entries;
- fixed portfolio order: Essenziale → Presenza → Crescita → Evoluzione;
- non-commissioned demo disclosures;
- internal anchor validity;
- phone/WhatsApp targets;
- local production assets referenced by HTML;
- project image loading attributes and fallback paths;
- canonical social metadata;
- native dialog-only forms;
- Cookie Policy canonical URL and dialog;
- sitemap XML including the Cookie Policy route.

## Performance safeguards

The spatial layer uses CSS transforms/SVG-like DOM geometry and vanilla JavaScript rather than a WebGL framework. Pointer motion is requestAnimationFrame-gated, portfolio depth is fine-pointer only, reduced-motion disables non-essential depth, and no perpetual render loop is introduced.

## Cookie / storage state

A source audit found no current use of analytics, marketing pixels, `document.cookie`, `localStorage` or `sessionStorage`. The cookie UI therefore does not manufacture optional categories and does not present a first-visit consent banner.

## Browser verification limitation

This environment's Chromium process does not successfully complete even a minimal headless render because the container lacks the required system/DBus runtime. Therefore this pass must not be described as visual Chromium QA, physical-device QA, Core Web Vitals measurement or measured frame-rate verification.

The public domain was also not reachable through the available live-page fetch path during this pass. Repository/source validation and simulated interaction tests are the evidence available here.
