import { useState } from 'react';

export default function RoundForm({ players, onRecord, disabled }) {
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');

  const clear = () => {
    setFirst('');
    setSecond('');
  };

  const handleRecord = () => {
    if (!first || !second || first === second) return;
    onRecord({ first, second });
    clear();
  };

  const third =
    first && second && first !== second
      ? players.find((p) => p.name !== first && p.name !== second).name
      : '';

  return (
    <div className='round-form'>
      <div>
        <label>
          头游:
          <select
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            disabled={disabled}
          >
            <option value=''>选择</option>
            {players.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <label>
          二游:
          <select
            value={second}
            onChange={(e) => setSecond(e.target.value)}
            disabled={disabled}
          >
            <option value=''>选择</option>
            {players.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>末游: {third}</div>
      <button onClick={handleRecord} disabled={disabled}>
        记录本局
      </button>
    </div>
  );
}
