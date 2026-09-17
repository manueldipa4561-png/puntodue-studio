/* Punto Due Studio — contact brief composer */
(() => {
  const need=[...document.querySelectorAll('input[name="need"]')];
  const stage=[...document.querySelectorAll('input[name="stage"]')];
  const message=document.querySelector('#brief-message');
  const contactOne=document.querySelector('#brief-manuel');
  const contactTwo=document.querySelector('#brief-nicolas');

  if(!message||!need.length||!stage.length)return;

  const needPhrases={
    'un nuovo sito':'creare un nuovo sito',
    'un redesign del sito attuale':'ripensare il sito che uso oggi',
    'un progetto ecommerce':'realizzare un progetto ecommerce',
    'capire quale soluzione web è più adatta':'capire quale soluzione web sia più adatta'
  };

  const update=()=>{
    const n=need.find(input=>input.checked)?.value||'capire quale soluzione web è più adatta';
    const s=stage.find(input=>input.checked)?.value||'sto valutando il punto di partenza';
    const action=needPhrases[n]||n;
    const text=`Ciao! Sto valutando di ${action}. Al momento ${s}. Possiamo sentirci per capire quale direzione avrebbe più senso per il progetto?`;
    message.textContent=text;
    const encoded=encodeURIComponent(text);
    if(contactOne)contactOne.href=`https://wa.me/393248423657?text=${encoded}`;
    if(contactTwo)contactTwo.href=`https://wa.me/393248165947?text=${encoded}`;
  };

  [...need,...stage].forEach(input=>input.addEventListener('change',update));
  update();
})();
