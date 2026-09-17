/* Punto Due Studio — lightweight interaction polish, no framework dependency */
(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover:hover) and (pointer:fine)');

  const spotlightSelectors = [
    '.home-experience .territory-card',
    '.projects-experience .project-territory-v7',
    '.projects-experience .archive-card-v7',
    '.studio-experience .founder-v9',
    '.studio-experience .identity-demo',
    '.case-study-page .case-hero-stage',
    '.case-study-page .case-media',
    '.case-study-page .case-token'
  ];

  const spotlights = [...new Set(document.querySelectorAll(spotlightSelectors.join(',')))];
  spotlights.forEach(node => node.classList.add('rb-spotlight'));

  document.querySelectorAll('.button').forEach(button => button.classList.add('rb-glare'));

  if (finePointer.matches && !reduceMotion.matches) {
    const moveSpotlight = event => {
      const node = event.currentTarget;
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
      node.style.setProperty('--rb-x', `${x.toFixed(1)}px`);
      node.style.setProperty('--rb-y', `${y.toFixed(1)}px`);
    };
    const resetSpotlight = event => {
      const node = event.currentTarget;
      node.style.setProperty('--rb-x', '50%');
      node.style.setProperty('--rb-y', '50%');
    };
    spotlights.forEach(node => {
      node.addEventListener('pointermove', moveSpotlight, {passive:true});
      node.addEventListener('pointerleave', resetSpotlight, {passive:true});
      node.addEventListener('blur', resetSpotlight, true);
    });
  }

  const projectsBody = document.body.classList.contains('projects-experience');
  if (projectsBody && !reduceMotion.matches && matchMedia('(min-width:1100px) and (min-height:760px)').matches) {
    document.body.classList.add('rb-stack-ready');
    document.querySelectorAll('.premium-project-v7').forEach((node, index) => {
      node.style.setProperty('--rb-stack-index', String(index));
    });
  }

  if (!reduceMotion.matches) {
    let lastY = scrollY;
    let lastTime = performance.now();
    let velocity = 0;
    let target = 0;
    let raf = 0;

    const frame = () => {
      raf = 0;
      velocity += (target - velocity) * .18;
      velocity *= .9;
      const shift = Math.max(-12, Math.min(12, velocity * .018));
      document.documentElement.style.setProperty('--rb-scroll-shift', `${shift.toFixed(2)}px`);
      if (Math.abs(velocity) > .35 || Math.abs(target) > .35) raf = requestAnimationFrame(frame);
    };

    const onScroll = () => {
      const now = performance.now();
      const dt = Math.max(16, now - lastTime);
      const dy = scrollY - lastY;
      target = Math.max(-900, Math.min(900, dy / dt * 1000));
      lastY = scrollY;
      lastTime = now;
      if (!raf) raf = requestAnimationFrame(frame);
      clearTimeout(onScroll._idle);
      onScroll._idle = setTimeout(() => {
        target = 0;
        if (!raf) raf = requestAnimationFrame(frame);
      }, 90);
    };

    addEventListener('scroll', onScroll, {passive:true});
    addEventListener('pageshow', () => {
      lastY = scrollY;
      lastTime = performance.now();
      target = 0;
      velocity = 0;
      document.documentElement.style.setProperty('--rb-scroll-shift', '0px');
    }, {passive:true});
  }
})();
