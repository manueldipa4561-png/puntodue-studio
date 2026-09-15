"""Structural validation; requires lxml. Does not render browser viewports."""
from pathlib import Path
from urllib.parse import urlsplit, parse_qs
from lxml import html, etree

root = Path(__file__).resolve().parents[1]
doc = html.parse(str(root / 'index.html'))
policy = html.parse(str(root / 'cookie-policy.html'))
ids = doc.xpath('//*[@id]/@id')
assert len(ids) == len(set(ids)), 'Duplicate IDs'
assert len(doc.xpath('//h1')) == 1
assert len(doc.xpath('//section[@id="domande"]//details/summary')) == 6

cards = doc.xpath('//article[contains(concat(" ", normalize-space(@class), " "), " project-card ")]')
assert [card.get('data-project') for card in cards] == ['corriera', 'eden', 'bongo', 'beer']
assert [card.xpath('.//*[contains(concat(" ", normalize-space(@class), " "), " package-level ")][1]/text()')[0].strip() for card in cards] == ['ESSENZIALE', 'PRESENZA', 'CRESCITA', 'EVOLUZIONE']
assert all(card.xpath('.//*[contains(concat(" ", normalize-space(@class), " "), " demo-label ")][contains(., "non commissionato")]') for card in cards)

for href in doc.xpath('//a/@href'):
    if href.startswith('#') and len(href) > 1:
        assert href[1:] in ids, href
    if 'wa.me' in href:
        parsed = urlsplit(href)
        assert parsed.path in ['/393248423657', '/393248165947']
        assert parse_qs(parsed.query).get('text')

for parsed_doc in [doc, policy]:
    for el in parsed_doc.xpath('//*[@src] | //link[@href]'):
        path = el.get('src') or el.get('href')
        if not urlsplit(path).scheme and not path.startswith('#'):
            assert (root / path.lstrip('/')).is_file(), path

for image in doc.xpath('//img'):
    assert image.get('alt') is not None
    assert image.get('width') and image.get('height')

for image in doc.xpath('//a[contains(@class,"project-cover-link")]/img'):
    assert image.get('loading') == 'lazy'
    assert image.get('decoding') == 'async'

for link in doc.xpath('//a[@target="_blank"]'):
    assert 'noopener' in link.get('rel', '')

for preview in ['corriera-preview.webp', 'eden-preview.webp', 'bongo-preview.webp', 'beer-preview.webp']:
    assert (root / 'assets' / preview).is_file(), preview

for cover in ['virgilio', 'corriera']:
    etree.parse(str(root / f'assets/{cover}-cover.svg'))

sitemap = (root / 'sitemap.xml').read_text()
assert 'https://puntoduestudio.it/' in sitemap
assert 'https://puntoduestudio.it/cookie-policy.html' in sitemap
etree.parse(str(root / 'sitemap.xml'))
assert doc.xpath('//meta[@property="og:image"]/@content') == ['https://puntoduestudio.it/assets/social-card.png']

forms = doc.xpath('//form') + policy.xpath('//form')
assert forms and all(form.get('method', '').lower() == 'dialog' and not form.get('action') for form in forms), 'Only native dialog-close forms are allowed'
assert len(doc.xpath('//a[contains(@class,"project-cover-link")]')) == 4
assert len(doc.xpath('//a[contains(concat(" ", normalize-space(@class), " "), " brief-start ")]')) >= 3
assert doc.xpath('//dialog[@id="cookie-settings"]')
assert policy.xpath('//dialog[@id="cookie-settings"]')
assert doc.xpath('//link[@href="experience.css"]') and doc.xpath('//script[@src="experience.js"]')
assert policy.xpath('//link[@rel="canonical" and @href="https://puntoduestudio.it/cookie-policy.html"]')
print('PASS structure, portfolio order, FAQ, links, images, contacts, cookie policy/dialog, sitemap and social metadata')
