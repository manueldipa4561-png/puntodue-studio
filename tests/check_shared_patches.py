"""Regression guard for the consolidated shared responsive/utility patch stack."""
from pathlib import Path

root = Path(__file__).resolve().parents[1]
shared = (root / 'site-v4.js').read_text(encoding='utf-8')
css = (root / 'shared-patches.css').read_text(encoding='utf-8')

assert '/shared-patches.css' in shared
assert '/typography.css' in shared
assert '/motion.js' in shared
assert '/site-v9.css' not in shared
assert '/site-v9.js' not in shared

# Former v5 correction responsibilities.
assert '--v5-muted:#555b53' in css
assert '.hero-copy h1{font-size:clamp(56px,7.8vw,124px)}' in css
assert '.cookie-fab{bottom:calc(76px + env(safe-area-inset-bottom))' in css

# Former v6 call/project responsibilities.
assert '.call-page{background:var(--v5-bg)}' in css
assert '.call-object-stage' in css
assert '.call-steps' in css
assert '.contact-card-primary' in css

# Former mobile-menu hotfix responsibilities.
assert 'height:calc(100dvh - 68px)!important' in css
assert 'min-height:calc(100svh - 68px)!important' in css
assert 'overscroll-behavior:none' in css
assert 'html.menu-open main' in css

assert '@media(prefers-reduced-motion:reduce)' in css

print('PASS consolidated shared patch stack retains responsive, call, mobile-nav and reduced-motion responsibilities')
