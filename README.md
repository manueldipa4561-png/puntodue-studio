# Punto Due Studio

Italian boutique web-studio website for Manuel and Nicolas Di Paolo. Production remains a lightweight static HTML/CSS/JavaScript site with no framework, build step or runtime dependency.

## Local preview

Run `python -m http.server 8000` from the repository root, then open `http://localhost:8000`.

## Deployment

Netlify deploys `main` and serves the repository root as configured in `netlify.toml`. Domain and HTTPS settings are managed outside this repository.

## Experience architecture

- `index.html`: cross-sector positioning, interactive Dual Field hero, selected-work portfolio and production contact paths.
- `progetti.html`: five-project demonstration portfolio. NODO, INNESTO and TRAMA ZERO are the premium featured concepts; Beer Hops and Cultura Tattoo remain visible as additional concept work.
- `site-v4.css`: shared responsive foundation.
- `site-v5.css`: current Punto Due visual system and typography layer.
- `site-v6.css`: positioning/call-experience refinements loaded by `site-v4.js`.
- `site-v7.css`: "Projects as Digital Territories" portfolio system. It uses native CSS/DOM artwork rather than heavy media so the three premium concepts can have distinct identities without adding runtime dependencies.
- `site-v4.js`: shared navigation, reveal, cookie-dialog and contact-flow interactions.
- `dual-field-v5.js`: interactive hero object.
- `brief.js`: local-only WhatsApp message composer; nothing is submitted or stored by the site.
- `cookie-policy.html`: factual cookie/storage disclosure for the current implementation.
- `404.html`: branded static 404.
- `assets/`: local brand/social assets and historical demo previews.

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

If optional analytics/marketing technology is added later, both the policy and consent mechanism must be reviewed before activation.

## Checks

Run:

```bash
node --check site-v4.js
node --check dual-field-v5.js
node --check brief.js
node tests/interactions.cjs
node tests/brief.cjs
node tests/experience.cjs
python tests/check_site.py
```

`tests/check_site.py` requires `lxml`. JavaScript interaction tests are dependency-free DOM simulations; they are not real browser-layout tests. See `VALIDATION.md` for the verification boundary.
