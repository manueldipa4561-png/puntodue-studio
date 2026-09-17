"""Protect route-specific CSS/JS responsibility boundaries during consolidation."""
from pathlib import Path
from lxml import html

ROOT = Path(__file__).resolve().parents[1]

paths = {
    'home': ROOT / 'index.html',
    'projects': ROOT / 'progetti.html',
    'nodo': ROOT / 'progetti' / 'nodo.html',
    'innesto': ROOT / 'progetti' / 'innesto.html',
    'trama': ROOT / 'progetti' / 'trama-zero.html',
    'studio': ROOT / 'studio.html',
    'method': ROOT / 'metodo.html',
    'contact': ROOT / 'contatti.html',
    'call': ROOT / 'prenota-call.html',
    'policy': ROOT / 'cookie-policy.html',
    '404': ROOT / '404.html',
}

docs = {name: html.parse(str(path)) for name, path in paths.items()}
shared = (ROOT / 'site-v4.js').read_text(encoding='utf-8')

# Shared runtime owns the current semantic modules, not historical generations.
for required in (
    '/spatial-2026.css',
    '/experience-field.js',
    '/shared-patches.css',
    '/typography.css',
    '/motion.js',
    '/case-motion.css',
    '/case-runtime.js',
    '/portfolio-refinements.css',
):
    assert required in shared, required

for obsolete in (
    '/site-v5-fixes.css',
    '/site-v6.css',
    '/mobile-menu-hotfix.css',
    '/site-v9.css',
    '/site-v9.js',
    '/site-v11.css',
    '/site-v12.css',
    '/site-v13.css',
    '/site-v11.js',
    '/site-v8-benchmark.css',
):
    assert obsolete not in shared, f'Obsolete shared loader reference: {obsolete}'

# Portfolio runtime exists only on Home, Projects and case studies.
portfolio_routes = {'home', 'projects', 'nodo', 'innesto', 'trama'}
for name, doc in docs.items():
    has_portfolio = bool(doc.xpath('//script[@src="/portfolio-v8.js"]'))
    assert has_portfolio == (name in portfolio_routes), (name, has_portfolio)

# Route-specific functional modules must remain local to their consumer.
assert docs['contact'].xpath('//script[@src="/contact-brief.js"]')
for name, doc in docs.items():
    if name != 'contact':
        assert not doc.xpath('//script[@src="/contact-brief.js"]'), name

assert docs['studio'].xpath('//script[@src="/dual-field-v5.js"]')
for name, doc in docs.items():
    if name != 'studio':
        assert not doc.xpath('//script[@src="/dual-field-v5.js"]'), name

assert docs['call'].xpath('//script[@src="/call-object.js"]')
for name, doc in docs.items():
    if name != 'call':
        assert not doc.xpath('//script[@src="/call-object.js"]'), name

# Legacy utility pages consume the renamed typography stylesheet directly while
# their broader migration remains intentionally deferred.
assert docs['policy'].xpath('//link[@href="/typography.css"]')
assert docs['404'].xpath('//link[@href="/typography.css"]')
assert docs['policy'].xpath('//script[@src="/experience.js"]')
assert not docs['404'].xpath('//script[@src="/experience.js"]')

# Historical module files must be physically gone after semantic migration.
for obsolete_file in (
    'site-v5-fixes.css', 'site-v6.css', 'mobile-menu-hotfix.css',
    'site-v9.css', 'site-v9.js', 'site-v11.css', 'site-v12.css',
    'site-v13.css', 'site-v11.js', 'site-v8-benchmark.css',
):
    assert not (ROOT / obsolete_file).exists(), obsolete_file

print('PASS route-scoped production load graph and semantic module boundaries')
