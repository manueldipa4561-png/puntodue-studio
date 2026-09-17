"""Regression checks for incoming case-study settle after runtime consolidation."""
from pathlib import Path

root = Path(__file__).resolve().parents[1]
shared = (root / 'site-v4.js').read_text(encoding='utf-8')
runtime = (root / 'case-runtime.js').read_text(encoding='utf-8')
css = (root / 'case-motion.css').read_text(encoding='utf-8')

assert '/case-motion.css' in shared
assert '/case-runtime.js' in shared
assert 'case-first-after-handoff-v13' in runtime
assert 'pd-case-first-section-settle-v13' in runtime
assert 'is-case-handoff-settling-v13' in runtime
assert 'nativeCaseHandoff=false' in runtime
assert "location.hostname==='puntoduestudio.it'" in runtime
assert "nextLink.setAttribute('href',prettyPath)" in runtime
assert '@view-transition{navigation:none}' in css
assert 'case-handoff-incoming-v12' in css
assert 'pd-case-kicker-settle-v13' in css
assert 'pd-case-title-settle-v13' in css
assert 'pd-case-deck-settle-v13' in css
assert 'pd-case-first-section-settle-v13' in css
assert '--pd-case-entry-z:-10px' in css
assert '::view-transition-group(case-title-handoff)' in css
assert '::view-transition-group(case-meta-handoff)' in css
assert '@media(prefers-reduced-motion:reduce)' in css

print('PASS consolidated case runtime settle, deterministic handoff and reduced-motion fallback')
