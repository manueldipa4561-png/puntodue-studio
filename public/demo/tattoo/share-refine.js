(()=>{
  const referral=document.querySelector('.referral');
  if(!referral)return;

  const primary=document.querySelector('[data-share-referral]');
  const whatsapp=document.querySelector('[data-whatsapp-referral]');
  const copy=document.querySelector('[data-copy-referral]');
  const status=document.querySelector('.share-status');
  const stages=[...document.querySelectorAll('.referral-stage')];
  const mobile=matchMedia('(max-width:760px)');
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  let feedbackTimer=0;
  let successTimer=0;
  let successLocked=false;

  const moveTo=(index)=>{
    if(!mobile.matches||!stages[index])return;
    stages[index].click();
  };

  const pulse=(complete=false)=>{
    referral.classList.add('share-active','share-feedback');
    referral.classList.toggle('share-complete',complete);
    clearTimeout(feedbackTimer);
    feedbackTimer=setTimeout(()=>{
      referral.classList.remove('share-feedback');
      if(!complete)referral.classList.remove('share-active');
    },2200);
  };

  const resetSuccessChoreography=()=>{
    clearTimeout(successTimer);
    successLocked=false;
    referral.classList.remove('share-success-enter','share-success-reveal','share-success-settled','share-complete');
  };

  const completeShare=()=>{
    if(!mobile.matches||successLocked)return;
    successLocked=true;
    clearTimeout(successTimer);
    referral.classList.add('share-active','share-feedback','share-complete');

    if(reducedMotion.matches){
      moveTo(2);
      referral.classList.add('share-success-settled');
      if(status)status.textContent='Il segno è partito. Una nuova storia può iniziare.';
      return;
    }

    referral.classList.add('share-success-enter');
    if(status)status.textContent='Il segno è partito…';

    successTimer=setTimeout(()=>{
      moveTo(2);
      referral.classList.remove('share-success-enter');
      referral.classList.add('share-success-reveal');
      if(status)status.textContent='Una nuova storia prende forma.';
    },260);

    setTimeout(()=>{
      referral.classList.remove('share-success-reveal','share-feedback');
      referral.classList.add('share-success-settled');
      if(status)status.textContent='Il segno è partito. Una nuova storia può iniziare.';
    },1450);
  };

  const beginShare=()=>{
    if(!mobile.matches)return;
    resetSuccessChoreography();
    moveTo(1);
    pulse(false);
  };

  primary?.addEventListener('click',beginShare);
  copy?.addEventListener('click',beginShare);
  whatsapp?.addEventListener('click',()=>{
    if(!mobile.matches)return;
    resetSuccessChoreography();
    moveTo(1);
    pulse(false);
    if(status)status.textContent='WhatsApp aperto · invito pronto da inviare.';
  });

  if(primary){
    primary.setAttribute('aria-label',navigator.share?'Passa il segno: condividi l’invito':'Passa il segno: copia il link demo');
  }

  if(status){
    new MutationObserver(()=>{
      if(!mobile.matches||successLocked)return;
      const text=status.textContent.trim().toLowerCase();
      if(!text)return;
      const completed=text.includes('link demo copiato')||text.includes('condivisione aperta');
      if(completed)completeShare();
    }).observe(status,{childList:true,characterData:true,subtree:true});
  }

  referral.addEventListener('pointerdown',event=>{
    const button=event.target.closest('.referral-share button');
    if(button&&mobile.matches)referral.classList.add('share-active');
  },{passive:true});

  window.addEventListener('resize',()=>{
    if(!mobile.matches){
      clearTimeout(feedbackTimer);
      clearTimeout(successTimer);
      successLocked=false;
      referral.classList.remove('share-active','share-feedback','share-complete','share-success-enter','share-success-reveal','share-success-settled');
    }
  },{passive:true});
})();
