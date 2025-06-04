import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { fetchNotifications, markNotificationRead } from './services/api';
import type { Notification } from './services/api';

export default function NotificationCenter() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Notification[]>([]);
  useEffect(() => {
    if (user) load();
  }, [user]);

  async function load() {
    if (!user) return;
    try {
      const data = await fetchNotifications(user.id);
      setNotes(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function markRead(id: number) {
    await markNotificationRead(id);
    load();
  }

  if (!user) return <p>Kérjük, jelentkezz be.</p>;

  return (
    <div>
      <h2>Értesítések</h2>
      <ul>
        {notes.map(n => (
          <li key={n.id}>
            {n.message}
            {n.is_read ? ' (olvasva)' : (
              <button onClick={() => markRead(n.id)}>Olvasottnak jelölöm</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
