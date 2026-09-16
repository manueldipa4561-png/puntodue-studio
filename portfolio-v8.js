/* Punto Due Studio v8 — progressive micro-motion */
(() => {
  if (!document.querySelector('link[href="/site-v8-benchmark.css"]')) {
    const benchmark = document.createElement('link');
    benchmark.rel = 'stylesheet';
    benchmark.href = '/site-v8-benchmark.css';
    document.head.appendChild(benchmark);
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)');
  const root = document.documentElement;

  root.classList.add('motion-ready');

  const revealNodes = [...document.querySelectorAll('[data-motion-reveal]')];
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    revealNodes.forEach(node => node.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -7% 0px' });
    revealNodes.forEach(node => revealObserver.observe(node));
  }

  if (finePointer.matches && !reduceMotion.matches) {
    document.querySelectorAll('[data-motion-card]').forEach(card => {
      let raf = 0;
      let nextX = 0;
      let nextY = 0;
      const render = () => {
        raf = 0;
        card.style.setProperty('--motion-x', `${nextX.toFixed(2)}px`);
        card.style.setProperty('--motion-y', `${nextY.toFixed(2)}px`);
      };
      const move = event => {
        const rect = card.getBoundingClientRect();
        const nx = ((event.clientX - rect.left) / rect.width) - 0.5;
        const ny = ((event.clientY - rect.top) / rect.height) - 0.5;
        nextX = nx * 12;
        nextY = ny * 10;
        card.classList.add('is-pointer-active');
        if (!raf) raf = requestAnimationFrame(render);
      };
      const reset = () => {
        nextX = 0;
        nextY = 0;
        card.classList.remove('is-pointer-active');
        if (!raf) raf = requestAnimationFrame(render);
      };
      card.addEventListener('pointermove', move, { passive: true });
      card.addEventListener('pointerleave', reset, { passive: true });
      card.addEventListener('blur', reset, true);
    });
  }

  const progress = document.querySelector('[data-case-progress] span');
  if (progress && !reduceMotion.matches) {
    let progressRaf = 0;
    const updateProgress = () => {
      progressRaf = 0;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const value = Math.min(1, Math.max(0, window.scrollY / max));
      progress.style.transform = `scaleX(${value})`;
    };
    const onScroll = () => {
      if (!progressRaf) progressRaf = requestAnimationFrame(updateProgress);
    };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    updateProgress();
  }
})();