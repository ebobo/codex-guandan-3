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
