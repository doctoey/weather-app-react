# 🌦️ Weather App (React)

![Vite](https://img.shields.io/badge/Vite-⚡-FFCB2B) ![React](https://img.shields.io/badge/React-18-blue) ![PWA](https://img.shields.io/badge/PWA-Ready-green)

A sleek, lightweight weather dashboard built with React + Vite — fast, offline-capable, and packed with small niceties:

- Search with typeahead + preview
- Current conditions + 7-day forecast
- Chart.js temperature trends
- PWA-ready (manifest + service worker)
- Local caching in IndexedDB (offline access)
- Tailwind CSS micro-interactions

---

Demo (replace with your GIF/screenshot):

![demo-placeholder](public/demo-placeholder.gif)

---

## Quick start

Requirements: Node 18+ and npm

```bash
cd weather-app-react
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Useful scripts

- `npm run dev` — Start Vite dev server
- `npm run build` — Build production
- `npm run preview` — Preview production build locally
- `npm run generate:icons` — Convert `public/icons/*.svg` → PNG (uses `sharp`)
- `npm run lint` — Run ESLint
- `npm run lint:fix` — Run ESLint with `--fix`
- `npm run format` — Run Prettier to format files

## PWA & Icons

The app ships with `public/manifest.webmanifest` and `public/icons/*.svg`. For better platform support generate PNG icons:

```bash
npm run generate:icons
```

If `sharp` fails to install on Windows, follow the troubleshooting notes at https://sharp.pixelplumbing.com/install

## Development notes

- API: frontend calls Open‑Meteo; a Node proxy example is available at `proxy_example/server.js` to avoid CORS during development.
- Cache: recent results + forecasts are saved to IndexedDB (`src/db/indexeddb.js`) and mirrored to `localStorage` for fast access.

## Lint & Format

We use ESLint + Prettier. After installing dependencies run:

```bash
npm run lint
npm run lint:fix
npm run format
```

## Want it cooler? — Ideas I can add

- Add a demo GIF and a nice hero screenshot
- Automatic PNG icon generation during `npm run build`
- GitHub Actions to run `lint` + `build`
- Small deploy script to Netlify/Vercel

Tell me which one and I’ll add it.

---

Files worth checking:
- Manifest: [public/manifest.webmanifest](public/manifest.webmanifest#L1)
- Icon generator script: [scripts/generate-icons.js](scripts/generate-icons.js#L1)
- IndexedDB helper: [src/db/indexeddb.js](src/db/indexeddb.js#L1)
- Main app: [src/App.jsx](src/App.jsx#L1)

License: MIT

Made with ❤️ — say the word and I’ll add a GIF, badges, CI, or deploy setup.
