import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import SERVER_URL from '../serverConfig.js';

function formatMoney(v) {
  if (v > 0) return `¥${v}`;
  if (v < 0) return `-¥${Math.abs(v)}`;
  return `¥${v}`;
}

function formatDuration(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}小时${m}分`;
}

function DateButton({ value, onClick }) {
  return (
    <button type='button' className='date-input' onClick={onClick}>
      {value || '选择日期'}
    </button>
  );
}

function GameItem({ game }) {
  const [open, setOpen] = useState(false);
  const winner = [...game.players].sort(
    (a, b) => b.score - a.score || a.name.localeCompare(b.name)
  )[0];
  return (
    <li className='game-item'>
      <div onClick={() => setOpen(!open)} style={{ cursor: 'pointer' }}>
        {new Date(game.timestamp).toLocaleString()} - 胜者:{winner.name} 共
        {game.rounds.length}局 用时{formatDuration(game.duration || 0)}
      </div>
      {open && (
        <div className='game-detail'>
          {game.players.map((p) => (
            <div key={p.name}>
              {p.name}: {p.score}分 净{formatMoney(p.net)}
            </div>
          ))}
          <div>
            支付结果:
            {Object.entries(game.totalPay)
              .map(([n, v]) => `${n}:${formatMoney(v)}`)
              .join(' , ')}
          </div>
          <details>
            <summary>回合明细</summary>
            <ol>
              {game.rounds.map((r, i) => (
                <li key={i}>
                  {r.first} &gt; {r.second} &gt; {r.third}
                </li>
              ))}
            </ol>
          </details>
        </div>
      )}
    </li>
  );
}

export default function CenterHistory({ onBack }) {
  const [games, setGames] = useState([]);
  const [filterDate, setFilterDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [error, setError] = useState(false);

  const datesWithRecords = Array.from(
    new Set(games.map((g) => new Date(g.timestamp).toISOString().slice(0, 10)))
  ).sort();

  useEffect(() => {
    fetch(`${SERVER_URL}/games`)
      .then((r) => r.json())
      .then((data) => {
        setGames(data);
        setError(false);
      })
      .catch(() => {
        setError(true);
      });
  }, []);

  const deleteDate = async () => {
    if (!filterDate) return;
    if (!window.confirm(`删除 ${filterDate} 的所有记录吗？`)) return;
    await fetch(`${SERVER_URL}/games/date/${filterDate}`, { method: 'DELETE' });
    setGames((gs) =>
      gs.filter(
        (g) => new Date(g.timestamp).toISOString().slice(0, 10) !== filterDate
      )
    );
  };

  const filtered = games.filter(
    (g) =>
      !filterDate ||
      new Date(g.timestamp).toISOString().slice(0, 10) === filterDate
  );

  const totalCareer = {};
  games.forEach((g) => {
    Object.entries(g.totalPay).forEach(([n, v]) => {
      totalCareer[n] = (totalCareer[n] || 0) + v;
    });
  });

  const daily = {};
  filtered.forEach((g) => {
    Object.entries(g.totalPay).forEach(([n, v]) => {
      daily[n] = (daily[n] || 0) + v;
    });
  });
  let dailyDuration = 0;
  filtered.forEach((g) => {
    dailyDuration += g.duration || 0;
  });

  // calculate win rates
  const gameWins = {};
  const roundWins = {};
  let totalRounds = 0;
  games.forEach((g) => {
    const winner = [...g.players].sort(
      (a, b) => b.score - a.score || a.name.localeCompare(b.name)
    )[0];
    gameWins[winner.name] = (gameWins[winner.name] || 0) + 1;
    g.rounds.forEach((r) => {
      roundWins[r.first] = (roundWins[r.first] || 0) + 1;
      totalRounds += 1;
    });
  });

  const allNames = Object.keys(totalCareer);
  const winRates = {};
  allNames.forEach((name) => {
    const w = gameWins[name] || 0;
    const rw = roundWins[name] || 0;
    winRates[name] = {
      gameWinRate: games.length ? ((w / games.length) * 100).toFixed(1) : '0',
      roundWinRate: totalRounds ? ((rw / totalRounds) * 100).toFixed(1) : '0',
    };
  });

  return (
    <div className='history'>
      <button onClick={onBack}>返回</button>
      <h2>云端历史记录</h2>
      {error && <div style={{ color: 'red' }}>无法连接中心服务器</div>}
      <div className='history-summary'>
        <div className='career-line'>
          生涯盈亏:
          {Object.entries(totalCareer).map(([n, v]) => (
            <span key={n} style={{ marginRight: '1em' }}>
              {n}:{formatMoney(v)}
            </span>
          ))}
        </div>
        <div className='rate-line'>
          局胜率:
          {Object.entries(winRates).map(([n, r]) => (
            <span key={n} style={{ marginRight: '1em' }}>
              {n}:{r.roundWinRate}%
            </span>
          ))}
        </div>
        <div className='rate-line'>
          盘胜率:
          {Object.entries(winRates).map(([n, r]) => (
            <span key={n} style={{ marginRight: '1em' }}>
              {n}:{r.gameWinRate}%
            </span>
          ))}
        </div>
      </div>
      <div className='date-filter'>
        <label>
          日期筛选:
          <DatePicker
            selected={filterDate ? new Date(filterDate) : null}
            onChange={(d) =>
              setFilterDate(d ? d.toISOString().slice(0, 10) : '')
            }
            dateFormat='yyyy-MM-dd'
            dayClassName={(date) =>
              datesWithRecords.includes(date.toISOString().slice(0, 10))
                ? 'record-day'
                : undefined
            }
            customInput={<DateButton value={filterDate} />}
          />
        </label>
        <button
          onClick={deleteDate}
          disabled={!filterDate}
          title='删除当日记录'
        >
          🗑️
        </button>
      </div>
      <div className='daily-line'>
        单日盈亏:
        {Object.entries(daily).map(([n, v]) => (
          <span key={n} style={{ marginRight: '1em' }}>
            {n}:{formatMoney(v)}
          </span>
        ))}
      </div>
      <div className='daily-line'>当日游戏时长: {formatDuration(dailyDuration)}</div>
      <ul>
        {filtered.map((g) => (
          <GameItem key={g.timestamp} game={g} />
        ))}
      </ul>
    </div>
  );
}
