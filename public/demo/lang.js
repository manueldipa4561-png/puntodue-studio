// Lingua delle demo (IT, EN, DE). Si carica nel <head>, senza defer.
// La lingua arriva da ?lang= (la mette /web in base alla lingua della pagina), poi dalla scelta già fatta in questa scheda,
// poi dal dispositivo; se non è italiano, inglese o tedesco si apre in inglese.
// Ogni demo chiama demoI18n({...}) in fondo al <body>, PRIMA dei suoi script: così GSAP & co. trovano già il testo tradotto.
// Dizionario: { 'testo italiano': ['english', 'deutsch'] }. Le chiavi con tag HTML sostituiscono l'innerHTML intero
// dell'elemento che le contiene alla lettera (spazi compattati); le altre sostituiscono testi e attributi.
// Nel JS delle demo: t('Ciao {nome}', { nome }) restituisce la frase nella lingua giusta.
(() => {
  const LANGS = ['it', 'en', 'de'];
  const KEY = 'demo-lang';
  const ATTRS = ['alt', 'aria-label', 'placeholder', 'title', 'content', 'value', 'data-label'];
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  const from = new URLSearchParams(location.search).get('lang');
  let lang = LANGS.includes(from) ? from : null;
  try {
    if (lang) sessionStorage.setItem(KEY, lang);
    else lang = sessionStorage.getItem(KEY);
  } catch { /* storage bloccato: si decide dal dispositivo */ }
  if (!LANGS.includes(lang)) {
    const dev = (navigator.languages?.length ? navigator.languages : [navigator.language || 'en']).map((l) => l.slice(0, 2).toLowerCase());
    lang = dev.find((l) => LANGS.includes(l)) || 'en';
  }
  document.documentElement.lang = lang;
  const col = lang === 'en' ? 0 : 1;
  let dict = {};
  const tr = (s) => (lang === 'it' ? undefined : dict[norm(s)]?.[col]);

  // finché il testo è ancora in italiano la pagina resta nascosta (mai oltre DOMContentLoaded)
  const hide = lang !== 'it' && document.createElement('style');
  if (hide) { hide.textContent = 'body{visibility:hidden}'; document.head.append(hide); }
  const reveal = () => hide && hide.remove();
  addEventListener('DOMContentLoaded', reveal);

  window.demoLang = lang;
  window.t = (s, vars = {}) => (tr(s) ?? s).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  window.demoI18n = (d) => {
    dict = d;
    if (lang !== 'it') {
      if (Object.keys(d).some((k) => k.includes('<'))) {
        for (const el of document.body.querySelectorAll('*')) {
          const v = tr(el.innerHTML);
          if (v) el.innerHTML = v;
        }
      }
      const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => (n.parentElement.closest('script,style') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
      });
      for (let n; (n = walk.nextNode());) {
        const v = n.nodeValue.trim() && tr(n.nodeValue);
        if (v) n.nodeValue = n.nodeValue.match(/^\s*/)[0] + v + n.nodeValue.match(/\s*$/)[0];
      }
      for (const el of document.querySelectorAll(ATTRS.map((a) => `[${a}]`).join())) {
        for (const a of ATTRS) {
          const v = el.hasAttribute(a) && tr(el.getAttribute(a));
          if (v) el.setAttribute(a, v);
        }
      }
      const title = tr(document.title);
      if (title) document.title = title;
    }
    reveal();
  };
})();
