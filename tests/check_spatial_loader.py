from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
shared = (ROOT / 'site-v4.js').read_text(encoding='utf-8')

assert '/spatial-2026.css' in shared
assert '/experience-field.js' in shared
assert "document.querySelector('script[src=\"/experience-field.js\"]')" in shared
print('spatial loader checks passed')
