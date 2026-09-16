# Punto Due Studio - Dual Field redesign validation

Production target: https://puntoduestudio.it/
Branch: `redesign/dual-field-2026`

## Identity safety

- Literal `PD`, `P / D`, `P/D`, and `P↔D` are not used as visible animated identity motifs in the new implementation.
- The interactive identity is named **Dual Field**.
- The 3D asset uses abstract sculptural forms rather than normal-font letter animation.
- Figma scan after cleanup returned zero literal P/D identity matches.

## Preserved production requirements

- Existing page routes retained.
- Project demo links retained.
- Contact routes, phone and WhatsApp flows retained.
- Cookie Policy retained and restyled.
- Custom 404 retained and restyled.
- Canonical/OG metadata retained on primary pages.
- Reduced-motion handling retained or improved.
- Mobile navigation remains keyboard/Escape aware and uses inert main/footer while open.

## Pre-production gate

This branch must be browser-tested before merge for desktop/mobile layout, menu behavior, portfolio links, 3D loading/fallback, contact brief behavior, Cookie Policy, 404, missing assets, overflow and console-breaking errors.
