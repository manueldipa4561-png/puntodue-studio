/* Punto Due Studio v9 — founder routing + interactive spatial typography */
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)');
  root.classList.add('identity-v9-ready');

  // Founder names remain visible only inside the two dedicated founder cards.
  document.querySelectorAll('.footer-note').forEach(n => {
    n.textContent = 'Siti web su misura per aziende, professionisti e brand. Strategia, design e sviluppo seguiti direttamente dallo studio.';
  });
  document.querySelectorAll('.footer-bottom-v4 > span:last-child').forEach(n => {
    n.textContent = 'Punto Due Studio / Web design & development';
  });

  const heroEyebrow = document.querySelector('.home-hero .eyebrow');
  if (heroEyebrow) heroEyebrow.textContent = 'Studio web indipendente / strategia + design + sviluppo';

  document.querySelectorAll('.story-grid .page-index').forEach(n => {
    if (/Manuel\s*\+\s*Nicolas/i.test(n.textContent)) n.textContent = 'Due prospettive / un sistema';
  });

  // Direct-contact pages keep two routes while moving founder names out of the interface.
  const contactPage = document.querySelector('.contact-page');
  if (contactPage) {
    const heading = contactPage.querySelector('.contact-main h1, .contact-main h2');
    if (heading && /Manuel|Nicolas/i.test(heading.textContent)) heading.textContent = 'Due linee dirette.';
    const contactLabels = [
      ['Scrivi a Manuel','Scrivi allo studio / linea 01'],
      ['Scrivi a Nicolas','Scrivi allo studio / linea 02'],
      ['Invia a Manuel','Invia / linea 01'],
      ['Invia a Nicolas','Invia / linea 02']
    ];
    contactPage.querySelectorAll('a strong, .brief-actions a').forEach(el => {
      for (const [from,to] of contactLabels) if (el.textContent.trim() === from) el.textContent = to;
    });
  }

  document.querySelectorAll('.call-direct h2').forEach(n => {
    if (/Manuel|Nicolas/i.test(n.textContent)) n.textContent = 'Due linee dirette.';
  });
  document.querySelectorAll('.call-direct-actions .contact-card strong').forEach((n, i) => {
    const replacements = ['Richiedi la call / linea 01','Richiedi la call / linea 02','Linea 01','Linea 02'];
    if (replacements[i]) n.textContent = replacements[i];
  });

  // Spatial typography: selected high-value headings receive depth without changing semantic text.
  const selector = [
    '.home-hero h1',
    '.statement-band h2',
    '.page-hero h1',
    '.site-cta h2',
    '.call-hero h1',
    '.call-dark-section h2',
    '.case-title-wrap h1',
    '.case-section-head h2',
    '.case-proof blockquote',
    '.case-next-link strong'
  ].join(',');

  const headings = [...document.querySelectorAll(selector)];
  headings.forEach(node => {
    node.classList.add('spatial-type');
    node.dataset.spatialText = node.innerText.replace(/\n{3,}/g, '\n\n').trim();
    node.dataset.spatialState = 'idle';
    const stage = node.closest('section, article, .case-next, .story-grid') || node.parentElement;
    stage?.classList.add('spatial-stage');
  });

  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-spatial-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    headings.forEach(h => observer.observe(h));
  } else {
    headings.forEach(h => h.classList.add('is-spatial-visible'));
  }

  if (finePointer.matches && !reduceMotion.matches) {
    headings.forEach(node => {
      let raf = 0;
      let next = { rx:0, ry:0, dx:0, dy:0 };
      const render = () => {
        raf = 0;
        node.style.setProperty('--pd-rx', `${next.rx.toFixed(2)}deg`);
        node.style.setProperty('--pd-ry', `${next.ry.toFixed(2)}deg`);
        node.style.setProperty('--pd-dx', `${next.dx.toFixed(2)}px`);
        node.style.setProperty('--pd-dy', `${next.dy.toFixed(2)}px`);
      };
      const move = event => {
        const r = node.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const nx = Math.max(-.5, Math.min(.5, (event.clientX-r.left)/r.width-.5));
        const ny = Math.max(-.5, Math.min(.5, (event.clientY-r.top)/r.height-.5));
        next = { rx: ny*-4.2, ry: nx*5.4, dx: nx*4.5, dy: ny*3.5 };
        node.dataset.spatialState = 'active';
        if (!raf) raf = requestAnimationFrame(render);
      };
      const reset = () => {
        next = { rx:0, ry:0, dx:0, dy:0 };
        node.dataset.spatialState = 'idle';
        if (!raf) raf = requestAnimationFrame(render);
      };
      node.addEventListener('pointermove', move, { passive:true });
      node.addEventListener('pointerleave', reset, { passive:true });
      node.addEventListener('blur', reset, true);
    });
  }
})();
