// Spot per /motion: quattro video renderizzati in Blender, marchi inventati da noi. L'auto ANEMO nel monitor in apertura e,
// nella sezione /formati, la lattina FRIZZA (9:16), il caffè SCURO (1:1) e il burger BRACE (16:9). I file sono in public/spot/.
// Ogni spot riparte da capo quando torna nello schermo (o con un pulsante [data-restart]) e si ferma quando esce.
// I testi sono HTML sopra il video (nitidi e traducibili): compaiono quando la fase del video supera il loro data-in.
const HIDE_AT = 0.93; // da qui i testi spariscono, così il loop ricomincia pulito

type Live = { el: HTMLElement; video: HTMLVideoElement; texts: HTMLElement[]; bars: HTMLElement[]; time: HTMLElement | null; on: boolean };

const clock = (s: number, long: boolean) => `${long ? '00:0' : '0:0'}${s}`;

export function mountSpots(root: HTMLElement) {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const spotEls = root.matches('[data-spot]') ? [root] : [...root.querySelectorAll<HTMLElement>('[data-spot]')];
  const lives: Live[] = [];
  spotEls.forEach((el) => {
    const video = el.querySelector('video');
    if (!video) return;
    const live: Live = { el, video, texts: [...el.querySelectorAll<HTMLElement>('[data-in]')], bars: [...el.querySelectorAll<HTMLElement>('[data-prog]')], time: el.querySelector('[data-time]'), on: false };
    // senza video (rete, formato, risparmio energetico che blocca l'autoplay) restano il poster e tutti i testi
    video.addEventListener('error', () => el.classList.add('still'));
    video.addEventListener('playing', () => el.classList.add('ready'), { once: true });
    // "Rivedi dall'inizio": riporta lo spot a 0:00
    el.querySelectorAll<HTMLElement>('[data-restart]').forEach((b) => b.addEventListener('click', () => {
      video.currentTime = 0;
      video.play().catch(() => el.classList.add('still'));
    }));
    lives.push(live);
  });
  if (!lives.length) return;

  const paint = (l: Live) => {
    const d = l.video.duration || 1, p = l.video.currentTime / d;
    l.texts.forEach((t) => t.classList.toggle('in', p >= +t.dataset.in! && p < HIDE_AT));
    l.bars.forEach((b) => (b.style.transform = `scaleX(${p})`));
    if (l.time) { const long = l.time.dataset.time === 'long'; l.time.textContent = `${clock(Math.floor(l.video.currentTime), long)} / ${clock(Math.round(d), long)}`; }
  };

  // "riduci animazioni": il video resta fermo sul poster, con tutti i testi visibili
  if (still) { lives.forEach((l) => l.el.classList.add('still')); return; }

  let raf = 0;
  const frame = () => {
    lives.forEach((l) => l.on && paint(l));
    raf = lives.some((l) => l.on) ? requestAnimationFrame(frame) : 0;
  };
  // ogni spot gira solo quando è nello schermo e ogni volta che ci rientra riparte dall'inizio
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const l = lives.find((x) => x.el === e.target);
      if (!l) return;
      if (e.isIntersecting && !l.on) {
        l.on = true;
        l.texts.forEach((t) => t.classList.remove('in'));
        l.video.currentTime = 0;
        l.video.play().catch(() => l.el.classList.add('still'));
      }
      if (!e.isIntersecting && l.on) { l.on = false; l.video.pause(); }
      l.el.classList.toggle('on', l.on);
    });
    if (!raf && lives.some((l) => l.on)) raf = requestAnimationFrame(frame);
  }, { threshold: 0.5 }); // nel carosello del telefono lo schermo che si intravede appena resta fermo
  lives.forEach((l) => io.observe(l.el));
}
