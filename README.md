# codex-guandan-3

Simple score keeping app for a three player card game. The `/app` directory
contains the React front‑end created with Vite. A small Node.js server is
included in `/server` for keeping a central history of games.

## Running the app

Install dependencies and start the development server:

```bash
cd app
npm install
npm run dev
```

## Central history server

The server stores all synced games in `server/games.json`. Start it on your Mac
or any machine on the local network:

```bash
cd server
npm install
npm start
```

The app expects the server to be reachable at `http://localhost:3000`.

On startup the app checks connectivity and shows "已连接中心" in the status bar
when the server responds. If the server is unreachable, the "同步到中心" and
"中心历史" buttons will be disabled.

The local history screen allows filtering by date. After choosing a day you can
click **同步所选日期到中心** to upload all games from that day to the server.
On the center history page each entry has a **删除** button which asks for
confirmation before removing the record from `games.json`.
