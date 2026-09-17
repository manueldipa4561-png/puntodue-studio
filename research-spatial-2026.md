# Spatial / Interaction Research Notes — 2026

The redesign brief requires current research into high-end WebGL studios and free-to-use animation technology. The production decision intentionally favors native browser capabilities for the core field rather than importing an animation stack by default.

## Current reference categories studied

- Awwwards Three.js / WebGL collections
- Utsubo's 2026 Three.js agency survey
- Psychoactive's 2026 WebGL and interactive 3D agency survey
- current creative-development examples combining WebGL, shader reveals, page transitions and scroll choreography

## Technology candidates evaluated

- Three.js
- OGL
- PixiJS
- GSAP
- Motion
- Lenis
- Swup
- Barba.js
- Theatre.js
- Lottie-web
- native View Transitions
- Web Animations API
- CSS Scroll-Driven Animations
- WebGL2
- WebGPU progressive enhancement

## Production decision

For the site-wide Punto Due Field, use native WebGL2 first. This keeps the core experience free of new runtime dependencies and minimizes bundle weight, duplicated scheduling, licensing surface and integration risk. Additional libraries should only be introduced if a later measurable interaction requirement cannot be met cleanly with the existing implementation and native browser APIs.
