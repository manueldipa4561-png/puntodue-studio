# Punto Due Studio — Pre-consolidation baseline

Baseline commit: `48901945e39fc4f6bd29c7154e887ec87ee13c26`

This directory defines the reference state that must be preserved while the CSS and JavaScript layers are consolidated. The baseline exists to separate intentional architecture cleanup from accidental visual or behavioral regression.

## Deterministic screenshots

For every route in `manifest.json`, capture at desktop 1440×1000, tablet 1024×1366, and mobile 390×844 with DPR 1, 100% zoom, `it-IT`, light color scheme and `prefers-reduced-motion: reduce`.

Capture exactly three screenshots per route and viewport:

1. `01-top.png` at `scrollY = 0`.
2. `02-full.png` as a full-page screenshot.
3. `03-bottom.png` with the final CTA/footer viewport visible.

Use this naming pattern:

`<route-id>-<route-name>__<capture>.png`

Example:

`R01-home__01-top.png`

Do not use animation-time-dependent screenshots for pixel comparison.

## Small-mobile stress set

Additionally capture 360×800 for Home, Projects, Studio, Contact, Book Call and NODO. These captures are primarily for overflow, menu, CTA and type-wrap inspection.

## Interactive reference states

Motion-enabled screenshots/clips are human QA references, not pixel-perfect assertions. Use the normalized pointer positions recorded in `manifest.json` so before/after comparisons remain reproducible.

Record the following short clips:

- `A01-home-field-pointer.mp4` — 5 s
- `A02-home-scroll.mp4` — 6 s
- `A03-project-card-hover.mp4` — 3 s
- `A04-studio-dual-field.mp4` — 5 s
- `A05-case-section-scroll.mp4` — 6 s
- `A06-case-handoff.mp4` — 4 s
- `A07-mobile-menu.mp4` — 3 s

## Network baseline

For each route record all CSS and JavaScript requests, including dynamically inserted resources. Store URL, initiator, type, status, transfer size, decoded size, start time and duration.

Also record per-route totals:

- CSS request count
- JS request count
- CSS transferred bytes
- JS transferred bytes
- total transferred bytes
- DOMContentLoaded
- load event
- console error count
- console warning count

A successful consolidation is allowed to reduce request/file counts. It is not allowed to silently remove required behavior.

## Console/runtime baseline

Expected local production state:

- zero uncaught JavaScript exceptions
- zero unhandled promise rejections
- zero missing local CSS/JS assets
- zero missing local images
- zero WebGL shader compilation errors

Remote third-party demo/image failures must be recorded separately from local application defects.

For the spatial field verify three modes:

1. normal WebGL2;
2. reduced motion;
3. WebGL unavailable/fallback.

## Regression suite

Run all commands listed in `manifest.json` before changing architecture and record exact exit code/stdout/stderr. Existing failures, if any, are baseline conditions and must not be falsely attributed to consolidation.

`tests/check_preconsolidation_contract.py` is deliberately semantic: it protects routes, structure, local resources, contact/cookie surfaces, project mappings and progressive-enhancement fallbacks without requiring future files to retain historical version names.

## Performance sample

For Home, Projects, NODO, Studio and Contact, run three cold-cache desktop measurements and store the median for requests, transferred bytes, CSS/JS bytes, LCP, CLS, interaction latency where available, and long-task count.

The consolidation target is fewer and more intentional runtime resources with no meaningful visual, accessibility, navigation or performance regression.

## Go/no-go gate

Do not delete active CSS/JS generations until:

- this manifest is committed;
- the semantic contract passes;
- all existing test outcomes are recorded;
- deterministic screenshots exist for the required matrix;
- interactive references exist for critical motion states;
- current network/load order is documented;
- rollback to `48901945e39fc4f6bd29c7154e887ec87ee13c26` remains available.
