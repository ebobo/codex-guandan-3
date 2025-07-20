import { useState, useEffect } from 'react'
import SERVER_URL from '../serverConfig.js'

function GameItem({ game }) {
  const [open, setOpen] = useState(false)
  const winner = [...game.players].sort((a,b)=> b.score - a.score || a.name.localeCompare(b.name))[0]
  return (
    <li className="game-item">
      <div onClick={()=>setOpen(!open)} style={{cursor:'pointer'}}>
        {new Date(game.timestamp).toLocaleString()} - 胜者:{winner.name} 用时{game.rounds.length}局
      </div>
      {open && (
        <div className="game-detail">
          {game.players.map(p=>(
            <div key={p.name}>{p.name}: {p.score}分 净{p.net>0?'+':''}{p.net}</div>
          ))}
          <div>支付结果:{Object.entries(game.totalPay).map(([n,v])=>`${n}:${v>0?'+':''}${v}`).join(' , ')}</div>
          <details>
            <summary>回合明细</summary>
            <ol>
              {game.rounds.map((r,i)=>(
                <li key={i}>{r.first} &gt; {r.second} &gt; {r.third}</li>
              ))}
            </ol>
          </details>
        </div>
      )}
    </li>
  )
}

export default function CenterHistory({ onBack }) {
  const [games, setGames] = useState([])
  const [filterDate, setFilterDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  )
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`${SERVER_URL}/games`)
      .then(r => r.json())
      .then(data => {
        setGames(data)
        setError(false)
      })
      .catch(() => {
        setError(true)
      })
  }, [])

  const deleteDate = async () => {
    if (!filterDate) return
    if (!window.confirm(`删除 ${filterDate} 的所有记录吗？`)) return
    await fetch(`${SERVER_URL}/games/date/${filterDate}`, { method: 'DELETE' })
    setGames(gs =>
      gs.filter(
        g => new Date(g.timestamp).toISOString().slice(0,10) !== filterDate
      )
    )
  }

  const filtered = games.filter(
    (g) => !filterDate || new Date(g.timestamp).toISOString().slice(0, 10) === filterDate
  )

  const totalCareer = {}
  games.forEach((g) => {
    Object.entries(g.totalPay).forEach(([n, v]) => {
      totalCareer[n] = (totalCareer[n] || 0) + v
    })
  })

  const daily = {}
  filtered.forEach((g) => {
    Object.entries(g.totalPay).forEach(([n, v]) => {
      daily[n] = (daily[n] || 0) + v
    })
  })

  return (
    <div className="history">
      <button onClick={onBack}>返回</button>
      <h2>中心历史记录</h2>
      {error && <div style={{color:'red'}}>无法连接中心服务器</div>}
      <div>
        生涯盈亏:
        {Object.entries(totalCareer).map(([n,v])=> (
          <span key={n} style={{marginRight:'1em'}}>{n}:{v>0?'+':''}{v}</span>
        ))}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:'0.5em'}}>
        <label>日期筛选:
          <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} />
        </label>
        <button onClick={deleteDate} disabled={!filterDate} title="删除当日记录">🗑️</button>
      </div>
      <div>
        单日盈亏:
        {Object.entries(daily).map(([n,v])=> (
          <span key={n} style={{marginRight:'1em'}}>{n}:{v>0?'+':''}{v}</span>
        ))}
      </div>
      <ul>
        {filtered.map(g => (
          <GameItem key={g.timestamp} game={g} />
        ))}
      </ul>
    </div>
  )
}
