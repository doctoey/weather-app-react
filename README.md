# Weather App (React)

Lightweight React + Vite weather app using Open‑Meteo. Includes typeahead, 7-day forecast, Chart.js charts, PWA support, service worker, and a small IndexedDB cache.

## Quick start

Requirements: Node 18+ and npm

```bash
cd weather-app-react
npm install
npm run dev
```

## Useful scripts

- `npm run dev` — Start Vite dev server
- `npm run build` — Build production
- `npm run preview` — Preview production build locally
- `npm run generate:icons` — Convert `public/icons/*.svg` → PNG (requires `sharp` devDependency)
- `npm run lint` — Run ESLint
- `npm run lint:fix` — Run ESLint with `--fix`
- `npm run format` — Run Prettier to format files

## Icons / PWA

The app includes `public/manifest.webmanifest` and `public/icons/*.svg`. For best cross-platform compatibility, PNG icons are generated into `public/icons/` via:

```bash
npm run generate:icons
```

Note: the PNG generator uses `sharp`. On Windows, if installing `sharp` fails, follow the sharp installation notes: install windows build tools or use prebuilt binaries — see https://sharp.pixelplumbing.com/install for troubleshooting.

PWA installability is configured via `vite.config.js` (VitePWA plugin) and the manifest in `public/manifest.webmanifest`.

## Proxy (optional)

To avoid CORS while developing, a Node/Express proxy example exists at `proxy_example/server.js`. Run it and point frontend to `/api/weather` if needed.

## Storage

- Recent searches and cached forecasts are persisted in IndexedDB (see `src/db/indexeddb.js`) and also mirrored to `localStorage` for quick access.

## Linting & Formatting

We use ESLint + Prettier. After installing dependencies run:

```bash
npm run lint
npm run lint:fix
npm run format
```

## Notes & troubleshooting

- If `npm install` fails due to peer deps, try `npm install --legacy-peer-deps` or update plugin versions.
- `sharp` can be problematic on Windows; installing build tools or using the prebuilt binaries as documented by sharp usually resolves it.

## Files to check

- Manifest: `public/manifest.webmanifest`
- Icon generator script: `scripts/generate-icons.js`
- IndexedDB helper: `src/db/indexeddb.js`
- Main app: `src/App.jsx`

---

If you want, I can:
- Run `npm install` and `npm run format` here,
- Add PNG icons now (run the generator), or
- Add a short CONTRIBUTING or DEVELOPERS guide.
