# Validation scope

## Passed

- JavaScript syntax (`node --check`) and CSS parsing for the core stylesheet plus the production-hardening layer.
- HTML parsing for homepage and 404: one H1 each, unique IDs, internal anchor targets, local asset references, external-link isolation, intrinsic image dimensions and alt attributes.
- Source-level responsive/overflow audit at 320, 375, 390, 430, 768, 1024 and 1440px: grid breakpoints, long-link wrapping, project preview chrome, contact cards, hero scene clipping and mobile-navigation constraints.
- Mobile navigation state: `aria-expanded` and accessible-label updates, Escape and link closure, viewport-change reset, page scroll lock and background inert state while open.
- Existing project WebP previews are already compact (roughly 38–117 KB) and remain lazy-loaded with intrinsic dimensions and async decoding.
- Favicon, canonical/Open Graph/Twitter metadata, WebSite structured data, sitemap/robots references, branded 404, telephone/WhatsApp links and dynamic copyright fallback checked.
- Reduced-motion behavior retained.

## Not externally verified

The available network/live-page inspection could not fetch `https://puntoduestudio.it/`, and the container's Chromium build could not complete a headless render. Therefore live Netlify propagation, external demo/Instagram/WhatsApp endpoint reachability, screenshots on physical devices, console output from the deployed domain and Core Web Vitals are not claimed as verified here.

The repository remains a static HTML/CSS/JavaScript site with `publish = "."`; the new root `404.html` is compatible with Netlify's static 404 handling.
