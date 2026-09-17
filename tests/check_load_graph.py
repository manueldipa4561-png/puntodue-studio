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
    '/editorial-system.css',
    '/homepage.css',
    '/projects-experience.css',
    '/studio-experience.css',
    '/case-experience.css',
    '/interaction-polish.css',
    '/interaction-polish.js',
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

# Shared editorial system is limited to the enhanced visual families.
assert "if(enhancedExperience)appendStyle('/editorial-system.css')" in shared
assert (ROOT / 'editorial-system.css').is_file()
editorial_css = (ROOT / 'editorial-system.css').read_text(encoding='utf-8')
for token in ('--pd-cream:', '--pd-charcoal:', '--pd-olive:', 'content:"PUNTO DUE"'):
    assert token in editorial_css, token

# Homepage art direction is detected from the real hero and kept route-scoped.
assert "document.querySelector('.home-hero')" in shared
assert "document.body.classList.add('home-experience')" in shared
assert (ROOT / 'homepage.css').is_file()
assert docs['home'].xpath('//section[contains(concat(" ", normalize-space(@class), " "), " home-hero ")]')
for name in paths:
    if name != 'home':
        assert not docs[name].xpath('//section[contains(concat(" ", normalize-space(@class), " "), " home-hero ")]'), name

# Projects, Studio and case studies each receive their own final art-direction module.
assert "document.querySelector('.projects-page-v7')" in shared
assert "document.body.classList.add('projects-experience')" in shared
assert "document.querySelector('.founders-grid-v9')" in shared
assert "document.body.classList.add('studio-experience')" in shared
assert "document.body.classList.contains('case-study-page')" in shared
for visual_file in ('projects-experience.css', 'studio-experience.css', 'case-experience.css'):
    assert (ROOT / visual_file).is_file(), visual_file

assert docs['projects'].xpath('//section[contains(concat(" ", normalize-space(@class), " "), " projects-page-v7 ")]')
assert docs['studio'].xpath('//*[contains(concat(" ", normalize-space(@class), " "), " founders-grid-v9 ")]')
for name in ('nodo', 'innesto', 'trama'):
    body_classes = docs[name].xpath('string(/html/body/@class)')
    assert 'case-study-page' in body_classes.split(), name

# Interaction polish is native, dependency-free and limited to the four experience families.
assert "const enhancedExperience=homeExperience||caseExperience||projectsExperience||studioExperience" in shared
assert "if(enhancedExperience)" in shared
for interaction_file in ('interaction-polish.css', 'interaction-polish.js'):
    assert (ROOT / interaction_file).is_file(), interaction_file
interaction_js = (ROOT / 'interaction-polish.js').read_text(encoding='utf-8')
interaction_css = (ROOT / 'interaction-polish.css').read_text(encoding='utf-8')
assert 'prefers-reduced-motion: reduce' in interaction_js
assert '(hover:hover) and (pointer:fine)' in interaction_js
assert 'rb-stack-ready' in interaction_js and 'rb-stack-ready' in interaction_css
assert 'react' not in interaction_js.lower(), 'Interaction polish must not import React'

# Portfolio runtime exists only on Home, Projects and case studies.
portfolio_routes = {'home', 'projects', 'nodo', 'innesto', 'trama'}
for name, doc in docs.items():
    has_portfolio = bool(doc.xpath('//script[@src="/portfolio-v8.js"]'))
    assert has_portfolio == (name in portfolio_routes), (name, has_portfolio)

# Route-specific functional modules must remain local to their consumers.
assert docs['contact'].xpath('//script[@src="/contact-brief.js"]')
for name, doc in docs.items():
    if name != 'contact':
        assert not doc.xpath('//script[@src="/contact-brief.js"]'), name

# Dual Field is intentionally shared by the Home hero and the Studio identity demo.
dual_field_routes = {'home', 'studio'}
for name, doc in docs.items():
    has_dual_field = bool(doc.xpath('//script[@src="/dual-field-v5.js"]'))
    assert has_dual_field == (name in dual_field_routes), (name, has_dual_field)
    has_dual_field_markup = bool(doc.xpath('//*[@data-dual-field]'))
    assert has_dual_field_markup == (name in dual_field_routes), (name, has_dual_field_markup)

assert docs['call'].xpath('//script[@src="/call-object.js"]')
for name, doc in docs.items():
    if name != 'call':
        assert not doc.xpath('//script[@src="/call-object.js"]'), name

# Cookie Policy and 404 share a focused utility stylesheet instead of the retired
# style.css / polish.css / experience.css island. Only the Policy needs dialog JS.
for name in ('policy', '404'):
    doc = docs[name]
    assert doc.xpath('//link[@href="/utility-routes.css"]'), name
    assert doc.xpath('//link[@href="/site-v5.css"]'), name
    assert doc.xpath('//link[@href="/typography.css"]'), name
    for legacy in ('/style.css', '/polish.css', '/experience.css'):
        assert not doc.xpath(f'//link[@href="{legacy}"]'), (name, legacy)

assert docs['policy'].xpath('//script[@src="/privacy-dialog.js"]')
assert not docs['404'].xpath('//script[@src="/privacy-dialog.js"]')
for name, doc in docs.items():
    assert not doc.xpath('//script[@src="/experience.js"]'), name

# Historical module files must be physically gone after semantic migration.
for obsolete_file in (
    'site-v5-fixes.css', 'site-v6.css', 'mobile-menu-hotfix.css',
    'site-v9.css', 'site-v9.js', 'site-v11.css', 'site-v12.css',
    'site-v13.css', 'site-v11.js', 'site-v8-benchmark.css',
    'style.css', 'polish.css', 'experience.css', 'experience.js',
):
    assert not (ROOT / obsolete_file).exists(), obsolete_file

assert (ROOT / 'utility-routes.css').is_file()
assert (ROOT / 'privacy-dialog.js').is_file()

print('PASS route-scoped production load graph, editorial system, utility-route migration, visual modules and interaction polish boundaries')