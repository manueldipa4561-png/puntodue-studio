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
- `src/components/`: `Servizio` (pagine servizio e indice), `LangAuto` (lingua automatica), `Chat`, `Sim`, `Bi`, `Profilo`, `Automazione`.
- `scripts/i18n.mjs`: genera le versioni EN e DE; `scripts/audit.mjs`: controlli su `dist/`.
- `public/`: `robots.txt`, `sitemap.xml` (scritta a mano), `motion/` (video e poster), `previews/`, `kern/`, `demo/` (tre demo statiche in `noindex`).

## Traduzioni (come funziona)

`scripts/i18n.mjs` copia ogni pagina italiana in `/en` e `/de` sostituendo ogni frase italiana con quella del dizionario.
Nei file `.txt` le righe vanno a coppie: `it: <testo italiano esatto>` seguita da `en: <traduzione>` (o `de:`).

- **Cambi un testo italiano?** Aggiorna la riga `it:` in `en.txt` e `de.txt`, altrimenti la build si ferma con l'elenco delle frasi non trovate. Per sbloccare a mano: `I18N_ALLOW_STALE=1 npm run build`.
- **Aggiungi un testo nuovo?** Scrivi anche le due traduzioni. `npm run audit` segnala italiano rimasto in `/en` e `/de`.
- **Nuova pagina?** Aggiungila a `PAGES` in `scripts/i18n.mjs` e a `public/sitemap.xml` (le tre lingue).
- **Nuova lingua?** `LOCALES` in `scripts/i18n.mjs`, un nuovo `src/i18n/<lingua>.txt`, `.gitignore` e `Site.astro`.
- Il demo KERN in `/web` ha un proprio selettore IT/EN (in tedesco mostra i testi tedeschi al posto dell'inglese, ma le schermate dell'app restano in inglese).
- `LangAuto` porta chi ha il telefono in inglese o tedesco alla versione tradotta, ricorda la scelta in `localStorage` (`pd-lang`) e non tocca i crawler.

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

INNESTO, SEZIONE (`public/demo/hair`) e BRACE sono concept con nomi e attività inventati, in `noindex`; l'app KERN è un concept non ancora testato con utenti. Niente indirizzi, nomi o dati reali di terzi.
