import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import {
  fetchUsers,
  createUser,
  updateUserRole,
  deleteUser,
  type User
} from './services/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [newName, setNewName] = useState('');
  const [newPass, setNewPass] = useState('');

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

  async function handleCreate() {
    if (!user) return;
    await createUser({ username: newName, password: newPass, role: 'admin' }, user.role);
    setNewName('');
    setNewPass('');
    load();
  }

  async function handleRoleChange(id: number, role: string) {
    if (!user) return;
    await updateUserRole(id, role, user.role);
    load();
  }

  async function handleDelete(id: number) {
    if (!user) return;
    await deleteUser(id, user.role);
    load();
  }

  function roleLabel(r: string) {
    switch (r) {
      case 'caregiver':
        return 'gondozó';
      case 'pharmacist':
        return 'gyógyszerész';
      case 'admin':
        return 'admin';
      case 'superadmin':
        return 'szuperadmin';
      default:
        return r;
    }
  }

  return (
    <div>
      <h2>Admin felület</h2>
      {user.role === 'superadmin' && (
        <div style={{ marginBottom: '1rem' }}>
          <p>Super admin jogosultságok</p>
          <h4>Új admin hozzáadása</h4>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Felhasználónév"
          />{' '}
          <input
            type="password"
            value={newPass}
            onChange={e => setNewPass(e.target.value)}
            placeholder="Jelszó"
          />{' '}
          <button onClick={handleCreate}>Hozzáadás</button>
        </div>
      )}
      <h3>Felhasználók</h3>
      <ul>
        {users.map(u => (
          <li key={u.id} style={{ marginBottom: '0.5rem' }}>
            {u.username} ({roleLabel(u.role)})
            {user.role === 'superadmin' && u.role !== 'superadmin' && (
              <>
                {' '}
                <select
                  value={u.role}
                  onChange={e => handleRoleChange(u.id, e.target.value)}
                >
                  <option value="caregiver">gondozó</option>
                  <option value="pharmacist">gyógyszerész</option>
                  <option value="admin">admin</option>
                </select>{' '}
                <button onClick={() => handleDelete(u.id)}>Törlés</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
