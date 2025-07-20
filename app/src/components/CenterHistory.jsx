import { useState, useEffect } from 'react'
import SERVER_URL from '../serverConfig.js'

function GameItem({ game, onDelete }) {
  const [open, setOpen] = useState(false)
  const winner = [...game.players].sort((a,b)=> b.score - a.score || a.name.localeCompare(b.name))[0]
  return (
    <li className="game-item">
      <div onClick={()=>setOpen(!open)} style={{cursor:'pointer',display:'flex',justifyContent:'space-between'}}>
        <span>{new Date(game.timestamp).toLocaleString()} - 胜者:{winner.name} 用时{game.rounds.length}局</span>
        <button onClick={e=>{e.stopPropagation(); onDelete(game.timestamp)}}>删除</button>
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
  const [filterDate, setFilterDate] = useState('')
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

  const deleteGame = async (ts) => {
    if (!window.confirm('确定要删除该记录吗？')) return
    await fetch(`${SERVER_URL}/games/${ts}`, { method: 'DELETE' })
    setGames((gs) => gs.filter((g) => g.timestamp !== ts))
  }

  const filtered = games.filter(g => !filterDate || new Date(g.timestamp).toISOString().slice(0,10) === filterDate)

  const career = {}
  filtered.forEach(g => {
    Object.entries(g.totalPay).forEach(([n,v]) => {
      career[n]=(career[n]||0)+v
    })
  })

  return (
    <div className="history">
      <button onClick={onBack}>返回</button>
      <h2>中心历史记录</h2>
      {error && <div style={{color:'red'}}>无法连接中心服务器</div>}
      <div>
        <label>日期筛选:
          <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} />
        </label>
      </div>
      <div>
        生涯盈亏:
        {Object.entries(career).map(([n,v])=> (
          <span key={n} style={{marginRight:'1em'}}>{n}:{v>0?'+':''}{v}</span>
        ))}
      </div>
      <ul>
        {filtered.map(g => (
          <GameItem key={g.timestamp} game={g} onDelete={deleteGame} />
        ))}
      </ul>
    </div>
  )
}
