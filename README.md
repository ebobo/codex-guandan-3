# codex-guandan-3

Simple score keeping app for a three player card game. The `/app` directory
contains the React front‑end created with Vite. A small Node.js server is
included in `/server` for keeping a central history of games.

## Getting started

### 1. Start the center server

By default the server reads and writes `games.json` locally inside the `server`
folder:

```bash
cd server
npm install
npm start        # use PORT=4000 npm start to change the port
```

To store the file in a private GitHub repository instead, start the server with
`GITHUB_TOKEN` and `GITHUB_REPO` (and optionally `GITHUB_BRANCH` and
`GITHUB_FILE_PATH`):

```bash
GITHUB_TOKEN=<token> GITHUB_REPO=<owner/repo> npm start
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
VITE_SERVER_URL=http://10.0.0.115:3030 npm run dev
```

Use `npm run build` inside `/app` to create a production build in `app/dist`.

### Connection status and history

The app shows "已连接中心" when it can reach the server. When disconnected the
sync button and "云端记录" button are disabled.

The local history page now defaults to today's date and shows **单日盈亏** for
that day along with overall **生涯盈亏** totals. You can upload the selected
date's games to the server with **同步所选日期到中心**. The cloud history page works
the same way and provides a 🗑️ button next to the date picker to delete an
entire day's records from `games.json`.

## use Render host the service

BackEnd API: 'https://guandan-score-api.onrender.com';
Static Server: https://guandan-score-ui.onrender.com;
The Render service is configured with the same GitHub environment variables so
updates are pushed directly to the private repository.

## Architecture

This project is a web-based score-keeping application for a three-player card game. It's designed with a client-server architecture.

Here's a breakdown of the architecture:

**1. Frontend (Client-side):**

*   **Directory:** `/app`
*   **Framework:** React (using Vite for a fast development environment).
*   **Purpose:** Provides the user interface for entering scores, viewing game history, and managing player information.
*   **Key Components:**
    *   `App.jsx`: The main application component.
    *   `components/`: Contains reusable React components for different parts of the UI, such as the round form, history display, and player setup.
    *   `serverConfig.js`: Configures the connection to the backend server.

**2. Backend (Server-side):**

*   **Directory:** `/server`
*   **Framework:** Node.js with Express.js.
*   **Purpose:** Acts as a central API server to store and retrieve game history data.
*   **API Endpoints:** It exposes a simple REST API under `/games` for:
    *   `GET /games`: Fetching all game records.
    *   `POST /games`: Saving a new game record.
    *   `DELETE /games/date/:yyyy-mm-dd`: Deleting all games played on a specific date.

**3. Data Storage:**

*   The backend server is responsible for data persistence. It supports two methods for storing game data (in a `games.json` file):
    *   **Local Storage:** By default, it saves the `games.json` file locally within the `/server` directory.
    *   **Private GitHub Repository:** It can be configured to use a private GitHub repository as a remote data store. This allows for persistent, shared game history across different environments.

In summary:

This is a classic single-page application (SPA) with a decoupled frontend and backend. The React frontend communicates with the Node.js backend via a REST API to manage game data. The use of a private GitHub repository for data storage is a clever way to have a persistent and shareable data source without needing a traditional database.

# use a private gitbub repo for save the game.json file

Repository access: ebobo/guandan-3-data
used a fine-grained token
