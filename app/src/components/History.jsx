import { useState } from 'react'

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

export default function History({ onBack }) {
  const [games] = useState(() => JSON.parse(localStorage.getItem('games')||'[]'))
  const [filterDate, setFilterDate] = useState('')
  const [syncing, setSyncing] = useState(false)
  const filtered = games.filter(g => !filterDate || new Date(g.timestamp).toISOString().slice(0,10) === filterDate)
  const career = {}
  filtered.forEach(g => {
    Object.entries(g.totalPay).forEach(([n,v]) => {
      career[n]=(career[n]||0)+v
    })
  })

  const syncFiltered = async () => {
    if (!filterDate) return
    if (!window.confirm(`同步 ${filterDate} 的所有记录到中心?`)) return
    setSyncing(true)
    for (const g of filtered) {
      try {
        await fetch('http://localhost:3000/games', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(g),
        })
      } catch {
        alert('同步失败')
        setSyncing(false)
        return
      }
    }
    setSyncing(false)
    alert('同步完成')
  }
  return (
    <div className="history">
      <button onClick={onBack}>返回</button>
      <h2>历史记录</h2>
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
      <div>
        <button onClick={syncFiltered} disabled={!filterDate || syncing}>同步所选日期到中心</button>
      </div>
      <ul>
        {filtered.map(g => <GameItem key={g.timestamp} game={g}/>)}
      </ul>
    </div>
  )
}
