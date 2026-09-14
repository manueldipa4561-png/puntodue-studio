# Validation scope

## Automated checks available in the repository

- `node --check script.js`
- `node --check brief.js`
- `node tests/interactions.cjs`
- `node tests/brief.cjs`
- `python tests/check_site.py` (requires `lxml`)

The JavaScript interaction suite is dependency-free and simulates the mobile menu, focus restoration, inert background state, hero scene controls, reduced-motion behavior and portfolio-image fallback at 320, 375, 390, 430, 768, 1024 and 1440px. It does **not** render CSS or prove browser layout quality.

The structural HTML test validates unique IDs, one H1, six FAQ items, the fixed four-project hierarchy (Essenziale → Presenza → Crescita → Evoluzione), demo disclosures, internal anchors, WhatsApp targets, image dimensions, lazy project images, local fallback assets, external-link isolation, sitemap/XML, social metadata and the absence of an unconfigured form.

## Source-level production safeguards

- Sticky-header anchor offsets are explicitly accounted for on desktop and mobile so in-page navigation does not land underneath the persistent header.
- Third-party portfolio hero images keep their current visual direction, with local historical viewport captures used only as failure fallbacks.
- Mobile navigation remains progressively enhanced, locks background scrolling only while open and restores focus on Escape.
- Reduced-motion overrides disable non-essential transitions/animations.
- The project brief remains local-only: choices are used to compose a WhatsApp URL and are not submitted or stored by the site.

## Not externally verified in this pass

The available live-page/network tools could not fetch `https://puntoduestudio.it/`, so this pass does not claim visual browser QA of the deployed domain, physical-device screenshots, deployed console output, third-party endpoint reachability, Netlify propagation timing or Core Web Vitals.

The repository remains a static HTML/CSS/JavaScript site with `publish = "."`; the root `404.html` remains compatible with Netlify static 404 handling.
