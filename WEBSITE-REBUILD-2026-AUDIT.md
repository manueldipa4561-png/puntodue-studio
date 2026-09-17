# Punto Due Studio — Website Rebuild 2026 Audit

## Status
Implementation branch: `website-rebuild-2026-v1`  
Production remains untouched until review.  
Payments: explicitly out of scope; no live checkout/provider integration.

## Hard constraints
- Higgsfield: **140 credits maximum**, not a target.
- Figma: **1,000 credits maximum**, not a target.
- Desktop PageSpeed baseline supplied by the founders: **~61**.
- Primary performance target: **80+** without destroying the core Punto Due identity.
- Italian-first copy.
- Preserve honest labeling of concept/demo work.

## Brand position to preserve
The strongest existing strategic line is:

> Business diversi. Siti che non si assomigliano.

The current site already communicates an independent studio model, direct founder involvement, custom visual direction, editorial restraint and end-to-end strategy/design/development. These are assets, not problems to erase.

## Business email architecture
| Intent | Address | Website role |
| --- | --- | --- |
| New project | projects@puntoduestudio.it | Primary project forms / briefs / proposal requests |
| Institutional/general | studio@puntoduestudio.it | Public studio address, partnerships and broad enquiries |
| Existing client | care@puntoduestudio.it | Maintenance, support and Punto Due Care |
| Billing | billing@puntoduestudio.it | Contextual administrative use only |
| Legal/privacy | legal@puntoduestudio.it | Privacy/legal pages and formal requests |
| Fallback | info@puntoduestudio.it | Functional fallback; not a competing public CTA |

Do not show all six addresses at equal prominence.

## Benchmark pool
The research pool included roughly fifty current web, product, branding, interactive and B2B agencies/studios, including Clay, Digital Silk, Baunfire, Ramotion, Huemor, DD.NYC, eDesign Interactive, Work & Co, Locomotive, Active Theory, Noomo, Unseen Studio, Vide Infra, MetaLab, Pentagram, ustwo, Ueno, Cuberto, Significa, COLLINS, Superside, Motion Tactic, Amply, Bop Design, heartbeat, 93x, Sköna, Konstruct Digital, Make Us Care, Watson Creative, Creative Mules, Gapsy Studio, Burst Digital, ArtVersion, Contrast & Co., Together, WebFX, Azuro Digital, Orbit Media, GLIDE, BRIX Agency, Lounge Lizard, Big Drop, Phenomenon Studio, League Design Agency, UPQODE, 500 Designs, Adchitects and SeedX.

### Repeated patterns worth adopting
- Clear proposition before visual spectacle.
- Selected work appears early.
- Strong case-study storytelling does more selling than long service lists.
- One primary project CTA is easier to understand than many equal contact routes.
- Senior/direct involvement is used as a trust signal.
- Motion is memorable when it has hierarchy and restraint.
- Proof, process and concrete capabilities reduce buyer uncertainty.
- Mobile layouts are treated as designed compositions, not compressed desktop screens.

### Patterns to avoid
- Generic “full-service digital agency” language.
- Too many animated layers competing for attention.
- Massive background video/3D that blocks the first useful paint.
- Equal-prominence contact methods that force the visitor to choose the routing logic.
- Unsubstantiated claims, invented outcomes or fake social proof.

## Current-site audit

### KEEP
- Core positioning and “non-template” philosophy.
- Warm cream / olive / black visual identity.
- Editorial typography and restrained graphic language.
- Project-led portfolio.
- NODO, INNESTO and TRAMA ZERO case-study structure.
- Honest disclosure that concept work is demonstrative.
- Direct founder involvement.
- Existing SEO basics: canonical tags, Open Graph, sitemap and structured data.
- Reduced-motion handling already present in several interaction layers.
- Existing basic security headers.

### KEEP BUT REFINE
- Spatial/3D identity: preserve as a signature, but make it progressive and cheaper.
- Homepage hero: keep the proposition, strengthen commercial route.
- Call page: keep directness, reduce dependence on two parallel WhatsApp lines.
- Contact page: retain the low-friction brief concept, route it to the new business-email architecture.
- Motion system: consolidate into one grammar.
- Typography: retain Geist + IBM Plex Mono, improve loading architecture.
- Footer: keep minimal, add one public institutional email instead of a mailbox directory.

### REDESIGN
- Contact information architecture.
- New-project intake.
- Existing-client support route.
- Hero enhancement loading strategy.
- Performance architecture.
- Mobile-specific contact and project CTA hierarchy.

### MERGE / CONSOLIDATE
The repository contains multiple generations of production styles and interaction layers:
`site-v4`, `site-v5`, `site-v6`, `site-v7`, `site-v8`, `site-v9`, `site-v11`, `site-v12`, `site-v13`, fixes/hotfixes and spatial files.

Dependencies must be traced before deletion, but the final architecture should not keep loading historical generations globally.

### REMOVE / STOP LOADING WHERE UNNECESSARY
- Case-study-only CSS/JS on non-case pages.
- Duplicate or superseded interaction layers.
- Home `dual-field-v5.js` if the home `.logo-stage` remains hidden by the current spatial layer.
- Continuous high-performance WebGL when the signature visual is offscreen.
- Personal-contact duplication where a business mailbox now provides a clearer route.

## Performance diagnosis

### High-priority issue 1 — runtime style/script cascade
`site-v4.js` currently injects:
- `spatial-2026.css`
- `experience-field.js`
- `site-v5-fixes.css`
- `site-v6.css`
- `mobile-menu-hotfix.css`
- `site-v9.css`
- `site-v11.css`
- `site-v12.css`
- `site-v13.css`
- `site-v9.js`
- `site-v11.js`

This means a page that includes `site-v4.js` can inherit a large amount of historical runtime code regardless of whether the page uses it.

### High-priority issue 2 — continuous WebGL
`experience-field.js` creates a full-screen WebGL2 canvas, requests `powerPreference: high-performance`, and runs a continuous requestAnimationFrame loop while the tab is visible. The field is valuable visually, but should only render when its relevant experience is visible and should respect a frame-rate/performance budget.

### High-priority issue 3 — font loading
`site-v9.css` imports Google Fonts using CSS `@import`, adding another dependency chain. Replace with a deliberate font-loading strategy in a later consolidation pass.

### High-priority issue 4 — unnecessary 3D module on homepage
The homepage directly loads `dual-field-v5.js`, but the later spatial CSS hides `.home-hero .logo-stage`. Loading a 3D initializer for a hidden stage is unnecessary.

### Lower-priority findings
The static preview assets are comparatively small and mostly WebP. They should still be checked, but they are not the first optimization target.

## First implementation pass
1. Stop loading case-study-only generations globally.
2. Load the WebGL field only on the homepage and defer it until the browser is idle.
3. Pause/throttle WebGL when the hero is not visible.
4. Remove the unused homepage Dual Field initializer while leaving Studio's 3D identity intact.
5. Route the contact brief to `projects@`, with WhatsApp retained as a secondary direct route.
6. Add `studio@` as the public institutional address and `care@` as the existing-client route.
7. Add `legal@` to the policy context.
8. Keep payment implementation entirely absent.

## Quality gate before production merge
- No broken internal navigation.
- No payment code.
- Business email links tested.
- Mobile contact flow checked.
- Reduced-motion checked.
- PageSpeed retested on deployed preview/production-equivalent environment.
- If performance remains under 80, identify the three biggest remaining bottlenecks before further visual cuts.
