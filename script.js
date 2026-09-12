const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() { navigation.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }
menu.addEventListener('click', () => { const open = navigation.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); });
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && navigation.classList.contains('open')) { closeMenu(); menu.focus(); } });
document.querySelector('#year').textContent = new Date().getFullYear();
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }); }, { threshold: 0.08 });
  document.querySelectorAll('.intro > div, .section-heading, .project-card, .service-row, .process-grid article, .contact-grid article').forEach(element => { element.classList.add('reveal'); observer.observe(element); });
}
const scene = document.querySelector('.interactive-scene');
const angle = document.querySelector('#scene-angle');
const reset = document.querySelector('#scene-reset');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let sceneFrame = 0;
function rotateScene(x, y) {
  cancelAnimationFrame(sceneFrame);
  sceneFrame = requestAnimationFrame(() => {
    if (reduceMotion.matches) return;
    scene.style.setProperty('--scene-x', x + 'deg');
    scene.style.setProperty('--scene-y', y + 'deg');
  });
}
if (scene && angle && reset) {
  angle.addEventListener('input', () => rotateScene(0, Number(angle.value)));
  reset.addEventListener('click', () => { angle.value = '0'; rotateScene(0, 0); });
  scene.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || event.target.closest('.scene-controls')) return;
    const rect = scene.getBoundingClientRect();
    const y = Math.max(-20, Math.min(20, ((event.clientX - rect.left) / rect.width - .5) * 40));
    const x = Math.max(-10, Math.min(10, ((event.clientY - rect.top) / rect.height - .5) * -20));
    angle.value = String(Math.round(y));
    rotateScene(x, y);
  });
  scene.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse') { angle.value = '0'; rotateScene(0, 0); } });
  reduceMotion.addEventListener('change', () => { cancelAnimationFrame(sceneFrame); scene.style.removeProperty('--scene-x'); scene.style.removeProperty('--scene-y'); angle.value = '0'; });
}
window.matchMedia('(min-width:601px)').addEventListener('change', closeMenu);
