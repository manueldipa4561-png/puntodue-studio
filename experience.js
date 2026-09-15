/* Punto Due Studio — spatial/motion and privacy preferences enhancement. */
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  root.classList.add('experience-ready');

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  /* Signature hero depth. Existing scene controls remain authoritative. */
  const hero = document.querySelector('.interactive-scene');
  let heroFrame = 0;
  const resetHero = () => {
    if (!hero) return;
    hero.classList.remove('spatial-active');
    hero.style.removeProperty('--shift-x');
    hero.style.removeProperty('--shift-y');
  };
  if (hero) {
    hero.addEventListener('pointermove', event => {
      if (!finePointer.matches || reduceMotion.matches || event.pointerType !== 'mouse') return;
      const rect = hero.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = clamp((event.clientX - rect.left) / rect.width - .5, -.5, .5);
      const ny = clamp((event.clientY - rect.top) / rect.height - .5, -.5, .5);
      cancelAnimationFrame(heroFrame);
      heroFrame = requestAnimationFrame(() => {
        hero.classList.add('spatial-active');
        hero.style.setProperty('--shift-x', `${(nx * 9).toFixed(2)}px`);
        hero.style.setProperty('--shift-y', `${(ny * 7).toFixed(2)}px`);
      });
    });
    hero.addEventListener('pointerleave', resetHero);
  }

  /* Portfolio depth is intentionally fine-pointer only. */
  const cardFrames = new WeakMap();
  const resetCard = card => {
    const cover = card.querySelector('.project-cover-link');
    if (!cover) return;
    card.classList.remove('spatial-card-active');
    ['--tilt-x','--tilt-y','--shine-x','--shine-y'].forEach(name => cover.style.removeProperty(name));
  };
  document.querySelectorAll('.project-card').forEach(card => {
    const cover = card.querySelector('.project-cover-link');
    if (!cover) return;
    cover.addEventListener('pointermove', event => {
      if (!finePointer.matches || reduceMotion.matches || event.pointerType !== 'mouse') return;
      const rect = cover.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const py = clamp((event.clientY - rect.top) / rect.height, 0, 1);
      cancelAnimationFrame(cardFrames.get(card) || 0);
      const frame = requestAnimationFrame(() => {
        card.classList.add('spatial-card-active');
        cover.style.setProperty('--tilt-x', `${((.5 - py) * 4.5).toFixed(2)}deg`);
        cover.style.setProperty('--tilt-y', `${((px - .5) * 5.5).toFixed(2)}deg`);
        cover.style.setProperty('--shine-x', `${(px * 100).toFixed(1)}%`);
        cover.style.setProperty('--shine-y', `${(py * 100).toFixed(1)}%`);
      });
      cardFrames.set(card, frame);
    });
    cover.addEventListener('pointerleave', () => resetCard(card));
    cover.addEventListener('blur', () => resetCard(card), true);
  });

  /* One-shot convergence and process progression; no scroll-jacking. */
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const staged = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-active');
        staged.unobserve(entry.target);
      });
    }, { threshold: .28 });
    const convergence = document.querySelector('.convergence-stage');
    const process = document.querySelector('.process');
    if (convergence) staged.observe(convergence);
    if (process) staged.observe(process);
  } else {
    document.querySelector('.convergence-stage')?.classList.add('is-active');
    document.querySelector('.process')?.classList.add('is-active');
  }

  /* Quiet current-section feedback in the sticky navigation. */
  const navLinks = [...document.querySelectorAll('#navigation a[href^="#"]')];
  const navTargets = navLinks.map(link => {
    const id = link.getAttribute('href')?.slice(1);
    return [link, id ? document.getElementById(id) : null];
  }).filter(([, target]) => target);
  if ('IntersectionObserver' in window && navTargets.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navTargets.forEach(([link,target]) => link.classList.toggle('is-current', target === visible.target));
    }, { rootMargin: '-24% 0px -58% 0px', threshold: [0,.2,.45,.7] });
    navTargets.forEach(([,target]) => sectionObserver.observe(target));
  }

  /* Contact depth is based on viewport position, event-driven and disabled for reduced motion. */
  const contact = document.querySelector('.contact');
  let contactFrame = 0;
  const updateContact = () => {
    if (!contact || reduceMotion.matches) return;
    cancelAnimationFrame(contactFrame);
    contactFrame = requestAnimationFrame(() => {
      const rect = contact.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const delta = clamp((center - window.innerHeight / 2) / window.innerHeight, -1, 1);
      contact.style.setProperty('--contact-shift', `${(delta * -18).toFixed(1)}px`);
    });
  };
  if (contact) {
    window.addEventListener('scroll', updateContact, { passive: true });
    window.addEventListener('resize', updateContact, { passive: true });
    updateContact();
  }

  /* Cookie/settings interface. The current site has no optional tracking categories. */
  const cookieDialog = document.querySelector('#cookie-settings');
  const cookieOpeners = document.querySelectorAll('[data-cookie-open]');
  let cookieReturnFocus = null;
  if (cookieDialog && typeof cookieDialog.showModal === 'function') {
    cookieOpeners.forEach(button => button.addEventListener('click', () => {
      cookieReturnFocus = button;
      if (!cookieDialog.open) cookieDialog.showModal();
    }));
    cookieDialog.addEventListener('close', () => {
      cookieReturnFocus?.focus?.();
      cookieReturnFocus = null;
    });
    cookieDialog.addEventListener('click', event => {
      const rect = cookieDialog.getBoundingClientRect();
      const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
      if (outside) cookieDialog.close();
    });
  } else {
    cookieOpeners.forEach(button => button.hidden = true);
  }

  const clearSpatial = () => {
    resetHero();
    document.querySelectorAll('.project-card').forEach(resetCard);
  };
  reduceMotion.addEventListener('change', clearSpatial);
  finePointer.addEventListener('change', clearSpatial);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(heroFrame);
      cancelAnimationFrame(contactFrame);
      clearSpatial();
    }
  });
})();
