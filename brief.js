/* Optional, local-only message composer. Nothing is saved or submitted. */
(() => {
  const brief = document.querySelector('#progetto');
  if (!brief) return;
  const message = brief.querySelector('#brief-message');
  const manuel = brief.querySelector('#brief-manuel');
  const nicolas = brief.querySelector('#brief-nicolas');
  if (!message || !manuel || !nicolas) return;
  function update() {
    const business = brief.querySelector('input[name="business"]:checked');
    const need = brief.querySelector('input[name="need"]:checked');
    if (!business || !need) return;
    const body = `Ciao! Ho ${business.value} e vorrei ${need.value}. Possiamo parlarne?`;
    message.textContent = body;
    manuel.href = 'https://wa.me/393248423657?text=' + encodeURIComponent(body);
    nicolas.href = 'https://wa.me/393248165947?text=' + encodeURIComponent(body);
  }
  brief.addEventListener('change', update);
  update();
  brief.hidden = false;
})();
