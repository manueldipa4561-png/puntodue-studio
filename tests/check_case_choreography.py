from pathlib import Path
from lxml import html

root = Path(__file__).resolve().parents[1]
shared = (root / 'site-v4.js').read_text(encoding='utf-8')
css = (root / 'site-v11.css').read_text(encoding='utf-8')
js = (root / 'site-v11.js').read_text(encoding='utf-8')

assert '/site-v11.css' in shared
assert '/site-v11.js' in shared
assert '.case-flow-v11' in css
assert '.case-next-link-v11' in css
assert '@media(prefers-reduced-motion:reduce)' in css
assert 'requestAnimationFrame' in js
assert 'case-flow-bridge-v11' in js
assert 'is-case-next-ready' in js

for slug in ('nodo', 'innesto', 'trama-zero'):
    doc = html.parse(str(root / 'progetti' / f'{slug}.html'))
    assert len(doc.xpath('//section[contains(concat(" ", normalize-space(@class), " "), " case-section ")]')) >= 4
    assert doc.xpath('//section[contains(concat(" ", normalize-space(@class), " "), " case-next ")]')
    assert doc.xpath('//a[contains(concat(" ", normalize-space(@class), " "), " case-next-link ")]')

print('PASS v11 case-study choreography assets, loader, reduced-motion fallback and case structure')
