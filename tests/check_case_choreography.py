from pathlib import Path
from lxml import html

root = Path(__file__).resolve().parents[1]
shared = (root / 'site-v4.js').read_text(encoding='utf-8')
css = (root / 'case-motion.css').read_text(encoding='utf-8')
runtime = (root / 'case-runtime.js').read_text(encoding='utf-8')

assert '/case-motion.css' in shared
assert '/case-runtime.js' in shared
assert '.case-flow-v11' in css
assert '.case-next-link-v11' in css
assert '--pd-case-choreo-ease' in css
assert '@media(prefers-reduced-motion:reduce)' in css
assert 'requestAnimationFrame' in runtime
assert 'case-flow-bridge-v11' in runtime
assert 'is-case-next-ready' in runtime

for slug in ('nodo', 'innesto', 'trama-zero'):
    doc = html.parse(str(root / 'progetti' / f'{slug}.html'))
    assert len(doc.xpath('//section[contains(concat(" ", normalize-space(@class), " "), " case-section ")]')) >= 4
    assert doc.xpath('//section[contains(concat(" ", normalize-space(@class), " "), " case-next ")]')
    assert doc.xpath('//a[contains(concat(" ", normalize-space(@class), " "), " case-next-link ")]')

print('PASS consolidated case runtime choreography, stylesheet, reduced-motion fallback and case structure')
