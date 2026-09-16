"""Regression checks for v13 incoming case-study settle."""
from pathlib import Path

root = Path(__file__).resolve().parents[1]
shared = (root / 'site-v4.js').read_text(encoding='utf-8')
css = (root / 'site-v13.css').read_text(encoding='utf-8')

assert '/site-v13.css' in shared
assert 'case-first-after-handoff-v13' in shared
assert 'pd-case-first-section-settle-v13' in shared
assert 'case-handoff-incoming-v12' in css
assert 'pd-case-kicker-settle-v13' in css
assert 'pd-case-title-settle-v13' in css
assert 'pd-case-deck-settle-v13' in css
assert 'pd-case-first-section-settle-v13' in css
assert '--pd-case-entry-z:-14px' in css
assert '::view-transition-group(case-title-handoff)' in css
assert '::view-transition-group(case-meta-handoff)' in css
assert '@media(prefers-reduced-motion:reduce)' in css

print('PASS v13 softer hero/kicker/first-section settle and reduced-motion fallback')
