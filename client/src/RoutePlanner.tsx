import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { planRoute } from './services/api';

export default function RoutePlanner() {
  const { user } = useAuth();
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [result, setResult] = useState<{distance:number; duration:number} | null>(null);
  const [error, setError] = useState('');

  if (!user) return <p>Kérjük, jelentkezz be.</p>;
  if (user.role !== 'pharmacist') return <p>Csak gyógyszerészek férhetnek hozzá ehhez az oldalhoz.</p>;

  async function handlePlan(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data = await planRoute(start, end);
      setResult(data);
      setError('');
    } catch (err) {
      setResult(null);
      setError('Nem sikerült útvonalat tervezni');
    }
  }

  return (
    <div>
      <h2>Útvonaltervező</h2>
      <form onSubmit={handlePlan} style={{ marginBottom: '1rem' }}>
        <input value={start} onChange={e => setStart(e.target.value)} placeholder="Kiindulási cím" />
        <input value={end} onChange={e => setEnd(e.target.value)} placeholder="Cél cím" />
        <button type="submit">Tervezés</button>
      </form>
      {error && <p>{error}</p>}
      {result && (
        <p>Távolság: {(result.distance / 1000).toFixed(1)} km, Időtartam: {(result.duration / 60).toFixed(1)} perc</p>
      )}
    </div>
  );
}
