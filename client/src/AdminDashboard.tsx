import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { fetchUsers, type User } from './services/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (user) load();
  }, [user]);

  async function load() {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  }

  if (!user) return <p>Kérjük, jelentkezz be.</p>;
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    return <p>Nincs jogosultság.</p>;
  }

  return (
    <div>
      <h2>Admin felület</h2>
      {user.role === 'superadmin' && <p>Super admin jogosultságok</p>}
      <h3>Felhasználók</h3>
      <ul>
        {users.map(u => (
          <li key={u.id}>{u.username} ({u.role})</li>
        ))}
      </ul>
    </div>
  );
}
