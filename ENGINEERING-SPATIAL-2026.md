# Punto Due Spatial Experience 2026

Baseline before spatial production work: `6c374cb8cf3854ed313aa670690cc1fcebc74864`.

## Architecture decision

The new site-wide field is intentionally dependency-free at runtime. The implementation uses native WebGL2 plus browser APIs instead of adding Three.js, GSAP, Motion, Lenis, Barba, Swup or another animation framework simply for prestige.

Reasons:

- zero new runtime package dependency;
- no third-party licensing ambiguity;
- no duplicated animation scheduler;
- smaller payload and simpler failure surface;
- direct control over reduced-motion, visibility pause, context loss and adaptive quality;
- easier integration with the existing static HTML/CSS/JS Netlify architecture.

The new runtime is isolated in `experience-field.js` and its visual layer in `spatial-2026.css`.

## Reliability controls

- WebGL2 feature detection and fallback state;
- shader compilation/link error handling;
- context-loss handling;
- visibility-based render pause;
- DPR caps;
- coarse-pointer/mobile quality reduction;
- rolling FPS quality downgrade;
- passive pointer/touch/scroll listeners where appropriate;
- reduced-motion CSS fallback;
- regression test in `tests/check_spatial_experience.py`.

## Research note

Current 2026 references surveyed included contemporary WebGL/Three.js agency roundups, Awwwards Three.js collections and current creative-development examples. The implementation deliberately extracts principles rather than copying any individual studio or demo.

## Rollback

The commit above is the clean pre-spatial baseline and can be used as a known rollback point if the production experience needs to be reverted.
