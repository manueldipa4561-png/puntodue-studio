"""Semantic guard for the Punto Due Studio CSS/JavaScript consolidation.

Unlike the historical regression tests, this contract intentionally avoids
requiring versioned filenames such as site-v8.css or site-v12.css. It protects
user-visible routes and runtime capabilities so implementation files can be
renamed, merged or removed without weakening the site's behavior.
"""
from pathlib import Path
from urllib.parse import urlsplit
from lxml import html

ROOT = Path(__file__).resolve().parents[1]

ROUTES = {
    "home": ROOT / "index.html",
    "projects": ROOT / "progetti.html",
    "case-nodo": ROOT / "progetti" / "nodo.html",
    "case-innesto": ROOT / "progetti" / "innesto.html",
    "case-trama-zero": ROOT / "progetti" / "trama-zero.html",
    "studio": ROOT / "studio.html",
    "method": ROOT / "metodo.html",
    "contact": ROOT / "contatti.html",
    "book-call": ROOT / "prenota-call.html",
    "cookie-policy": ROOT / "cookie-policy.html",
    "404": ROOT / "404.html",
}

for name, path in ROUTES.items():
    assert path.is_file(), f"Missing route source: {name} -> {path.relative_to(ROOT)}"

DOCS = {name: html.parse(str(path)) for name, path in ROUTES.items()}

# Every public document keeps a single primary heading and valid unique IDs.
for name, doc in DOCS.items():
    h1s = doc.xpath("//h1")
    assert len(h1s) == 1, f"Expected exactly one h1 in {name}, found {len(h1s)}"
    ids = doc.xpath("//*[@id]/@id")
    assert len(ids) == len(set(ids)), f"Duplicate IDs in {name}"

# Local HTML resources must resolve. Query strings/fragments are ignored.
for name, doc in DOCS.items():
    for node in doc.xpath("//*[@src] | //link[@href]"):
        value = node.get("src") or node.get("href")
        if not value or value.startswith("#"):
            continue
        parsed = urlsplit(value)
        if parsed.scheme or parsed.netloc:
            continue
        local_path = parsed.path
        if not local_path:
            continue
        resolved = ROOT / local_path.lstrip("/")
        assert resolved.is_file(), f"Missing local resource in {name}: {value}"

# Blank-target links stay isolated from window.opener.
for name, doc in DOCS.items():
    for link in doc.xpath('//a[@target="_blank"]'):
        rel = set((link.get("rel") or "").split())
        assert "noopener" in rel, f"Missing noopener in {name}: {link.get('href')}"

# Shared modern pages retain their principal navigation/cookie structure.
MODERN = [
    "home", "projects", "case-nodo", "case-innesto", "case-trama-zero",
    "studio", "method", "contact", "book-call",
]
for name in MODERN:
    doc = DOCS[name]
    assert doc.xpath('//header[contains(concat(" ", normalize-space(@class), " "), " site-header ")]'), name
    assert doc.xpath('//nav[contains(concat(" ", normalize-space(@class), " "), " site-nav ")]'), name
    assert doc.xpath('//footer'), name
    assert doc.xpath('//dialog[@id="cookie-settings"]'), f"Cookie dialog missing in {name}"
    assert doc.xpath('//*[@data-cookie-open]'), f"Cookie opener missing in {name}"

# Portfolio contract: order and destinations are business-critical.
projects = DOCS["projects"]
premium = projects.xpath('//article[contains(concat(" ", normalize-space(@class), " "), " premium-project-v7 ")]')
assert [node.get("id") for node in premium] == ["nodo", "innesto", "trama-zero"]
archive = projects.xpath('//a[contains(concat(" ", normalize-space(@class), " "), " archive-card-v7 ")]')
assert [node.get("id") for node in archive] == ["beer-hops", "cultura-tattoo"]

EXPECTED_DEMOS = {
    "https://nodo-ortodonzia-cura-integrata-demo.netlify.app/",
    "https://innesto-demo.netlify.app/",
    "https://trama-zero-demo.netlify.app/",
    "https://joyful-sprinkles-4b402e.netlify.app/",
    "https://cultura-tattoo-demo.netlify.app/",
}
project_hrefs = set(projects.xpath("//a/@href"))
assert EXPECTED_DEMOS <= project_hrefs, "One or more live demo destinations changed"

# Case-study route mapping must survive consolidation.
EXPECTED_NEXT = {
    "case-nodo": "/progetti/innesto.html",
    "case-innesto": "/progetti/trama-zero.html",
    "case-trama-zero": "/progetti.html",
}
for name, expected in EXPECTED_NEXT.items():
    links = DOCS[name].xpath('//a[contains(concat(" ", normalize-space(@class), " "), " case-next-link ")]/@href')
    assert links == [expected], f"Unexpected next-project mapping in {name}: {links}"
    assert DOCS[name].xpath('//main[contains(concat(" ", normalize-space(@class), " "), " case-main ")]')
    assert DOCS[name].xpath('//*[@data-case-progress]')
    assert DOCS[name].xpath('//section[contains(concat(" ", normalize-space(@class), " "), " case-section ")]')

# Studio identity contract.
studio = DOCS["studio"]
founders = studio.xpath('//article[contains(concat(" ", normalize-space(@class), " "), " founder-v9 ")]')
assert len(founders) == 2, "Studio must retain two founder cards"
assert [node.get("data-card-number") for node in founders] == ["01", "02"]
assert studio.xpath('//*[@data-dual-field]'), "Dual Field host missing from Studio"

# Contact brief contract.
contact = DOCS["contact"]
for control_id in ["brief-message", "brief-manuel", "brief-nicolas"]:
    assert contact.xpath(f'//*[@id="{control_id}"]'), f"Missing contact brief control: {control_id}"
assert contact.xpath('//input[@name="need"]')
assert contact.xpath('//input[@name="stage"]')

# Booking page keeps its dedicated route and call page hook.
book_call = DOCS["book-call"]
assert book_call.xpath('//body[contains(concat(" ", normalize-space(@class), " "), " call-page ")]')

# Legacy utility routes remain reachable until intentionally migrated.
policy = DOCS["cookie-policy"]
assert policy.xpath('//link[@rel="canonical" and @href="https://puntoduestudio.it/cookie-policy.html"]')
not_found = DOCS["404"]
assert not_found.xpath('//body[contains(concat(" ", normalize-space(@class), " "), " not-found-page ")]')

# Progressive enhancement must survive regardless of future file names.
css_text = "\n".join(path.read_text(encoding="utf-8", errors="ignore") for path in ROOT.glob("*.css"))
js_text = "\n".join(path.read_text(encoding="utf-8", errors="ignore") for path in ROOT.glob("*.js"))
all_runtime = css_text + "\n" + js_text
assert "prefers-reduced-motion" in all_runtime, "Reduced-motion support disappeared"
assert "IntersectionObserver" in js_text, "IntersectionObserver progressive enhancement disappeared"
assert "requestAnimationFrame" in js_text, "Animation scheduling disappeared unexpectedly"
assert "webgl" in js_text.lower(), "WebGL capability/fallback layer disappeared unexpectedly"
assert "pd-field-fallback" in all_runtime, "Spatial field fallback contract disappeared"

# Optional tracking must not be introduced during architecture cleanup.
html_text = "\n".join(path.read_text(encoding="utf-8", errors="ignore") for path in ROUTES.values())
tracking_haystack = (html_text + "\n" + js_text).lower()
for forbidden in ["googletagmanager", "facebook.net/", "gtag(", "fbq("]:
    assert forbidden not in tracking_haystack, f"Unexpected tracking integration detected: {forbidden}"

print("PASS semantic pre-consolidation route, resource, portfolio, case, studio, contact, accessibility and fallback contract")
