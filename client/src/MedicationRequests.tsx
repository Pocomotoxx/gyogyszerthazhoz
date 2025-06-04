import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { createMedicationRequest, fetchMedicationRequests, updateMedicationRequestStatus, createPayment } from './services/api';
import type { MedicationRequest } from './services/api';

export default function MedicationRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MedicationRequest[]>([]);
  const [patient, setPatient] = useState('');
  const [drug, setDrug] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState(0);

  useEffect(() => {
    load();
  }, [user]);

  async function load() {
    if (!user) return;
    const data = await fetchMedicationRequests(user.role === 'caregiver' ? user.id : undefined);
    setRequests(data);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    await createMedicationRequest({ caregiver_id: user.id, patient, drug, quantity, notes, cost });
    setPatient('');
    setDrug('');
    setQuantity(1);
    setNotes('');
    setCost(0);
    load();
  }

  async function handlePay(id: number, amount: number) {
    await createPayment({ request_id: id, amount, method: 'card' });
    load();
  }

  async function handleStatus(id: number, status: string) {
    await updateMedicationRequestStatus(id, status);
    load();
  }

  if (!user) return <p>Kérjük, jelentkezz be.</p>;

  return (
    <div>
      <h2>Gyógyszerigénylések</h2>
      {user.role === 'caregiver' && (
        <form onSubmit={handleCreate} style={{ marginBottom: '1rem' }}>
          <input value={patient} onChange={e => setPatient(e.target.value)} placeholder="Páciens" />
          <input value={drug} onChange={e => setDrug(e.target.value)} placeholder="Gyógyszer" />
          <input type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} min="1" />
          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Megjegyzés" />
          <input type="number" value={cost} onChange={e => setCost(parseFloat(e.target.value))} placeholder="Költség" step="0.01" />
          <button type="submit">Igénylés</button>
        </form>
      )}
      <ul>
        {requests.map(r => (
          <li key={r.id}>
            {r.patient} - {r.drug} x {r.quantity} - {r.cost ?? 0}€ ({r.status})
            {user.role === 'caregiver' && r.status !== 'Paid' && (
              <button onClick={() => handlePay(r.id, r.cost ?? 0)}>Fizetés</button>
            )}
            {user.role === 'pharmacist' && r.status === 'New' && (
              <>
                <button onClick={() => handleStatus(r.id, 'Processing')}>Feldolgozás</button>
                <button onClick={() => handleStatus(r.id, 'Cancelled')}>Törlés</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
