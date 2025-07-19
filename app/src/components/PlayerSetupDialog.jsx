import { useState } from 'react'

export default function PlayerSetupDialog({ players, onSave }) {
  const [names, setNames] = useState(players.map(p => p.name))

  const handleChange = (index, value) => {
    const newNames = [...names]
    newNames[index] = value
    setNames(newNames)
  }

  const save = () => {
    onSave(names)
  }

  return (
    <dialog open className="player-dialog">
      <h2>玩家设置</h2>
      {names.map((name, idx) => (
        <div key={idx}>
          <label>
            玩家{idx + 1}:
            <input
              value={name}
              onChange={e => handleChange(idx, e.target.value)}
            />
          </label>
        </div>
      ))}
      <button onClick={save}>保存</button>
    </dialog>
  )
}
