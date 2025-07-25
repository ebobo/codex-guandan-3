import { useState, useEffect } from 'react';
import PlayerSetupDialog from './components/PlayerSetupDialog.jsx';
import RoundForm from './components/RoundForm.jsx';
import SettlementModal from './components/SettlementModal.jsx';
import History from './components/History.jsx';
import CenterHistory from './components/CenterHistory.jsx';
import SERVER_URL from './serverConfig.js';
import './App.css';

const defaultNames = ['Wu', 'Ellen', 'Qi'];

function loadCurrent() {
  const stored = localStorage.getItem('currentGame');
  if (stored) return JSON.parse(stored);
  return {
    players: defaultNames.map((n) => ({ name: n, score: 0, net: 0 })),
    rounds: [],
    isFinished: false,
  };
}

function saveCurrent(game) {
  localStorage.setItem('currentGame', JSON.stringify(game));
}

function calculatePay(players) {
  const sorted = [...players].sort(
    (a, b) => b.score - a.score || a.name.localeCompare(b.name)
  );
  const pay = Object.fromEntries(players.map((p) => [p.name, 0]));
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const diff = (sorted[i].score - sorted[j].score) * 5;
      pay[sorted[i].name] += diff;
      pay[sorted[j].name] -= diff;
    }
  }
  return pay;
}

function calculatePairPay(players) {
  const result = {};
  players.forEach((p) => {
    result[p.name] = {};
    players.forEach((q) => {
      if (p.name === q.name) return;
      const diff = q.score - p.score;
      result[p.name][q.name] = diff > 0 ? diff * 5 : 0;
    });
  });
  return result;
}

function App() {
  const [game, setGame] = useState(loadCurrent);
  const [showSetup, setShowSetup] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCenterHistory, setShowCenterHistory] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [serverConnected, setServerConnected] = useState(false);
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const checkServer = () => {
    fetch(`${SERVER_URL}/games`)
      .then(() => setServerConnected(true))
      .catch(() => setServerConnected(false));
  };

  useEffect(() => {
    saveCurrent(game);
  }, [game]);

  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(id);
  }, [started, startTime]);

  useEffect(() => {
    checkServer();
  }, []);

  const recordRound = ({ first, second }) => {
    if (game.isFinished) return;
    const third = game.players.find(
      (p) => p.name !== first && p.name !== second
    ).name;
    const newPlayers = game.players.map((p) => {
      if (p.name === first) return { ...p, score: p.score + 3 };
      if (p.name === second) return { ...p, score: p.score + 1 };
      if (p.name === third) return { ...p, score: p.score };
      return p;
    });
    const rounds = [...game.rounds, { first, second, third }];
    const max = Math.max(...newPlayers.map((p) => p.score));
    setGame({ players: newPlayers, rounds, isFinished: max > 12 });
  };

  const saveNames = (names) => {
    const newPlayers = names.map((n, i) => ({ ...game.players[i], name: n }));
    setGame({ ...game, players: newPlayers });
    setShowSetup(false);
  };

  const startNewGame = () => {
    const pay = calculatePay(game.players);
    const finishedPlayers = game.players.map((p) => ({
      ...p,
      net: pay[p.name],
    }));
    const stored = JSON.parse(localStorage.getItem('games') || '[]');
    stored.unshift({
      timestamp: Date.now(),
      players: finishedPlayers,
      rounds: game.rounds,
      totalPay: pay,
    });
    localStorage.setItem('games', JSON.stringify(stored));
    const freshPlayers = finishedPlayers.map((p) => ({
      name: p.name,
      score: 0,
      net: 0,
    }));
    const newGame = { players: freshPlayers, rounds: [], isFinished: false };
    setGame(newGame);
    setIsSynced(false);
  };

  const syncGame = async () => {
    const pay = calculatePay(game.players);
    const finishedPlayers = game.players.map((p) => ({
      ...p,
      net: pay[p.name],
    }));
    const body = {
      timestamp: Date.now(),
      players: finishedPlayers,
      rounds: game.rounds,
      totalPay: pay,
    };
    try {
      await fetch(`${SERVER_URL}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setIsSynced(true);
      setServerConnected(true);
    } catch (e) {
      console.error('sync failed', e);
      setServerConnected(false);
    }
  };

  const resetCurrent = () => {
    const players = game.players.map((p) => ({ ...p, score: 0 }));
    setGame({ players, rounds: [], isFinished: false });
  };

  const undoLastRound = () => {
    if (game.rounds.length === 0) return;
    const rounds = game.rounds.slice(0, -1);
    const players = game.players.map((p) => ({ ...p, score: 0 }));
    rounds.forEach((r) => {
      players.find((p) => p.name === r.first).score += 3;
      players.find((p) => p.name === r.second).score += 1;
    });
    const max = Math.max(...players.map((p) => p.score));
    setGame({ players, rounds, isFinished: max > 12 });
  };

  const startGame = () => {
    setStartTime(Date.now());
    setElapsed(0);
    setStarted(true);
  };

  const stopGame = () => {
    setStarted(false);
    setElapsed(0);
    setStartTime(null);
  };

  if (!started) {
    return (
      <div className='app'>
        <h1>记分</h1>
        <button onClick={startGame} className='start-btn'>开始游戏</button>
        <div className='actions'>
          <button onClick={() => setShowHistory(true)}>本地记录</button>
          <button
            onClick={() => setShowCenterHistory(true)}
            disabled={!serverConnected}
          >
            云端记录
          </button>
        </div>
        {showHistory && <History onBack={() => setShowHistory(false)} />}
        {showCenterHistory && (
          <CenterHistory onBack={() => setShowCenterHistory(false)} />
        )}
      </div>
    );
  }

  if (showCenterHistory) {
    return <CenterHistory onBack={() => setShowCenterHistory(false)} />;
  }

  if (showHistory) {
    return <History onBack={() => setShowHistory(false)} />;
  }

  const pay = calculatePay(game.players);
  const pairPay = calculatePairPay(game.players);

  return (
    <div className='app'>
      <h1>记分</h1>
      <div className='status'>
        用时 {String(Math.floor(elapsed / 3600000)).padStart(2, '0')}:
        {String(Math.floor((elapsed % 3600000) / 60000)).padStart(2, '0')} {' | '}
        第 {game.rounds.length + 1} 局{' '}
        {game.isFinished ? '已结束' : '尚未有人 > 12 分'}{' | '}
        {serverConnected ? '已连接中心' : '未连接中心'}
      </div>
      <table className='scoreboard'>
        <thead>
          <tr>
            {game.players.map((p) => (
              <th key={p.name}>{p.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {game.players.map((p) => (
              <td key={p.name}>{p.score}</td>
            ))}
          </tr>
        </tbody>
      </table>
      <RoundForm
        players={game.players}
        onRecord={recordRound}
        disabled={game.isFinished}
      />
      <div className='actions'>
        <button onClick={stopGame} className='stop-btn'>结束游戏</button>
        <button onClick={undoLastRound} disabled={game.rounds.length === 0}>
          撤销上局
        </button>
        <button onClick={resetCurrent}>重置本局</button>
        <button onClick={() => setShowSetup(true)}>设置玩家</button>
        <button onClick={() => setShowHistory(true)}>本地记录</button>
        <button
          onClick={() => setShowCenterHistory(true)}
          disabled={!serverConnected}
        >
          云端记录
        </button>
      </div>
      {showSetup && (
        <PlayerSetupDialog players={game.players} onSave={saveNames} />
      )}
      {game.isFinished && (
        <SettlementModal
          players={game.players}
          pay={pay}
          pairPay={pairPay}
          onNewGame={startNewGame}
          onSync={syncGame}
          synced={isSynced}
          canSync={serverConnected}
        />
      )}
    </div>
  );
}

export default App;
