(()=>{
const $$=(s,c=document)=>[...c.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
// menu mobile
const nav=document.getElementById('nav'),mb=document.getElementById('menu');
if(mb)mb.addEventListener('click',()=>{const o=nav.classList.toggle('open');mb.setAttribute('aria-expanded',o);mb.textContent=o?'Chiudi':'Menu';document.body.style.overflow=o?'hidden':''});
$$('#nav a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');mb&&(mb.setAttribute('aria-expanded',false),mb.textContent='Menu');document.body.style.overflow=''}));
// titoli con maschera + reveal
if(!reduce&&window.gsap&&window.ScrollTrigger){
 gsap.registerPlugin(ScrollTrigger);
 $$('.mask>span').forEach((s,i)=>gsap.fromTo(s,{y:0,yPercent:105},{yPercent:0,duration:.9,ease:'power3.out',delay:s.closest('.hero')?.15+i*.08:0,scrollTrigger:{trigger:s.parentElement,start:'top 92%',once:true}}));
 $$('.rv').forEach(e=>gsap.from(e,{opacity:0,y:28,duration:.7,ease:'power2.out',scrollTrigger:{trigger:e,start:'top 90%',once:true}}));
}
})();
