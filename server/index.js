import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(__dirname, 'games.json');

const app = express();
const PORT = process.env.PORT || 3030;

app.use(cors());
app.use(express.json());

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO; // "owner/repo"
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const GITHUB_FILE_PATH = process.env.GITHUB_FILE_PATH || 'games.json';

const useGitHub = Boolean(GITHUB_TOKEN && GITHUB_REPO);

let games = [];
let fileSha = null;

async function loadGames() {
  if (!useGitHub) {
    try {
      const text = await fs.readFile(dataFile, 'utf-8');
      games = JSON.parse(text);
    } catch (err) {
      if (err.code === 'ENOENT') {
        games = [];
        await fs.writeFile(dataFile, '[]', 'utf-8');
      } else {
        throw err;
      }
    }
    return;
  }

  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}?ref=${GITHUB_BRANCH}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  if (res.status === 404) {
    games = [];
    fileSha = null;
    return;
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch file: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  fileSha = data.sha;
  games = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
}

async function saveGames() {
  if (!useGitHub) {
    await fs.writeFile(dataFile, JSON.stringify(games, null, 2));
    return;
  }

  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;
  const body = {
    message: 'Update games',
    content: Buffer.from(JSON.stringify(games, null, 2)).toString('base64'),
    branch: GITHUB_BRANCH,
  };
  if (fileSha) body.sha = fileSha;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to save file: ${res.status} ${text}`);
  }
  const data = await res.json();
  fileSha = data.content.sha;
}

app.get('/games', (req, res) => {
  res.json(games);
});

app.post('/games', async (req, res) => {
  const game = req.body;
  games.unshift(game);
  try {
    await saveGames();
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

app.delete('/games/:timestamp', async (req, res) => {
  const ts = Number(req.params.timestamp);
  games = games.filter((g) => g.timestamp !== ts);
  try {
    await saveGames();
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

app.delete('/games/date/:date', async (req, res) => {
  const d = req.params.date;
  games = games.filter(
    (g) => new Date(g.timestamp).toISOString().slice(0, 10) !== d
  );
  try {
    await saveGames();
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

loadGames()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Central server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
