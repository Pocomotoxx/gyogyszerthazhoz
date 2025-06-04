import { useState } from 'react';
import { useAuth } from './hooks/useAuth';

export default function LoginPage() {
  const { loginUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await loginUser(username, password);
    } catch (err) {
      setError('Sikertelen bejelentkezés');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Bejelentkezés</h2>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <div>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Felhasználónév" />
      </div>
      <div>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Jelszó" />
      </div>
      <button type="submit">Bejelentkezés</button>
    </form>
  );
}
