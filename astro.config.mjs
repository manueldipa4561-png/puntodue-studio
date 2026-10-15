import { defineConfig } from 'astro/config';

// i font non vanno mai incorporati come data: URI (la CSP in netlify.toml li bloccherebbe): restano file separati
export default defineConfig({ server: { port: 4321 }, vite: { build: { assetsInlineLimit: (file) => (/\.woff2?$/.test(file) ? false : undefined) } } });
