# SEZIONE Hair Studio Demo v3

Reference-led rebuild by Punto Due Studio.

## Canonical production workflow
This repository follows **Punto Due Studio — Demo Generation System v3**.

One **complete page** at a time:

1. start from the repository selected by Manuel;
2. choose one primary real high-end website reference for the page;
3. document the Reference Card;
4. use secondary references only for named sub-problems;
5. source client-owned or properly licensed/free photography before considering generation;
6. implement the full page directly in GitHub;
7. run static, desktop, mobile, accessibility and Lighthouse QA;
8. fix every failure before notifying Manuel;
9. only when fully green, say **YOU CAN DEPLOY THIS PAGE NOW**;
10. Manuel deploys and visually reviews;
11. APPROVED → PAGE LOCKED → next page.

## Deployment authority
ChatGPT does **not** deploy this repository under the current workflow.

Manuel deploys manually only after the current page Quality Gate is green.

## Page status

### Page 01 — HOME
**PAGE LOCKED — APPROVED BY MANUEL**

Primary reference: George Northwood  
Secondary references: Hershesons / Josh Wood Colour Atelier

Reference card:
`docs/HOME-REFERENCE-CARD.md`

### Page 02 — SERVICES
**PAGE LOCKED — APPROVED BY MANUEL**

Primary reference: Josh Wood Colour Atelier — Services & Price List  
Secondary reference: George Northwood — consultation guidance

Reference card:
`docs/SERVICES-REFERENCE-CARD.md`

Final green QA commit:
`c6585e0df90caffbe175f6ef5a83036be0608de8`

### Page 03 — LAVORI
**PAGE LOCKED — APPROVED BY MANUEL**

Primary reference: Hershesons — Look Book

Reference card:
`docs/LAVORI-REFERENCE-CARD.md`

Implementation:
- `lavori.html`
- `lavori.css`
- 5 custom generated monochrome editorial portraits
- Home and Services navigation linked to Page 03

Final green QA commit:
`4f78aac816a0148b5fec96af758a325d7106af1c`

## Retired methods
Do not recover into:
- v1/v2 SEZIONE workflows;
- mandatory Figma-before-code;
- piece-by-piece Home construction;
- automatic deployment assumptions;
- old visual systems/assets by default;
- founder review while QA is red.

Canonical workflow documentation:
`docs/DEMO-GENERATION-SYSTEM-V3.md`


### Page 04 — STUDIO
**PAGE LOCKED — APPROVED BY MANUEL**

Primary reference: Hershesons — Stores / Fitzrovia

Reference card:
`docs/STUDIO-REFERENCE-CARD.md`

Implementation:
- `studio.html`
- `studio.css`
- 2 custom generated monochrome salon interiors
- Home / Services / Lavori navigation linked to Page 04
- generated imagery is concept-only and not presented as a real location
- no invented address, hours, team or operating claims

Final green QA commit:
`222297bca1f0753af61171d46b644d101aac80bf`


### Page 05 — PRIMA VISITA
**PAGE LOCKED — APPROVED BY MANUEL**

Primary reference: Josh Wood Colour — Consultation

Reference card:
`docs/PRIMA-VISITA-REFERENCE-CARD.md`

Implementation:
- `prima-visita.html`
- `prima-visita.css`
- text-first / zero imagery
- two-path first-client decision gateway
- Home / Services / Lavori / Studio navigation linked to Page 05
- no form
- no personal-data collection
- no invented availability, duration or consultation pricing

Final green QA commit:
`4773d65392d784841d780030a9f09fffa8ffb600`


### Page 06 — CONTATTI / PRENOTAZIONE
**PAGE LOCKED — APPROVED BY MANUEL**

Primary reference: George Northwood — Find Us / Wells St.

Reference card:
`docs/CONTATTI-REFERENCE-CARD.md`

Implementation:
- `contatti.html`
- `contatti.css`
- zero imagery
- zero forms
- zero fabricated contact details
- global nav now uses PRENOTA as the primary conversion destination
- Prima Visita remains available as an internal guidance route

Final green QA commit:
`d0023e2745ae0f7f473bfa251f38236c7b02f9e0`


## Final whole-site polish
**COMPLETE — FINAL QA GREEN**

Scope:
- preserve all six approved page architectures;
- normalize Home brand routing;
- normalize footer language and numbering;
- remove visible internal production terminology;
- normalize focus / hover / current-page states;
- preserve reduced-motion accessibility;
- validate all six pages as one connected site.

No new page, no visual-system reset, no fabricated client data.


### Final release candidate
Final polished site:
**latest `main` after the final Quality Gate succeeds**

The authoritative final commit and Quality Gate are recorded in Project Control after CI completes.

Validated across all six pages:
- static repository QA;
- desktop browser QA;
- mobile browser QA;
- accessibility;
- route / footer / navigation consistency;
- no horizontal overflow;
- no fabricated contact / personal-data collection;
- Lighthouse performance, accessibility and best-practices budgets.

Status:
**READY FOR MANUEL TO DEPLOY.**


### Final image system
All previous stock/Unsplash implementation imagery on Home, Services, Lavori and Studio has been replaced by a cohesive custom monochrome editorial image system.

Rules:
- custom generated concept imagery only;
- no generated person is presented as a real client;
- no generated interior is presented as a real SEZIONE location;
- web-optimized WebP delivery;
- the approved page structures and typography remain unchanged.
