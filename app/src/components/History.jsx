import { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
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

export default function History({ onBack }) {
  const [games] = useState(() => JSON.parse(localStorage.getItem('games')||'[]'))
  const [filterDate, setFilterDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  )
  const [syncing, setSyncing] = useState(false)

  const datesWithRecords = Array.from(
    new Set(games.map(g => new Date(g.timestamp).toISOString().slice(0,10)))
  ).sort()

  const filtered = games.filter(g =>
    !filterDate || new Date(g.timestamp).toISOString().slice(0,10) === filterDate
  )

  const totalCareer = {}
  games.forEach(g => {
    Object.entries(g.totalPay).forEach(([n,v]) => {
      totalCareer[n]=(totalCareer[n]||0)+v
    })
  })

  const daily = {}
  filtered.forEach(g => {
    Object.entries(g.totalPay).forEach(([n,v]) => {
      daily[n]=(daily[n]||0)+v
    })
  })

  const syncFiltered = async () => {
    if (!filterDate) return
    if (!window.confirm(`同步 ${filterDate} 的所有记录到中心?`)) return
    setSyncing(true)
    for (const g of filtered) {
      try {
        await fetch(`${SERVER_URL}/games`, {
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
      <h2>本地历史记录</h2>
      <div>
        生涯盈亏:
        {Object.entries(totalCareer).map(([n,v])=> (
          <span key={n} style={{marginRight:'1em'}}>{n}:{v>0?'+':''}{v}</span>
        ))}
      </div>
      <div>
        <DatePicker
          selected={filterDate ? new Date(filterDate) : null}
          onChange={d => setFilterDate(d ? d.toISOString().slice(0, 10) : '')}
          dateFormat="yyyy-MM-dd"
          dayClassName={date =>
            datesWithRecords.includes(date.toISOString().slice(0, 10))
              ? 'record-day'
              : undefined
          }
        />
        <div className="date-highlights">
          {datesWithRecords.map(d => (
            <span
              key={d}
              onClick={() => setFilterDate(d)}
              className={d === filterDate ? 'selected-date' : 'available-date'}
            >
              {d}
            </span>
          ))}
        </div>
      </div>
      <div>
        单日盈亏:
        {Object.entries(daily).map(([n,v])=> (
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
