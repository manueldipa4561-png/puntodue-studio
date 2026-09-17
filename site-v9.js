/* Punto Due Studio v14 — identity routing + precision-depth spatial typography */
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)');
  root.classList.add('identity-v9-ready', 'motion-v10-ready', 'typography-v14-ready');

  // Founder names remain visible only inside the two dedicated founder cards.
  document.querySelectorAll('.footer-note').forEach(n => {
    n.textContent = 'Siti web su misura per aziende, professionisti e brand. Strategia, design e sviluppo seguiti direttamente dallo studio.';
  });
  document.querySelectorAll('.footer-bottom-v4 > span:last-child').forEach(n => {
    n.textContent = 'Punto Due Studio / Web design & development';
  });

  const heroEyebrow = document.querySelector('.home-hero .eyebrow');
  if (heroEyebrow) heroEyebrow.textContent = 'Studio web indipendente / strategia + design + sviluppo';
  const homeHeroTitle = document.querySelector('.home-hero h1');
  if (homeHeroTitle) homeHeroTitle.textContent = 'Siti digitali che non sembrano già visti.';

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

  // Precision Depth: one restrained interaction grammar across all major typographic surfaces.
  const selector = [
    '.home-hero h1',
    '.story-grid h2',
    '.identity-copy h2',
    '.statement-band h2',
    '.page-hero h1',
    '.contact-main h1',
    '.brief-panel-v4 h2',
    '.site-cta h2',
    '.call-hero h1',
    '.call-process h2',
    '.call-dark-section h2',
    '.call-direct h2',
    '.case-title-wrap h1',
    '.case-section-head h2',
    '.case-system-copy h2',
    '.case-proof blockquote',
    '.case-next-link strong'
  ].join(',');

  const headings = [...new Set(document.querySelectorAll(selector))];
  const spatialEnabled = finePointer.matches && !reduceMotion.matches;
  const profileFor = node => {
    if (node.matches('.home-hero h1,.page-hero h1,.call-hero h1,.case-title-wrap h1')) return {name:'hero', intensity:.82};
    if (node.matches('.statement-band h2,.site-cta h2,.call-dark-section h2,.case-proof blockquote')) return {name:'statement', intensity:.62};
    if (node.matches('.case-next-link strong,.brief-panel-v4 h2,.call-direct h2')) return {name:'compact', intensity:.4};
    return {name:'section', intensity:.5};
  };

  headings.forEach(node => {
    if (!spatialEnabled) return;
    const profile = profileFor(node);
    node.classList.add('spatial-type', 'spatial-type-v10');
    node.dataset.spatialProfile = profile.name;
    node.dataset.spatialText = node.innerText.replace(/\n{3,}/g, '\n\n').trim();
    node.dataset.spatialState = 'idle';
    node.style.setProperty('--pd-intensity', String(profile.intensity));
    const stage = node.closest('section, article, .case-next, .story-grid, .contact-main, .brief-panel-v4') || node.parentElement;
    if (stage) {
      stage.classList.add('spatial-stage', 'spatial-stage-v10');
      if (!stage.dataset.spatialStage) stage.dataset.spatialStage = profile.name;
    }
  });

  if (spatialEnabled && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-spatial-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -7% 0px' });
    headings.forEach(h => observer.observe(h));
  }

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const states = new Map();
  let motionRaf = 0;

  const setVars = (node, s) => {
    node.style.setProperty('--pd-rx', `${s.rx.toFixed(3)}deg`);
    node.style.setProperty('--pd-ry', `${s.ry.toFixed(3)}deg`);
    node.style.setProperty('--pd-dx', `${s.dx.toFixed(3)}px`);
    node.style.setProperty('--pd-dy', `${s.dy.toFixed(3)}px`);
    node.style.setProperty('--pd-z', `${s.z.toFixed(3)}px`);
    node.style.setProperty('--pd-scale', s.scale.toFixed(4));
    node.style.setProperty('--pd-depth-x1', `${(2.2 - s.dx * .18).toFixed(3)}px`);
    node.style.setProperty('--pd-depth-y1', `${(3.2 - s.dy * .16).toFixed(3)}px`);
    node.style.setProperty('--pd-depth-x2', `${(.8 - s.dx * .08).toFixed(3)}px`);
    node.style.setProperty('--pd-depth-y2', `${(1.2 - s.dy * .07).toFixed(3)}px`);
    node.style.setProperty('--pd-shine-x', `${s.shineX.toFixed(2)}%`);
    node.style.setProperty('--pd-shine-y', `${s.shineY.toFixed(2)}%`);
  };

  const ensureState = node => {
    if (states.has(node)) return states.get(node);
    const state = {
      node,
      current:{rx:0,ry:0,dx:0,dy:0,z:0,scale:1,shineX:50,shineY:45},
      target:{rx:0,ry:0,dx:0,dy:0,z:0,scale:1,shineX:50,shineY:45},
      velocity:{rx:0,ry:0,dx:0,dy:0,z:0,scale:0,shineX:0,shineY:0},
      active:false
    };
    states.set(node,state);
    setVars(node,state.current);
    return state;
  };

  const springStep = (state, key, stiffness=.11, damping=.78) => {
    const delta = state.target[key] - state.current[key];
    state.velocity[key] = (state.velocity[key] + delta * stiffness) * damping;
    state.current[key] += state.velocity[key];
    return Math.abs(delta) + Math.abs(state.velocity[key]);
  };

  const runMotion = () => {
    motionRaf = 0;
    let needsNext = false;
    states.forEach(state => {
      let energy = 0;
      energy += springStep(state,'rx');
      energy += springStep(state,'ry');
      energy += springStep(state,'dx');
      energy += springStep(state,'dy');
      energy += springStep(state,'z',.13,.76);
      energy += springStep(state,'scale',.13,.74);
      energy += springStep(state,'shineX',.09,.82);
      energy += springStep(state,'shineY',.09,.82);
      setVars(state.node,state.current);
      if (energy > .028) needsNext = true;
    });
    if (needsNext) motionRaf = requestAnimationFrame(runMotion);
  };

  const kickMotion = () => { if (!motionRaf) motionRaf = requestAnimationFrame(runMotion); };

  if (spatialEnabled) {
    headings.forEach(node => {
      const profile = profileFor(node);
      const state = ensureState(node);
      const stage = node.closest('.spatial-stage-v10') || node.parentElement;
      if (!stage) return;

      const move = event => {
        const r = stage.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const nx = clamp((event.clientX-r.left)/r.width-.5, -.5, .5) * 2;
        const ny = clamp((event.clientY-r.top)/r.height-.5, -.5, .5) * 2;
        const i = profile.intensity;
        state.target.rx = -ny * 1.8 * i;
        state.target.ry = nx * 2.25 * i;
        state.target.dx = nx * 2.4 * i;
        state.target.dy = ny * 1.6 * i;
        state.target.z = 6 * i;
        state.target.scale = 1.001 + i * .0018;
        state.target.shineX = 50 + nx * 18;
        state.target.shineY = 45 + ny * 14;
        state.active = true;
        node.dataset.spatialState = 'active';
        stage.style.setProperty('--pd-persp-x', `${50 + nx * 7}%`);
        stage.style.setProperty('--pd-persp-y', `${50 + ny * 5}%`);
        kickMotion();
      };

      const reset = () => {
        Object.assign(state.target,{rx:0,ry:0,dx:0,dy:0,z:0,scale:1,shineX:50,shineY:45});
        state.active = false;
        node.dataset.spatialState = 'idle';
        stage.style.setProperty('--pd-persp-x','50%');
        stage.style.setProperty('--pd-persp-y','50%');
        kickMotion();
      };

      const press = () => {
        state.target.z = -1.8 * profile.intensity;
        state.target.scale = .997;
        node.dataset.spatialState = 'pressed';
        kickMotion();
      };

      stage.addEventListener('pointermove', move, { passive:true });
      stage.addEventListener('pointerleave', reset, { passive:true });
      stage.addEventListener('pointerdown', press, { passive:true });
      stage.addEventListener('pointerup', event => { move(event); node.dataset.spatialState = 'active'; }, { passive:true });
      stage.addEventListener('pointercancel', reset, { passive:true });
      stage.addEventListener('focusout', reset, true);
    });
  }

  // Scroll depth is useful only with the desktop spatial interaction.
  if (spatialEnabled) {
    let scrollRaf = 0;
    const updateScrollDepth = () => {
      scrollRaf = 0;
      const vh = Math.max(1, window.innerHeight);
      headings.forEach(node => {
        const r = node.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const progress = clamp((center - vh / 2) / (vh * .7), -1, 1);
        const profile = profileFor(node);
        node.style.setProperty('--pd-scroll-y', `${(-progress * 2.4 * profile.intensity).toFixed(2)}px`);
        node.style.setProperty('--pd-scroll-rx', `${(progress * .5 * profile.intensity).toFixed(2)}deg`);
      });
    };
    const onScroll = () => { if (!scrollRaf) scrollRaf = requestAnimationFrame(updateScrollDepth); };
    addEventListener('scroll', onScroll, { passive:true });
    addEventListener('resize', onScroll, { passive:true });
    updateScrollDepth();
  }

  // Tactile response for controls next to the type system remains deliberately smaller than typography motion.
  if (finePointer.matches && !reduceMotion.matches) {
    document.querySelectorAll('.button,.contact-card,.case-next-link,.text-link').forEach(control => {
      if (control.closest('.site-nav')) return;
      control.classList.add('tactile-control-v10');
      const reset = () => {
        control.style.setProperty('--pd-tx','0px');
        control.style.setProperty('--pd-ty','0px');
        control.style.setProperty('--pd-control-scale','1');
      };
      control.addEventListener('pointermove', event => {
        const r = control.getBoundingClientRect();
        const nx = clamp((event.clientX-r.left)/Math.max(1,r.width)-.5,-.5,.5);
        const ny = clamp((event.clientY-r.top)/Math.max(1,r.height)-.5,-.5,.5);
        control.style.setProperty('--pd-tx',`${(nx*2.2).toFixed(2)}px`);
        control.style.setProperty('--pd-ty',`${(ny*1.4).toFixed(2)}px`);
      }, {passive:true});
      control.addEventListener('pointerleave', reset, {passive:true});
      control.addEventListener('pointerdown', () => control.style.setProperty('--pd-control-scale','.992'), {passive:true});
      control.addEventListener('pointerup', () => control.style.setProperty('--pd-control-scale','1'), {passive:true});
      control.addEventListener('blur', reset, true);
    });
  }
})();
