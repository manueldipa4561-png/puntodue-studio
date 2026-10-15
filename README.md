# Punto Due Studio

Sito di [puntoduestudio.it](https://puntoduestudio.it): agenzia digitale (siti web, e-commerce, social, agenti AI, video 3D).
Astro, pagine statiche, in italiano, inglese e tedesco. Si pubblica su Netlify da `main`.

## Comandi

```bash
npm install
npm run dev        # sviluppo su http://localhost:4321 (genera prima /en e /de)
npm run build      # genera /en e /de, poi compila in dist/
npm run audit      # controlla dist/ (dopo il build): link, ancore, hreflang, sitemap, titoli, italiano rimasto in /en e /de
```

Prima di un merge su `main`: `npm run build && npm run audit`. Serve Node 22.12 o più recente.

## Struttura

- `src/pages/*.astro`: le pagine **italiane**, che sono l'unica fonte dei testi.
- `src/pages/en`, `src/pages/de`, `src/components/en`, `src/components/de`: **generati, ignorati da git**. Non modificarli.
- `src/i18n/en.txt`, `src/i18n/de.txt`: dizionari delle traduzioni.
- `src/layouts/Site.astro`: testata, hreflang, canonical, Open Graph, menu, cambio lingua, piè di pagina.
- `src/styles/ui.css` e `src/scripts/ui.ts`: il livello UI condiviso da home e pagine interne (token, pulsanti, testata flottante, menu a schermo intero, barra CTA fissa sul telefono, fascia finale gialla, link alla pagina successiva, piè di pagina). Le animazioni sono di anime.js; la home continua a usare GSAP e Lenis per la scena.
- `src/components/`: `Servizio` (pagine servizio e indice), `LangAuto` (lingua automatica), `Chat`, `Sim`, `Bi`, `Profilo`, `Automazione`.
- `scripts/i18n.mjs`: genera le versioni EN e DE; `scripts/audit.mjs`: controlli su `dist/`.
- `public/agent/`: i cinque render 3D della sezione /automazione di /social (`os-0` scena master, `os-1..4` una per automazione), in WebP a 720 e 1280 px. Generati con Higgsfield (`gpt_image_2_5`, 2k, 4:3); le quattro varianti partono dalla master (job `782bed6f-d933-412e-aba9-b17c70c03a46`) come `image_references`, così bot, piattaforma e inquadratura restano identici e si sfumano l'uno nell'altro. Per rifarli: stessa master, un'azione per postazione, palette solo blu reale, bianco, giallo e blu notte, senza testo né loghi.
- `public/`: `robots.txt`, `sitemap.xml` (scritta a mano), `motion/` (video e poster), `previews/`, `kern/`, `demo/` (tre demo statiche in `noindex`).

## Caratteri e logo

Titoli, pulsanti e logo: Bricolage Grotesque (variabile, con asse ottico: a corpo grande si affina da solo). Testi: Inter Tight. Etichette: JetBrains Mono. Tutti da `@fontsource-variable`, serviti da noi e precaricati (due `<link rel="preload">` nella testata), quindi nessuna richiesta esterna e la CSP resta com'è. I token sono in `src/styles/ui.css` (`--display`, `--text`, `--mono`).
Il logo resta la coppia di cerchi (due punti) con la lente blu; cambia il blocco: «Punto Due» in Bricolage 800 e `STUDIO` in mono giallo. Al passaggio del mouse i due punti si scambiano di posto (rotazione di 180°).

## Home su telefono (≤ 1023 px)

Un solo palcoscenico fisso in alto: la forma non salta più da una sezione all'altra, si trasforma di continuo con lo scroll (stesse tappe del desktop: finestra, telefono, schermo LED, catena, lente). Il testo scorre sotto e sfuma con una maschera (`--cut`, una variabile CSS per blocco, aggiornata solo mentre si scrolla) prima di entrare nel palcoscenico, quindi non si sovrappone mai. Le tappe e lo spazio libero si misurano dal layout (`measure()` in `index.astro`), non sono numeri fissi: se cambi il testo, la forma si adatta. Sui telefoni molto bassi (< 700 px) la forma si spegne dove il testo non lascia posto e la barra CTA sparisce.

## Pulsanti (stessa lente, ruoli diversi)

Tutti i pulsanti `.btn` hanno la stessa anatomia: pillola, testo, lente con simbolo (`ui.ts` la aggiunge se manca). Cambiano colore e simbolo in base al compito:

| Ruolo | Classe | Simbolo (`data-i`) | Dove |
| --- | --- | --- | --- |
| Scrivici, conversione | `.btn` (giallo) | freccia, o `wa` se apre WhatsApp | testata, hero, fascia finale |
| Esplora una pagina | `.btn.white` | freccia, `play` per i video | sezioni della home |
| Azione di supporto | `.btn.ghost` (contorno) | freccia | accanto al pulsante principale |
| WhatsApp | `.btn.wa` (inchiostro + verde) | `wa` | seconda scelta di contatto |
| Fascia gialla | `.btn` diventa blu da solo dentro `.cta-s` | come sopra | fine pagina |

Taglie: `.btn-s` (testata, menu), normale, `.btn-l` (fascia finale). Il disco che riempie la pillola, la luce che segue il cursore e il magnete sono nel CSS e in `ui.ts`; con `prefers-reduced-motion` restano solo i cambi di colore.

## Traduzioni (come funziona)

`scripts/i18n.mjs` copia ogni pagina italiana in `/en` e `/de` sostituendo ogni frase italiana con quella del dizionario.
Nei file `.txt` le righe vanno a coppie: `it: <testo italiano esatto>` seguita da `en: <traduzione>` (o `de:`).

- **Cambi un testo italiano?** Aggiorna la riga `it:` in `en.txt` e `de.txt`, altrimenti la build si ferma con l'elenco delle frasi non trovate. Per sbloccare a mano: `I18N_ALLOW_STALE=1 npm run build`.
- **Aggiungi un testo nuovo?** Scrivi anche le due traduzioni. `npm run audit` segnala italiano rimasto in `/en` e `/de`.
- **Nuova pagina?** Aggiungila a `PAGES` in `scripts/i18n.mjs` e a `public/sitemap.xml` (le tre lingue).
- **Nuova lingua?** `LOCALES` in `scripts/i18n.mjs`, un nuovo `src/i18n/<lingua>.txt`, `.gitignore` e `Site.astro`.
- La sezione slashkern in `/web` (testo e telefono) ha un proprio selettore IT/EN con `<Bi>`: in tedesco i testi `en=` sono tradotti in `de.txt`, quindi mostra il tedesco al posto dell'inglese.
- `LangAuto` porta chi ha il telefono in inglese o tedesco alla versione tradotta (lingue non presenti: inglese), ricorda la scelta in `localStorage` (`pd-lang`) e non tocca i crawler. Il sito lo dice in piè di pagina, nel menu e nelle FAQ.
- **Scelta della lingua:** `src/components/LangMenu.astro` (markup, una copia per lingua come gli altri componenti) + `initLangMenu()` in `src/scripts/ui.ts`. Pulsante con globo e sigla, pannello con i nomi nella propria lingua (niente bandiere), spunta sulla lingua attuale, etichetta «Dal tuo dispositivo» su quella rilevata (inglese «Predefinita» se il dispositivo parla un'altra lingua), tastiera completa (frecce, Home/End, Esc). Nel menu del telefono è la stessa lista, sempre aperta (`inline`). Dopo un cambio automatico fatto da `LangAuto` un avviso dice cosa è successo e permette di cambiare (`pd-auto` in sessionStorage). I testi del pannello sono nell'oggetto `T` del componente, non nel dizionario.
- Le stringhe della testata, del menu e del piè di pagina di `Site.astro` sono nell'oggetto `T` del layout (non nel dizionario); quelle della home, che ha la propria testata, restano nel dizionario.

## Pubblicazione

Netlify pubblica `main` da solo: non serve (e non va) toccare Netlify. Si lavora con branch e PR; il merge su `main` mette online.
`netlify.toml` contiene gli header di sicurezza e la cache: `/_astro/*` un anno (hanno l'hash nel nome); `/previews`, `/kern` una settimana. Se sostituisci uno di questi file, dagli un nome nuovo per vederlo subito. Mai una regola di cache su un percorso che è anche una pagina (es. `/motion/*` teneva in cache la pagina `/motion/` per 7 giorni).

## Da non cancellare

- `public/google351d29240a4c35e1.html`: verifica di proprietà di Google Search Console.
- `public/sitemap.xml` e `public/robots.txt`: la sitemap è inviata a Search Console.

## Dati e privacy

Statistiche: Cloudflare Web Analytics, senza cookie. `localStorage` salva solo la lingua scelta. Il modulo `/modulo-trainer` usa Netlify Forms.
Informativa e note legali sono solo in italiano (`/privacy`, `/note-legali`).

## Demo

INNESTO, SEZIONE (`public/demo/hair`) e BRACE sono concept con nomi e attività inventati, in `noindex`. slashkern è un progetto indipendente in accesso anticipato: nell'anteprima di `/web` i clienti sono fittizi e i numeri d'esempio, e i testi seguono l'app (`~/Developer/slashkern`) e il sito slashkern.com. Niente indirizzi, nomi o dati reali di terzi.
