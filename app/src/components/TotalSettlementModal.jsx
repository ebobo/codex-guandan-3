function formatMoney(v) {
  if (v > 0) return `+¥${v}`;
  if (v < 0) return `-¥${Math.abs(v)}`;
  return `¥${v}`;
}

export default function TotalSettlementModal({ players, pay, pairPay, onConfirm }) {
  return (
    <dialog open className='settlement-modal'>
      <h2>总结算</h2>
      <div>
        {players.flatMap((p) =>
          Object.entries(pairPay[p.name]).map(
            ([other, amt]) =>
              amt > 0 && (
                <div key={`${p.name}-${other}`} className='settlement-pay'>
                  {p.name} 支付 {formatMoney(amt)} 给 {other}
                </div>
              )
          )
        )}
      </div>
      <div>
        {players.map((p) => (
          <div key={p.name} className='settlement-score'>
            {p.name}: 净{formatMoney(pay[p.name])}
          </div>
        ))}
      </div>
      <div style={{ marginTop: '1em' }}>
        <button onClick={onConfirm} className='new-game-btn'>确定</button>
      </div>
    </dialog>
  );
}
