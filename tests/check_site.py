"""Structural validation; requires lxml. Does not render a browser viewport."""
from pathlib import Path
from urllib.parse import urlsplit, parse_qs
from lxml import html, etree

root = Path(__file__).resolve().parents[1]
doc = html.parse(str(root / 'index.html'))
ids = doc.xpath('//*[@id]/@id')
assert len(ids) == len(set(ids)), 'Duplicate IDs'
assert len(doc.xpath('//h1')) == 1
assert len(doc.xpath('//details/summary')) == 5
for href in doc.xpath('//a/@href'):
    if href.startswith('#') and len(href) > 1:
        assert href[1:] in ids, href
    if 'wa.me' in href:
        parsed = urlsplit(href)
        assert parsed.path in ['/393248423657', '/393248165947']
        assert parse_qs(parsed.query).get('text')
for el in doc.xpath('//*[@src] | //link[@href]'):
    path = el.get('src') or el.get('href')
    if not urlsplit(path).scheme:
        assert (root / path).is_file(), path
for image in doc.xpath('//img'):
    assert image.get('alt') is not None
    assert image.get('width') and image.get('height')
for link in doc.xpath('//a[@target="_blank"]'):
    assert 'noopener' in link.get('rel', '')
for cover in ['virgilio', 'corriera']:
    etree.parse(str(root / f'assets/{cover}-cover.svg'))
assert 'https://puntoduestudio.it/' in (root / 'sitemap.xml').read_text()
etree.parse(str(root / 'sitemap.xml'))
assert doc.xpath('//meta[@property="og:image"]/@content') == ['https://puntoduestudio.it/assets/social-card.png']
assert not doc.xpath('//form'), 'Unconfigured form'
assert len(doc.xpath('//a[contains(@class,"project-cover-link")]')) == 2
print('PASS HTML links, headings, image dimensions, contact targets, SVG/XML, social metadata')
