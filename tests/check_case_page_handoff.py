"""Regression checks for cross-case page handoff after runtime consolidation."""
from pathlib import Path
from lxml import html

root = Path(__file__).resolve().parents[1]
shared = (root / 'site-v4.js').read_text(encoding='utf-8')
runtime = (root / 'case-runtime.js').read_text(encoding='utf-8')
css = (root / 'case-motion.css').read_text(encoding='utf-8')

assert '/case-motion.css' in shared
assert '/case-runtime.js' in shared
assert 'pd-case-handoff-v12' in runtime
assert 'case-title-handoff' in runtime
assert 'case-meta-handoff' in runtime
assert 'onpageswap' in runtime and 'onpagereveal' in runtime
assert 'prefers-reduced-motion: reduce' in runtime
assert 'isCaseDestination' in runtime
assert "path.endsWith('.html')?path.slice(0,-5):path" in runtime
assert '/^\\/progetti\\/(?:nodo|innesto|trama-zero)$/' in runtime
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

print('PASS consolidated case runtime handoff, pretty-route normalization, route guard and next-project mapping')
