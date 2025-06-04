import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { fetchPayments } from './services/api';
import type { Payment } from './services/api';

export default function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    load();
  }, [user]);

  async function load() {
    if (!user) return;
    const data = await fetchPayments();
    setPayments(data);
  }

  if (!user) return <p>Kérjük, jelentkezz be.</p>;

  return (
    <div>
      <h2>Fizetések</h2>
      <ul>
        {payments.map(p => (
          <li key={p.id}>
            Igénylés {p.request_id} - {p.amount}€ {p.method} ({p.status})
          </li>
        ))}
      </ul>
    </div>
  );
}
