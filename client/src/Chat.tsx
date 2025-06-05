import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import {
  fetchUsers,
  fetchMessages,
  sendMessage,
  type User,
  type Message
} from './services/api';

export default function Chat() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [peerId, setPeerId] = useState<number | ''>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    if (user) loadUsers();
  }, [user]);

  useEffect(() => {
    if (user && peerId) loadMessages();
  }, [user, peerId]);

  async function loadUsers() {
    const data = await fetchUsers();
    if (!user) return;
    if (user.role === 'caregiver') {
      setUsers(data.filter(u => u.role === 'pharmacist' || u.role === 'admin'));
    } else {
      setUsers(data.filter(u => u.role === 'caregiver'));
    }
  }

  async function loadMessages() {
    if (!user || !peerId) return;
    const msgs = await fetchMessages(user.id, Number(peerId));
    setMessages(msgs);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !peerId || !text) return;
    await sendMessage(user.id, Number(peerId), text);
    setText('');
    loadMessages();
  }

  if (!user) return <p>Kérjük, jelentkezz be.</p>;
  const current = user;
  function nameFor(id: number) {
    if (id === current.id) return 'Én';
    const found = users.find(u => u.id === id);
    return found ? found.username : 'Ismeretlen';
  }

  return (
    <div>
      <h2>Belső chat</h2>
      <label>
        Partner:{' '}
        <select value={peerId} onChange={e => setPeerId(Number(e.target.value))}>
          <option value="">-- válassz --</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.username} ({u.role})
            </option>
          ))}
        </select>
      </label>
      {peerId && (
        <>
          <ul>
            {messages.map(m => (
              <li key={m.id}>
                <b>{nameFor(m.sender_id)}:</b> {m.text}{' '}
                <small>{new Date(m.created_at).toLocaleString()}</small>
              </li>
            ))}
          </ul>
          <form onSubmit={handleSend} style={{ marginTop: '0.5rem' }}>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Üzenet"
            />{' '}
            <button type="submit">Küldés</button>
          </form>
        </>
      )}
    </div>
  );
}
