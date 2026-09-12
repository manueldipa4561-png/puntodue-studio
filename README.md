# Punto Due Studio

Italian agency website for Manuel and Nicolas Di Paolo. Static HTML, CSS and JavaScript; no build step or production dependencies.

## Local preview

Run `python -m http.server 8000` from the repository root, then open `http://localhost:8000`.

## Deployment

Netlify deploys `main` and serves the repository root as configured in `netlify.toml`. Domain and HTTPS settings are managed outside this repository. No paid features or environment variables are needed by this code.

## Editing

- `index.html`: Italian content, approved public contacts, demo links and metadata.
- `style.css`: one responsive stylesheet, grouped by section and breakpoint.
- `script.js`: progressive navigation, focus handling, reveal enhancement and event-driven CSS depth controls.
- `logo.svg` and `logo-mark.svg`: preserved agency identity.
- `assets/`: local editorial covers and social-sharing assets; see `CREDITS.md`.
- `robots.txt` and `sitemap.xml`: existing search-discovery files retained.

Both portfolio projects are uncommissioned demos. Covers are explicitly labeled as illustrations, not screenshots. No form, analytics, cookies or invented business/legal details are added.

## Checks

Run `node --check script.js`, `node tests/interactions.cjs`, and `python tests/check_site.py` (the last requires lxml).

The interaction tests use a DOM simulation at seven media widths. They are not browser layout tests. See `VALIDATION.md` for the verification scope and remaining limitations.
