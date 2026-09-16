"""Structural validation for the current multipage Punto Due production site.

Requires lxml. This suite validates source structure and local references; it does
not claim browser-layout, Core Web Vitals or physical-device coverage.
"""
from pathlib import Path
from urllib.parse import urlsplit
from lxml import html, etree

root = Path(__file__).resolve().parents[1]
home = html.parse(str(root / 'index.html'))
projects = html.parse(str(root / 'progetti.html'))
studio = html.parse(str(root / 'studio.html'))
contact = html.parse(str(root / 'contatti.html'))
call = html.parse(str(root / 'prenota-call.html'))
method = html.parse(str(root / 'metodo.html'))
policy = html.parse(str(root / 'cookie-policy.html'))
cases = {
    'nodo': html.parse(str(root / 'progetti' / 'nodo.html')),
    'innesto': html.parse(str(root / 'progetti' / 'innesto.html')),
    'trama-zero': html.parse(str(root / 'progetti' / 'trama-zero.html')),
}

docs = [home, projects, studio, contact, call, method, policy, *cases.values()]

for doc in docs:
    ids = doc.xpath('//*[@id]/@id')
    assert len(ids) == len(set(ids)), 'Duplicate IDs'

assert len(home.xpath('//h1')) == 1
assert len(projects.xpath('//h1')) == 1
assert len(studio.xpath('//h1')) == 1
assert len(contact.xpath('//h1')) == 1
assert len(call.xpath('//h1')) == 1
assert all(len(doc.xpath('//h1')) == 1 for doc in cases.values())

premium_projects = projects.xpath('//article[contains(concat(" ", normalize-space(@class), " "), " premium-project-v7 ")]')
assert [x.get('id') for x in premium_projects] == ['nodo', 'innesto', 'trama-zero']
archive_projects = projects.xpath('//a[contains(concat(" ", normalize-space(@class), " "), " archive-card-v7 ")]')
assert [x.get('id') for x in archive_projects] == ['beer-hops', 'cultura-tattoo']

expected_demos = [
    'https://nodo-ortodonzia-cura-integrata-demo.netlify.app/',
    'https://innesto-demo.netlify.app/',
    'https://trama-zero-demo.netlify.app/',
    'https://joyful-sprinkles-4b402e.netlify.app/',
    'https://cultura-tattoo-demo.netlify.app/',
]
project_hrefs = projects.xpath('//a/@href')
for url in expected_demos:
    assert url in project_hrefs, url

expected_cases = ['/progetti/nodo.html', '/progetti/innesto.html', '/progetti/trama-zero.html']
for route in expected_cases:
    assert route in home.xpath('//a/@href'), route
    assert route in project_hrefs, route

# Demo status must remain explicit and factual.
disclosure = ' '.join(projects.xpath('//div[contains(concat(" ", normalize-space(@class), " "), " demo-disclosure-v7 ")]//text()')).lower()
assert 'progetti dimostrativi indipendenti' in disclosure
assert 'non implicano una collaborazione commerciale' in disclosure
for doc in cases.values():
    text = ' '.join(doc.xpath('//body//text()')).lower()
    assert 'concept digitale indipendente' in text
    assert 'non implica un incarico' in text

# Founder identity: names appear visibly only in the two numbered founder cards.
founder_cards = studio.xpath('//article[contains(concat(" ", normalize-space(@class), " "), " founder-v9 ")]')
assert len(founder_cards) == 2
assert [x.get('data-card-number') for x in founder_cards] == ['01', '02']
founder_text = [' '.join(x.xpath('.//text()')) for x in founder_cards]
assert 'Manuel' in founder_text[0] and 'Creative Director' in founder_text[0] and 'Lead Developer' in founder_text[0]
assert 'Nicolas' in founder_text[1] and 'Strategy' in founder_text[1] and 'Quality' in founder_text[1]

for path in [root / 'index.html', root / 'progetti.html', root / 'metodo.html', root / 'contatti.html', root / 'prenota-call.html', root / 'cookie-policy.html', *sorted((root / 'progetti').glob('*.html'))]:
    if path.name == 'studio.html':
        continue
    doc = html.parse(str(path))
    body_text = ' '.join(doc.xpath('//body//text()'))
    assert 'Manuel' not in body_text, f'Visible Manuel reference in {path}'
    assert 'Nicolas' not in body_text, f'Visible Nicolas reference in {path}'

# Internal anchors resolve inside their document.
for doc in [home, projects]:
    ids = set(doc.xpath('//*[@id]/@id'))
    for href in doc.xpath('//a/@href'):
        if href.startswith('#') and len(href) > 1:
            assert href[1:] in ids, href

# Local references exist; remote assets are ignored here.
for doc in docs:
    for el in doc.xpath('//*[@src] | //link[@href]'):
        path = el.get('src') or el.get('href')
        parsed = urlsplit(path)
        if not parsed.scheme and not path.startswith('#'):
            assert (root / path.lstrip('/')).is_file(), path

# Blank-target links are isolated from window.opener.
for doc in docs:
    for link in doc.xpath('//a[@target="_blank"]'):
        assert 'noopener' in link.get('rel', ''), link.get('href')

# Images have alt text; case-study editorial media is lazy-loaded.
for doc in docs:
    for image in doc.xpath('//img'):
        assert image.get('alt') is not None
for doc in cases.values():
    for image in doc.xpath('//figure[contains(concat(" ", normalize-space(@class), " "), " case-media ")]//img'):
        assert image.get('loading') == 'lazy'
        assert image.get('decoding') == 'async'
        assert image.get('width') and image.get('height')

# v8 portfolio layer and v9 type/depth system retain reduced-motion fallbacks.
for doc in [home, projects, *cases.values()]:
    assert doc.xpath('//link[@href="/site-v8.css"]')
    assert doc.xpath('//script[@src="/portfolio-v8.js"]')
assert (root / 'site-v8-benchmark.css').is_file()
v8_css = (root / 'site-v8.css').read_text(encoding='utf-8')
v8_js = (root / 'portfolio-v8.js').read_text(encoding='utf-8')
assert '@media(prefers-reduced-motion:reduce)' in v8_css
assert 'prefers-reduced-motion: reduce' in v8_js
assert '/site-v8-benchmark.css' in v8_js

v9_css = (root / 'site-v9.css').read_text(encoding='utf-8')
v9_js = (root / 'site-v9.js').read_text(encoding='utf-8')
shared_js = (root / 'site-v4.js').read_text(encoding='utf-8')
assert 'Instrument+Sans' in v9_css and 'IBM+Plex+Mono' in v9_css
assert '.spatial-type' in v9_css and '@media(prefers-reduced-motion:reduce)' in v9_css
assert 'prefers-reduced-motion: reduce' in v9_js and 'requestAnimationFrame' in v9_js
assert '/site-v9.css' in shared_js and '/site-v9.js' in shared_js

# Cookie/privacy surfaces remain native and informational.
for doc in docs:
    assert doc.xpath('//dialog[@id="cookie-settings"]')
forms = []
for doc in docs:
    forms.extend(doc.xpath('//form'))
assert forms and all(form.get('method', '').lower() == 'dialog' and not form.get('action') for form in forms), 'Only native dialog-close forms are allowed'
assert policy.xpath('//link[@rel="canonical" and @href="https://puntoduestudio.it/cookie-policy.html"]')

# Canonicals and sitemap routes.
assert projects.xpath('//link[@rel="canonical" and @href="https://puntoduestudio.it/progetti.html"]')
for slug, doc in cases.items():
    assert doc.xpath(f'//link[@rel="canonical" and @href="https://puntoduestudio.it/progetti/{slug}.html"]')
assert home.xpath('//meta[@property="og:image"]/@content') == ['https://puntoduestudio.it/assets/social-card.png']

sitemap = (root / 'sitemap.xml').read_text(encoding='utf-8')
for url in [
    'https://puntoduestudio.it/',
    'https://puntoduestudio.it/progetti.html',
    'https://puntoduestudio.it/progetti/nodo.html',
    'https://puntoduestudio.it/progetti/innesto.html',
    'https://puntoduestudio.it/progetti/trama-zero.html',
    'https://puntoduestudio.it/cookie-policy.html',
]:
    assert url in sitemap
etree.parse(str(root / 'sitemap.xml'))

print('PASS portfolio, case studies, founder identity, v9 typography/depth, links, assets, cookie surfaces and sitemap')
