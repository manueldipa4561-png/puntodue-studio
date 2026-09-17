/* Punto Due Studio — native privacy dialog behavior for utility routes. */
(() => {
  const root = document.documentElement;
  const dialog = document.querySelector('#cookie-settings');
  const openers = document.querySelectorAll('[data-cookie-open]');
  let returnFocus = null;

  root.classList.add('privacy-dialog-ready');

  if (!dialog || typeof dialog.showModal !== 'function') {
    openers.forEach(button => { button.hidden = true; });
    return;
  }

  openers.forEach(button => {
    button.addEventListener('click', () => {
      returnFocus = button;
      if (!dialog.open) dialog.showModal();
    });
  });

  dialog.addEventListener('close', () => {
    returnFocus?.focus?.();
    returnFocus = null;
  });

  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (outside) dialog.close();
  });
})();
