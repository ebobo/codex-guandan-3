export default function SettlementModal({ players, pay, pairPay, onNewGame }) {
  return (
    <dialog open className="settlement-modal">
      <h2>结算</h2>
      <div>
        {players.map(p => (
          <div key={p.name}>{p.name}: {p.score}分 净{pay[p.name] > 0 ? '+' : ''}{pay[p.name]}</div>
        ))}
      </div>
      <div>
        {players.flatMap(p => (
          Object.entries(pairPay[p.name]).map(([other, amt]) => (
            amt > 0 && (
              <div key={`${p.name}-${other}`}>{p.name} 支付 {amt} 给 {other}</div>
            )
          ))
        ))}
      </div>
      <button onClick={onNewGame}>开始新比赛</button>
    </dialog>
  )
}
