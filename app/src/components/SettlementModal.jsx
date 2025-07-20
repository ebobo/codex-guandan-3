export default function SettlementModal({ players, pay, pairPay, onNewGame }) {
  return (
    <dialog open className='settlement-modal'>
      <h2>结算</h2>
      <div>
        {players.flatMap((p) =>
          Object.entries(pairPay[p.name]).map(
            ([other, amt]) =>
              amt > 0 && (
                <div key={`${p.name}-${other}`} className='settlement-pay'>
                  {p.name} 支付 {amt}元 给 {other}
                </div>
              )
          )
        )}
      </div>
      <div>
        {players.map((p) => (
          <div key={p.name} className='settlement-score'>
            {p.name}: {p.score}分 净{pay[p.name] > 0 ? '+' : ''}
            {pay[p.name]}
          </div>
        ))}
      </div>

      <button onClick={onNewGame} className='new-game-btn'>
        开始新比赛
      </button>
    </dialog>
  );
}
