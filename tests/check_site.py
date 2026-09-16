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
policy = html.parse(str(root / 'cookie-policy.html'))

docs = [home, projects, policy]

# Basic document integrity.
for doc in docs:
    ids = doc.xpath('//*[@id]/@id')
    assert len(ids) == len(set(ids)), 'Duplicate IDs'

assert len(home.xpath('//h1')) == 1
assert len(projects.xpath('//h1')) == 1

# Portfolio architecture: three premium territories + two additional concepts.
premium_home = home.xpath('//a[contains(concat(" ", normalize-space(@class), " "), " territory-card ")]')
assert len(premium_home) == 3
assert [x.xpath('.//h3/text()')[0].strip() for x in premium_home] == ['NODO', 'INNESTO', 'TRAMA ZERO']

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

for url in expected_demos[:3]:
    assert url in home.xpath('//a/@href'), url

# Demo status must be explicit and must not imply a commissioned relationship.
disclosure = ' '.join(projects.xpath('//div[contains(concat(" ", normalize-space(@class), " "), " demo-disclosure-v7 ")]//text()')).lower()
assert 'progetti dimostrativi indipendenti' in disclosure
assert 'non implicano una collaborazione commerciale' in disclosure

# Internal anchors must resolve inside their document.
for doc in [home, projects]:
    ids = set(doc.xpath('//*[@id]/@id'))
    for href in doc.xpath('//a/@href'):
        if href.startswith('#') and len(href) > 1:
            assert href[1:] in ids, href

# Local stylesheet/script/image references must exist.
for doc in docs:
    for el in doc.xpath('//*[@src] | //link[@href]'):
        path = el.get('src') or el.get('href')
        parsed = urlsplit(path)
        if not parsed.scheme and not path.startswith('#'):
            assert (root / path.lstrip('/')).is_file(), path

# External blank-target links must be isolated from window.opener.
for doc in [home, projects]:
    for link in doc.xpath('//a[@target="_blank"]'):
        assert 'noopener' in link.get('rel', ''), link.get('href')

# Images must have accessible alternative text; project preview media is lazy.
for doc in [home, projects]:
    for image in doc.xpath('//img'):
        assert image.get('alt') is not None

for image in projects.xpath('//div[contains(concat(" ", normalize-space(@class), " "), " archive-media-v7 ")]//img'):
    assert image.get('loading') == 'lazy'
    assert image.get('decoding') == 'async'
    assert image.get('width') and image.get('height')

# Current portfolio layer and reduced-motion fallback must be present.
assert home.xpath('//link[@href="/site-v7.css"]')
assert projects.xpath('//link[@href="/site-v7.css"]')
portfolio_css = (root / 'site-v7.css').read_text(encoding='utf-8')
assert '@media(prefers-reduced-motion:reduce)' in portfolio_css

# Cookie/privacy surfaces remain native and informational.
for doc in docs:
    assert doc.xpath('//dialog[@id="cookie-settings"]')

forms = []
for doc in docs:
    forms.extend(doc.xpath('//form'))
assert forms and all(form.get('method', '').lower() == 'dialog' and not form.get('action') for form in forms), 'Only native dialog-close forms are allowed'

assert policy.xpath('//link[@rel="canonical" and @href="https://puntoduestudio.it/cookie-policy.html"]')

# Canonical project metadata and sitemap routes.
assert projects.xpath('//link[@rel="canonical" and @href="https://puntoduestudio.it/progetti.html"]')
assert home.xpath('//meta[@property="og:image"]/@content') == ['https://puntoduestudio.it/assets/social-card.png']
assert projects.xpath('//meta[@property="og:image"]/@content') == ['https://puntoduestudio.it/assets/social-card.png']

sitemap = (root / 'sitemap.xml').read_text(encoding='utf-8')
for url in [
    'https://puntoduestudio.it/',
    'https://puntoduestudio.it/progetti.html',
    'https://puntoduestudio.it/cookie-policy.html',
]:
    assert url in sitemap
etree.parse(str(root / 'sitemap.xml'))

print('PASS current multipage structure, five-project portfolio, disclosures, links, assets, cookie surfaces and sitemap')
