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

### Connection status and history

The app shows "已连接中心" when it can reach the server. When disconnected the
sync button and "中心历史" button are disabled.

The local history page lets you filter games by date and upload them to the
server with **同步所选日期到中心**. The center history page defaults to today and
displays per-player totals. Each record has a **删除** button that asks for
confirmation before removing it from `games.json`.
