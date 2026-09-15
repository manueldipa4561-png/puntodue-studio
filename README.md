# Punto Due Studio

Italian boutique web-studio website for Manuel and Nicolas Di Paolo. Production remains a lightweight static HTML/CSS/JavaScript site with no framework, build step or runtime dependency.

## Local preview

Run `python -m http.server 8000` from the repository root, then open `http://localhost:8000`.

## Deployment

Netlify deploys `main` and serves the repository root as configured in `netlify.toml`. Domain and HTTPS settings are managed outside this repository.

## Experience architecture

- `index.html`: approved Italian content, public contacts, fixed four-demo portfolio order, signature spatial markup and accessible cookie-preferences dialog.
- `style.css`: core responsive design system.
- `polish.css`: production hardening and boutique visual refinement.
- `experience.css`: typography refinement, spatial hero treatment, portfolio depth, convergence brand moment, cookie/policy UI and mobile/reduced-motion fallbacks.
- `script.js`: existing progressive navigation, reveal enhancement, portfolio image fallbacks and hero controls.
- `experience.js`: event-driven spatial enhancement, portfolio pointer depth, convergence/process activation, current-section feedback and native cookie-dialog behavior.
- `brief.js`: local-only WhatsApp message composer; nothing is submitted or stored by the site.
- `cookie-policy.html`: factual cookie/storage disclosure for the current implementation.
- `404.html`: branded static 404.
- `assets/`: local brand/social assets plus historical demo captures used when third-party preview images fail.

All four portfolio entries are explicitly non-commissioned demonstration projects and do not imply a commercial relationship, approval or endorsement by the represented businesses.

## Privacy / cookie state

The current code does not intentionally install analytics, advertising or profiling tools and does not use `localStorage`, `sessionStorage` or `document.cookie`. Because there are no optional tracking categories in the current implementation, the site does not display a first-visit consent banner. The persistent “Preferenze cookie” control opens an informational native dialog and the full disclosure lives at `/cookie-policy.html`.

If optional analytics/marketing technology is added later, both the policy and consent mechanism must be reviewed before activation.

## Checks

Run:

```bash
node --check script.js
node --check brief.js
node --check experience.js
node tests/interactions.cjs
node tests/brief.cjs
node tests/experience.cjs
python tests/check_site.py
```

`tests/check_site.py` requires `lxml`. JavaScript interaction tests are dependency-free DOM simulations; they are not real browser-layout tests. See `VALIDATION.md` for the verification boundary.
