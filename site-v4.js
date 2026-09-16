/* Punto Due Studio - shared production interaction layer */
(() => {
  const header=document.querySelector('.site-header');
  const menu=document.querySelector('.menu-toggle');
  const nav=document.querySelector('.site-nav');
  const main=document.querySelector('main');
  const footer=document.querySelector('footer');
  const mobile=window.matchMedia('(max-width:760px)');
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('[data-year]').forEach(n=>n.textContent=new Date().getFullYear());

  if(header&&'IntersectionObserver' in window){
    const sentinel=document.createElement('div');
    sentinel.className='scroll-sentinel';
    sentinel.setAttribute('aria-hidden','true');
    document.body.prepend(sentinel);
    const obs=new IntersectionObserver(([entry])=>header.classList.toggle('scrolled',!entry.isIntersecting),{threshold:0});
    obs.observe(sentinel);
  }

  if(menu&&nav){
    const regions=[main,footer].filter(Boolean);
    const setMenu=(open,restore=false)=>{
      nav.classList.toggle('open',open);
      menu.setAttribute('aria-expanded',String(open));
      menu.setAttribute('aria-label',open?'Chiudi menu':'Apri menu');
      document.documentElement.classList.toggle('menu-open',open&&mobile.matches);
      regions.forEach(r=>r.toggleAttribute('inert',open&&mobile.matches));
      if(restore)menu.focus();
    };
    menu.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true')setMenu(false,true)});
    mobile.addEventListener('change',()=>setMenu(false));
  }

  if(!reduceMotion.matches&&'IntersectionObserver' in window){
    const nodes=[...document.querySelectorAll('[data-reveal]')];
    nodes.forEach(n=>n.classList.add('reveal'));
    const obs=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('in');obs.unobserve(entry.target)}
    }),{threshold:.06,rootMargin:'0px 0px -4% 0px'});
    nodes.forEach(n=>obs.observe(n));
  }

  document.querySelectorAll('[data-motion-study]').forEach(v=>{
    if(reduceMotion.matches){v.pause();v.removeAttribute('autoplay');return;}
    if('IntersectionObserver' in window){
      const obs=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(entry.isIntersecting)v.play().catch(()=>{});else v.pause();
      }),{rootMargin:'100px'});
      obs.observe(v);
    }else v.play().catch(()=>{});
  });

  const dialog=document.querySelector('#cookie-settings');
  if(dialog&&typeof dialog.showModal==='function'){
    document.querySelectorAll('[data-cookie-open]').forEach(b=>b.addEventListener('click',()=>{if(!dialog.open)dialog.showModal()}));
    dialog.addEventListener('click',e=>{
      if(e.target!==dialog)return;
      const r=dialog.getBoundingClientRect();
      if(!(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom))dialog.close();
    });
  }

  const business=[...document.querySelectorAll('input[name="business"]')];
  const need=[...document.querySelectorAll('input[name="need"]')];
  const message=document.querySelector('#brief-message');
  const manuel=document.querySelector('#brief-manuel');
  const nicolas=document.querySelector('#brief-nicolas');
  if(message&&business.length&&need.length){
    const update=()=>{
      const b=business.find(x=>x.checked)?.value||'un’attività';
      const n=need.find(x=>x.checked)?.value||'capire quale sito potrebbe servirmi';
      const text=`Ciao! Ho ${b} e vorrei ${n}. Possiamo sentirci per capire come impostare il progetto?`;
      message.textContent=text;
      const enc=encodeURIComponent(text);
      if(manuel)manuel.href=`https://wa.me/393248423657?text=${enc}`;
      if(nicolas)nicolas.href=`https://wa.me/393248165947?text=${enc}`;
    };
    [...business,...need].forEach(i=>i.addEventListener('change',update));
    update();
  }
})();
