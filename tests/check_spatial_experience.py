from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

index = (ROOT / 'index.html').read_text(encoding='utf-8')
css = (ROOT / 'spatial-2026.css').read_text(encoding='utf-8')
js = (ROOT / 'experience-field.js').read_text(encoding='utf-8')

assert '/spatial-2026.css' in index, 'Homepage must load the spatial experience stylesheet'
assert '/experience-field.js' in index, 'Homepage must load the spatial experience runtime'
assert 'prefers-reduced-motion' in css, 'Reduced motion fallback is required'
assert "getContext('webgl2'" in js, 'Runtime must use the native WebGL2 field'
assert 'webglcontextlost' in js, 'WebGL context loss must be handled defensively'
assert 'visibilitychange' in js, 'Rendering must pause while the document is hidden'
assert 'requestAnimationFrame' in js, 'Rendering must be frame-scheduled'
assert 'pd-field-fallback' in js, 'Runtime must provide a non-WebGL fallback state'
assert 'navigator.hardwareConcurrency' in js, 'Runtime must include adaptive quality heuristics'
assert 'data-motion-card' in js, 'Portfolio card interaction must be integrated'

print('spatial experience checks passed')
