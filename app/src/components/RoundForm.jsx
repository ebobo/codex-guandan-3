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
      <div className='round-form-row'>
        <label className='round-label'>上游:</label>
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
      </div>
      <div className='round-form-row'>
        <label className='round-label'>二游:</label>
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
      </div>
      <div className='round-form-row'>
        <span className='round-label'>末游:</span>
        <span className='round-third'>
          {third || <span style={{ opacity: 0 }}>占位</span>}
        </span>
      </div>
      <button onClick={handleRecord} disabled={disabled}>
        记录本局
      </button>
    </div>
  );
}
