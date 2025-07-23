function formatMoney(v) {
  if (v > 0) return `+¥${v}`;
  if (v < 0) return `-¥${Math.abs(v)}`;
  return `¥${v}`;
}

export default function SettlementModal({ players, pay, pairPay, onNewGame, onSync, synced, canSync }) {
  return (
    <dialog open className='settlement-modal'>
      <h2>结算</h2>
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
            {p.name}: {p.score}分 净{formatMoney(pay[p.name])}
          </div>
        ))}
      </div>

      <div style={{marginTop:'1em'}}>
        <button onClick={onSync} disabled={!canSync || synced} style={{marginRight:'1em'}}>
          {synced ? '已同步' : '同步到中心'}
        </button>
        <button onClick={onNewGame} className='new-game-btn'>
          开始新比赛
        </button>
      </div>
    </dialog>
  );
}
