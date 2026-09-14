# Punto Due Studio

Italian boutique web-studio website for Manuel and Nicolas Di Paolo. The production site is static HTML, CSS and JavaScript with no build step or runtime dependencies.

## Local preview

Run `python -m http.server 8000` from the repository root, then open `http://localhost:8000`.

## Deployment

Netlify deploys `main` and serves the repository root as configured in `netlify.toml`. Domain and HTTPS settings are managed outside this repository. No paid feature or environment variable is required by the site code.

## Editing

- `index.html`: approved Italian copy, public contacts, portfolio/demo links and metadata.
- `style.css`: core responsive design system and layout breakpoints.
- `polish.css`: boutique visual refinement, sticky-navigation/mobile hardening, portfolio presentation, 404 styling and reduced-motion overrides.
- `script.js`: progressive mobile navigation, focus handling, reveal enhancement, resilient portfolio-image fallbacks and event-driven hero depth controls.
- `brief.js`: local-only WhatsApp message composer; nothing is stored or submitted.
- `logo.svg` and `logo-mark.svg`: agency identity.
- `assets/`: editorial/social assets plus local viewport captures used only as fallbacks if a third-party portfolio image fails; see `CREDITS.md`.
- `robots.txt` and `sitemap.xml`: search-discovery files.

All four portfolio entries are explicitly presented as uncommissioned demonstration projects. They do not imply a commercial relationship, approval or endorsement by the represented businesses. The site adds no form endpoint, analytics, consent-requiring tracking, or invented business/legal details.

## Checks

Run:

```bash
node --check script.js
node --check brief.js
node tests/interactions.cjs
node tests/brief.cjs
python tests/check_site.py
```

`tests/check_site.py` requires `lxml`. The interaction tests simulate DOM behavior at seven media widths; they are not browser-layout tests. See `VALIDATION.md` for the verification scope and limitations.
