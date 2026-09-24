const body=document.body;
const menu=document.querySelector('.menu-toggle');
const nav=document.querySelector('#navigation');
const closeMenu=()=>{if(!menu||!nav)return;menu.setAttribute('aria-expanded','false');nav.classList.remove('open');body.classList.remove('nav-open');};
if(menu&&nav){
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);body.classList.toggle('nav-open',open);});
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open')){closeMenu();menu.focus();}});

const heroDescriptions=[
  'Il gesto nasce come traccia.',
  'La traccia diventa struttura.',
  'La struttura diventa identità.'
];
const heroArtwork=document.querySelector('.artwork');
const heroStageButtons=[...document.querySelectorAll('.stages button')];
const heroStageDescription=document.querySelector('.stage-description');
heroStageButtons.forEach(b=>b.addEventListener('click',()=>{
  const stage=Number(b.dataset.stage);
  if(heroArtwork)heroArtwork.dataset.stage=String(stage);
  heroStageButtons.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  if(heroStageDescription)heroStageDescription.textContent=heroDescriptions[stage]||heroDescriptions[2];
}));

const dialog=document.querySelector('#art-dialog');
const dialogTitle=document.querySelector('#dialog-title');
const dialogImage=dialog?.querySelector('img');
const conceptNames=['La traccia','Lo stencil','L’inchiostro'];
document.querySelectorAll('.concept-card').forEach(card=>card.addEventListener('click',()=>{
  if(!dialog)return;
  const view=Number(card.dataset.view||0);
  dialog.dataset.view=String(view);
  if(dialogTitle)dialogTitle.textContent=conceptNames[view]||'Esplorazione del concept';
  if(dialogImage)dialogImage.alt=`Anteprima illustrativa: ${conceptNames[view]||'concept'}`;
  dialog.showModal();
}));
document.querySelector('.close-dialog')?.addEventListener('click',()=>dialog?.close());
dialog?.addEventListener('click',e=>{
  if(e.target!==dialog)return;
  const r=dialog.getBoundingClientRect();
  if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();
});

const referral=document.querySelector('.referral');
const referralButtons=[...document.querySelectorAll('.referral-stage')];
const referralCopy=document.querySelector('.referral-stage-copy');
const referralProgress=document.querySelector('.referral-progress span');
const referralDescriptions=[
  'Il tuo segno apre la catena.',
  'Condividi Cultura con una persona che vuoi portare con te.',
  'Una nuova storia si aggiunge alla tua. Il benefit reale resta definibile dallo studio.'
];
function setReferralStage(stage){
  if(!referral)return;
  referral.dataset.referralStage=String(stage);
  referralButtons.forEach((button,index)=>button.setAttribute('aria-pressed',String(index===stage)));
  if(referralCopy)referralCopy.textContent=referralDescriptions[stage];
  if(referralProgress)referralProgress.style.width=`${(stage+1)/3*100}%`;
  window.dispatchEvent(new CustomEvent('referralstagechange',{detail:{stage}}));
}
referralButtons.forEach((button,index)=>button.addEventListener('click',()=>setReferralStage(index)));
setReferralStage(0);

const demoCode='CULTURA-DEMO-01';
const shareUrl=()=>`${window.location.origin}${window.location.pathname}?ref=${encodeURIComponent(demoCode)}#referral`;
const shareStatus=document.querySelector('.share-status');
async function copyReferral(){
  try{await navigator.clipboard.writeText(shareUrl());if(shareStatus)shareStatus.textContent='Link demo copiato.';}
  catch{if(shareStatus)shareStatus.textContent='Copia manualmente il link demo dalla barra indirizzi.';}
}
document.querySelector('[data-copy-referral]')?.addEventListener('click',copyReferral);
document.querySelector('[data-whatsapp-referral]')?.addEventListener('click',()=>{
  const text=`Ti mando Cultura Tattoo Gallery — demo referral: ${shareUrl()}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,'_blank','noopener,noreferrer');
});
document.querySelector('[data-share-referral]')?.addEventListener('click',async()=>{
  if(navigator.share){
    try{await navigator.share({title:'Cultura Tattoo Gallery',text:'Scopri Cultura — referral demo',url:shareUrl()});if(shareStatus)shareStatus.textContent='Condivisione aperta.';}catch(e){if(e?.name!=='AbortError'&&shareStatus)shareStatus.textContent='Condivisione non disponibile.';}
  }else{copyReferral();}
});

const motion=document.querySelector('#referral-motion');
if(motion){
  motion.src='assets/referral-motion.mp4';
  const motionObserver=new IntersectionObserver(([entry])=>{
    if(entry.isIntersecting&&!matchMedia('(prefers-reduced-motion: reduce)').matches){motion.play().catch(()=>{});}else motion.pause();
  },{threshold:.15});
  motionObserver.observe(motion);
}

const revealTargets=[...document.querySelectorAll('[data-reveal]')];
if('IntersectionObserver'in window){
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}
  }),{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  revealTargets.forEach(el=>revealObserver.observe(el));
}else revealTargets.forEach(el=>el.classList.add('is-visible'));

window.addEventListener('resize',()=>{if(innerWidth>760)closeMenu();},{passive:true});
