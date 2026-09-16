/* Punto Due Studio v11 — case-study transition choreography */
(() => {
  const caseMain = document.querySelector('.case-study-page .case-main');
  if (!caseMain) return;

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  root.classList.add('case-choreography-v11-ready');

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const sections = [...caseMain.querySelectorAll(':scope > .case-section')];
  const next = caseMain.querySelector(':scope > .case-next');

  sections.forEach((section, index) => {
    section.classList.add('case-flow-v11');
    section.dataset.caseFlowIndex = String(index + 1).padStart(2, '0');
    const content = section.querySelector(':scope > .container');
    if (content) content.classList.add('case-flow-content-v11');

    const bridge = document.createElement('span');
    bridge.className = 'case-flow-bridge-v11';
    bridge.setAttribute('aria-hidden', 'true');
    bridge.innerHTML = '<i></i><b></b>';
    section.appendChild(bridge);
  });

  if (next) {
    next.classList.add('case-next-v11');
    const nextLink = next.querySelector('.case-next-link');
    if (nextLink) nextLink.classList.add('case-next-link-v11');
  }

  if (reduceMotion.matches) {
    sections.forEach(section => section.classList.add('is-case-entered'));
    next?.classList.add('is-case-next-ready');
    return;
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-case-entered');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -7% 0px' });
    sections.forEach(section => observer.observe(section));
    if (next) observer.observe(next);
  } else {
    sections.forEach(section => section.classList.add('is-case-entered'));
    next?.classList.add('is-case-entered');
  }

  let raf = 0;
  const render = () => {
    raf = 0;
    const vh = Math.max(1, window.innerHeight);

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const direction = clamp((center - vh / 2) / (vh * .88), -1, 1);
      const proximity = 1 - clamp(Math.abs(center - vh / 2) / (vh * .95), 0, 1);
      const bridge = clamp((vh * 1.14 - rect.bottom) / (vh * .62), 0, 1);

      section.style.setProperty('--pd-flow-y', `${(direction * 4.6).toFixed(2)}px`);
      section.style.setProperty('--pd-flow-rx', `${(-direction * .52).toFixed(3)}deg`);
      section.style.setProperty('--pd-flow-z', `${(proximity * 5.5).toFixed(2)}px`);
      section.style.setProperty('--pd-bridge-progress', bridge.toFixed(4));
      section.classList.toggle('is-case-current', rect.top < vh * .62 && rect.bottom > vh * .38);
    });

    if (next) {
      const rect = next.getBoundingClientRect();
      const progress = clamp((vh - rect.top) / (vh * .7), 0, 1);
      next.style.setProperty('--pd-next-y', `${((1 - progress) * 24).toFixed(2)}px`);
      next.style.setProperty('--pd-next-rx', `${((1 - progress) * 1.65).toFixed(3)}deg`);
      next.style.setProperty('--pd-next-z', `${(progress * 10).toFixed(2)}px`);
      next.style.setProperty('--pd-next-line', progress.toFixed(4));
      next.style.setProperty('--pd-next-arrow', `${(progress * 7).toFixed(2)}px`);
      next.classList.toggle('is-case-next-ready', progress > .12);
    }
  };

  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(render);
  };

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  addEventListener('pageshow', schedule, { passive: true });
  render();
})();
