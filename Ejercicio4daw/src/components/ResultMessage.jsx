export default function ResultMessage({ total }) {
  return (
    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
      <h3 style={{ color: 'green' }}>Costo Total: ${total.toFixed(2)}</h3>
      <p>¡Reserva confirmada! ¡Que disfrutes tu viaje!</p>
    </div>
  );
}
