/* Progressive enhancement: the document is usable before this file runs. */
(() => {
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  const mobile = window.matchMedia('(max-width: 600px)');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();

  if (menu && navigation) {
    function setMenu(open, restoreFocus = false) {
      navigation.classList.toggle('open', open);
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
      if (restoreFocus) menu.focus();
    }
    menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
    navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      // Move focus to the destination so it never remains inside a closed menu.
      const target = document.querySelector(link.getAttribute('href'));
      setMenu(false);
      if (mobile.matches && target) {
        const original = target.getAttribute('tabindex');
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.addEventListener('blur', () => {
          if (original === null) target.removeAttribute('tabindex');
          else target.setAttribute('tabindex', original);
        }, { once: true });
      }
    }));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') setMenu(false, true);
    });
    document.addEventListener('click', event => {
      if (mobile.matches && !event.target.closest('.header')) setMenu(false);
    });
    mobile.addEventListener('change', () => {
      const focusWouldBeHidden = mobile.matches && navigation.contains(document.activeElement);
      setMenu(false, focusWouldBeHidden);
    });
    document.documentElement.classList.add('menu-ready');
  }

  if ('IntersectionObserver' in window && !motion.matches) {
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        reveal.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.project-card, .service-row, .process-grid article, .contact-grid article').forEach(element => {
      element.classList.add('reveal');
      reveal.observe(element);
    });
  }

  const scene = document.querySelector('.interactive-scene');
  const angle = document.querySelector('#scene-angle');
  const reset = document.querySelector('#scene-reset');
  if (!scene || !angle || !reset) return;
  let frame = 0;
  let inView = true;
  const cancel = () => { cancelAnimationFrame(frame); frame = 0; };
  const clear = () => {
    cancel();
    scene.style.removeProperty('--scene-x');
    scene.style.removeProperty('--scene-y');
    angle.value = '0';
  };
  function rotate(x, y) {
    cancel();
    if (motion.matches || document.hidden || !inView) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (motion.matches || document.hidden || !inView) return;
      scene.style.setProperty('--scene-x', x + 'deg');
      scene.style.setProperty('--scene-y', y + 'deg');
    });
  }
  angle.addEventListener('input', () => rotate(0, Number(angle.value)));
  reset.addEventListener('click', clear);
  scene.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || event.target.closest('.scene-controls') ||
        motion.matches || document.hidden || !inView) return;
    const rect = scene.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const y = Math.max(-20, Math.min(20, ((event.clientX - rect.left) / rect.width - .5) * 40));
    const x = Math.max(-10, Math.min(10, ((event.clientY - rect.top) / rect.height - .5) * -20));
    angle.value = String(Math.round(y));
    rotate(x, y);
  });
  scene.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse') clear(); });
  motion.addEventListener('change', clear);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); });
  if ('IntersectionObserver' in window) {
    const visibility = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (!inView) cancel();
    });
    visibility.observe(scene);
  }
  scene.classList.add('scene-ready');
})();
