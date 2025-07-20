# codex-guandan-3

Simple score keeping app for a three player card game. The `/app` directory
contains the React front‑end created with Vite. A small Node.js server is
included in `/server` for keeping a central history of games.

## Getting started

### 1. Start the center server

All synced games are written to `server/games.json`. Run the server on your Mac
or any machine on the same network:

```bash
cd server
npm install
npm start        # use PORT=4000 npm start to change the port
```

The server exposes a few JSON endpoints under `/games`:

- `GET /games` – retrieve all stored games
- `POST /games` – add a new game record
- `DELETE /games/date/:yyyy-mm-dd` – remove every game played on the given day

### 2. Run the web app

In another terminal start the Vite dev server:

```bash
cd app
npm install
npm run dev
```

Vite prints a local address such as `http://localhost:5173`. Open this address
from your browser or phone (replace `localhost` with your computer's IP if
accessing from another device).

If the center server is running on a different host or port, set
`VITE_SERVER_URL` accordingly:

```bash
VITE_SERVER_URL=http://192.168.0.5:3000 npm run dev
```

Use `npm run build` inside `/app` to create a production build in `app/dist`.
The build includes a service worker so the site can be installed as a
Progressive Web App (PWA). The default configuration uses the `vite.svg` logo
as the app icon. To use custom icons, add `pwa-192x192.png` and
`pwa-512x512.png` under `app/public` and reference them in `vite.config.js`.

### 3. Install as a PWA

The front-end can work offline after it is loaded once. Run a production build
and serve the static files with any web server (for example `npx serve dist` in
the `app` directory). When opened on iOS Safari, tap the share button and choose
"Add to Home Screen". The app will then cache all necessary files and can be
launched later without the development server.

**Important:** iOS only allows service workers on secure origins. Be sure to
serve `app/dist` over HTTPS (or use `localhost`) before adding the shortcut.
If the site is opened via a plain HTTP IP address, the service worker will not
register and the PWA cannot work offline.

### Connection status and history

The app shows "已连接中心" when it can reach the server. When disconnected the
sync button and "中心历史" button are disabled.

The local history page now defaults to today's date and shows **单日盈亏** for
that day along with overall **生涯盈亏** totals. You can upload the selected
date's games to the server with **同步所选日期到中心**. The center history page works
the same way and provides a 🗑️ button next to the date picker to delete an
entire day's records from `games.json`.
