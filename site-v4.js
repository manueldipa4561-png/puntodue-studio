/* Punto Due Studio - shared production interaction layer */
(() => {
  if(document.querySelector('link[href="/site-v5.css"]')){
    ['/site-v5-fixes.css','/site-v6.css','/mobile-menu-hotfix.css','/site-v9.css'].forEach(href=>{
      if(document.querySelector(`link[href="${href}"]`))return;
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href=href;
      document.head.appendChild(link);
    });
    if(!document.querySelector('script[src="/site-v9.js"]')){
      const script=document.createElement('script');
      script.src='/site-v9.js';
      script.defer=true;
      document.head.appendChild(script);
    }
  }

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
    let scrollLocked=false;
    let lockedScrollY=0;

    const setScrollLock=open=>{
      const shouldLock=open&&mobile.matches;
      if(shouldLock&&!scrollLocked){
        lockedScrollY=window.scrollY||window.pageYOffset||0;
        document.documentElement.classList.add('menu-open');
        document.body.classList.add('menu-open');
        document.body.style.position='fixed';
        document.body.style.top=`-${lockedScrollY}px`;
        document.body.style.left='0';
        document.body.style.right='0';
        document.body.style.width='100%';
        scrollLocked=true;
        return;
      }
      if(!shouldLock&&scrollLocked){
        document.documentElement.classList.remove('menu-open');
        document.body.classList.remove('menu-open');
        document.body.style.removeProperty('position');
        document.body.style.removeProperty('top');
        document.body.style.removeProperty('left');
        document.body.style.removeProperty('right');
        document.body.style.removeProperty('width');
        const y=lockedScrollY;
        scrollLocked=false;
        requestAnimationFrame(()=>requestAnimationFrame(()=>window.scrollTo({top:y,left:0,behavior:'auto'})));
      }else if(!shouldLock){
        document.documentElement.classList.remove('menu-open');
        document.body.classList.remove('menu-open');
      }
    };

    const setMenu=(open,restore=false)=>{
      nav.classList.toggle('open',open);
      menu.setAttribute('aria-expanded',String(open));
      menu.setAttribute('aria-label',open?'Chiudi menu':'Apri menu');
      regions.forEach(r=>r.toggleAttribute('inert',open&&mobile.matches));
      setScrollLock(open);
      if(restore)menu.focus();
    };

    menu.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true')setMenu(false,true)});
    mobile.addEventListener('change',()=>setMenu(false));
    window.addEventListener('pageshow',()=>setMenu(false));
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

  const need=[...document.querySelectorAll('input[name="need"]')];
  const stage=[...document.querySelectorAll('input[name="stage"]')];
  const message=document.querySelector('#brief-message');
  const contactOne=document.querySelector('#brief-manuel');
  const contactTwo=document.querySelector('#brief-nicolas');
  if(message&&need.length&&stage.length){
    const needPhrases={
      'un nuovo sito':'creare un nuovo sito',
      'un redesign del sito attuale':'ripensare il sito che uso oggi',
      'un progetto ecommerce':'realizzare un progetto ecommerce',
      'capire quale soluzione web è più adatta':'capire quale soluzione web sia più adatta'
    };
    const update=()=>{
      const n=need.find(x=>x.checked)?.value||'capire quale soluzione web è più adatta';
      const s=stage.find(x=>x.checked)?.value||'sto valutando il punto di partenza';
      const action=needPhrases[n]||n;
      const text=`Ciao! Sto valutando di ${action}. Al momento ${s}. Possiamo sentirci per capire quale direzione avrebbe più senso per il progetto?`;
      message.textContent=text;
      const enc=encodeURIComponent(text);
      if(contactOne)contactOne.href=`https://wa.me/393248423657?text=${enc}`;
      if(contactTwo)contactTwo.href=`https://wa.me/393248165947?text=${enc}`;
    };
    [...need,...stage].forEach(i=>i.addEventListener('change',update));
    update();
  }
})();
