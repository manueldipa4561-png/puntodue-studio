"""Regression checks for cross-case page handoff after CSS consolidation."""
from pathlib import Path
from lxml import html

root = Path(__file__).resolve().parents[1]
shared = (root / 'site-v4.js').read_text(encoding='utf-8')
css = (root / 'case-motion.css').read_text(encoding='utf-8')

assert '/case-motion.css' in shared
assert 'pd-case-handoff-v12' in shared
assert 'case-title-handoff' in shared
assert 'case-meta-handoff' in shared
assert 'onpageswap' in shared and 'onpagereveal' in shared
assert 'prefers-reduced-motion: reduce' in shared
assert 'isCaseDestination' in shared
assert "path.endsWith('.html')?path.slice(0,-5):path" in shared
assert '/^\\/progetti\\/(?:nodo|innesto|trama-zero)$/' in shared
assert '--pd-case-handoff-ease' in css
assert '@media(prefers-reduced-motion:reduce)' in css
assert '::view-transition-group(case-title-handoff)' in css
assert 'case-handoff-outgoing-v12' in css
assert 'case-handoff-incoming-v12' in css

expected = {
    'nodo.html': '/progetti/innesto.html',
    'innesto.html': '/progetti/trama-zero.html',
    'trama-zero.html': '/progetti.html',
}
for filename, href in expected.items():
    doc = html.parse(str(root / 'progetti' / filename))
    links = doc.xpath('//a[contains(concat(" ", normalize-space(@class), " "), " case-next-link ")]/@href')
    assert links == [href], (filename, links)

print('PASS consolidated cross-case handoff, pretty-route normalization, route guard, reduced-motion fallback and next-project mapping')
