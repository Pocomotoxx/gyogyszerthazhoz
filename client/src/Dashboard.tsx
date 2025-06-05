import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { fetchTherapyLogs, addTherapyLog } from './services/api';
import type { TherapyLog } from './services/api';

import { Link } from 'react-router-dom';

function roleLabel(role: string) {
  switch (role) {
    case 'caregiver':
      return 'gondozó';
    case 'pharmacist':
      return 'gyógyszerész';
    case 'admin':
      return 'adminisztrátor';
    case 'superadmin':
      return 'szuperadmin';
    default:
      return role;
  }
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [logs, setLogs] = useState<TherapyLog[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      const data = await fetchTherapyLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    await addTherapyLog(user.id, text);
    setText('');
    refresh();
  }

  if (!user) return <p>Kérjük, jelentkezz be.</p>;

  return (
    <div>
      <h2>Üdvözlünk {user.username} ({roleLabel(user.role)})</h2>
      <nav>
        <Link to="/notifications">Értesítések</Link> |{' '}
        <Link to="/medication-requests">Gyógyszerigénylések</Link> |{' '}
        <Link to="/payments">Fizetések</Link> |{' '}
        <Link to="/chat">Chat</Link> |{' '}
        <Link to="/drug-scan">Gyógyszer beolvasása</Link>
        {user.role === 'pharmacist' && (
          <> | <Link to="/route-planner">Útvonaltervező</Link></>
        )}
        {(user.role === 'admin' || user.role === 'superadmin') && (
          <> | <Link to="/admin">Admin</Link></>
        )} |{' '}
        <button onClick={logout}>Kijelentkezés</button>
      </nav>
      <h3>Terápiás napló</h3>
      <form onSubmit={handleAdd} style={{ marginBottom: '1rem' }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Új bejegyzés" />
        <button type="submit">Hozzáadás</button>
      </form>
      <ul>
        {logs.map(log => (
          <li key={log.id}>{log.text} - {new Date(log.created_at).toLocaleString()}</li>
        ))}
      </ul>
    </div>
  );
}
