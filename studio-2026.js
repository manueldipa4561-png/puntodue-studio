/* Punto Due Studio — 2026 interaction layer */
(() => {
  /* Focused visual refinement layer. Kept separate so the core redesign remains easy to audit. */
  const refinementStyles = document.createElement('link');
  refinementStyles.rel = 'stylesheet';
  refinementStyles.href = '/studio-refinements.css?v=20260916';
  document.head.appendChild(refinementStyles);
  document.documentElement.classList.add('pds-refined');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 760px)');
  const headerShell = document.querySelector('.header-shell');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  const main = document.querySelector('main');
  const footer = document.querySelector('footer');
  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();

  const updateHeader = () => headerShell?.classList.toggle('is-scrolled', window.scrollY > 12);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menu && nav) {
    const pageRegions = [main, footer].filter(Boolean);
    const setMenu = (open, restore = false) => {
      nav.classList.toggle('open', open);
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
      document.documentElement.classList.toggle('menu-open', open && mobile.matches);
      pageRegions.forEach(region => region.toggleAttribute('inert', open && mobile.matches));
      if (restore) menu.focus();
    };
    menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') setMenu(false, true);
    });
    mobile.addEventListener('change', () => setMenu(false));
  }

  /* Restrained reveal system */
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });

    document.querySelectorAll('.project-showcase,.capability-row,.process-step,.founder-card,.intro-point').forEach(node => {
      node.classList.add('reveal');
      revealObserver.observe(node);
    });
  }

  /* Signature spatial scene — native CSS, pointer driven, no continuous render loop. */
  const scene = document.querySelector('[data-signature-scene]');
  if (scene && !reduceMotion.matches) {
    let raf = 0;
    const render = (x, y) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        scene.style.setProperty('--rx', `${x}deg`);
        scene.style.setProperty('--ry', `${y}deg`);
      });
    };
    scene.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      const rect = scene.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = (event.clientX - rect.left) / rect.width - .5;
      const ny = (event.clientY - rect.top) / rect.height - .5;
      render(Math.max(-6, Math.min(6, ny * -12)), Math.max(-10, Math.min(10, nx * 20)));
    });
    scene.addEventListener('pointerleave', () => render(0, 0));
    let ticking = false;
    const updateDrift = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = scene.getBoundingClientRect();
        const progress = Math.max(-1, Math.min(1, (window.innerHeight * .55 - rect.top) / (window.innerHeight + rect.height)));
        scene.style.setProperty('--drift', `${progress * 12}px`);
        ticking = false;
      });
    };
    window.addEventListener('scroll', updateDrift, { passive: true });
    updateDrift();
  }

  /* Accurate project previews: keep the real demos, but load them much closer to view. */
  const previewWindows = [...document.querySelectorAll('.preview-window[data-src]')];
  const sizePreview = preview => {
    const iframe = preview.querySelector('iframe');
    if (!iframe) return;
    const baseWidth = mobile.matches ? 1180 : 1440;
    const scale = preview.clientWidth / baseWidth;
    preview.style.setProperty('--preview-scale', String(scale));
  };
  const mountPreview = preview => {
    if (preview.dataset.mounted === 'true') return;
    preview.dataset.mounted = 'true';
    const iframe = document.createElement('iframe');
    iframe.title = `Anteprima live: ${preview.dataset.title || 'progetto Punto Due Studio'}`;
    iframe.loading = 'lazy';
    iframe.tabIndex = -1;
    iframe.setAttribute('aria-hidden', 'true');
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.src = preview.dataset.src;
    iframe.addEventListener('load', () => preview.classList.add('loaded'), { once: true });
    preview.appendChild(iframe);
    sizePreview(preview);
  };
  if ('IntersectionObserver' in window) {
    const previewObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        mountPreview(entry.target);
        previewObserver.unobserve(entry.target);
      });
    }, { rootMargin: mobile.matches ? '40px 0px' : '140px 0px', threshold: 0 });
    previewWindows.forEach(preview => previewObserver.observe(preview));
  } else {
    previewWindows.forEach(mountPreview);
  }
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(entries => entries.forEach(entry => sizePreview(entry.target)));
    previewWindows.forEach(preview => ro.observe(preview));
  } else {
    window.addEventListener('resize', () => previewWindows.forEach(sizePreview));
  }
  mobile.addEventListener('change', () => previewWindows.forEach(sizePreview));

  /* Cookie preferences stay accessible without introducing optional tracking. */
  const cookieDialog = document.querySelector('#cookie-settings');
  if (cookieDialog && typeof cookieDialog.showModal === 'function') {
    document.querySelectorAll('[data-cookie-open]').forEach(button => {
      button.addEventListener('click', () => {
        if (!cookieDialog.open) cookieDialog.showModal();
      });
    });
    cookieDialog.addEventListener('click', event => {
      if (event.target !== cookieDialog) return;
      const rect = cookieDialog.getBoundingClientRect();
      const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!inside) cookieDialog.close();
    });
  }
})();
