export interface User {
  id: number;
  username: string;
  role: string;
}

export interface TherapyLog {
  id: number;
  user_id: number;
  text: string;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  message: string;
  is_read: number;
  created_at: string;
}

export interface MedicationRequest {
  id: number;
  caregiver_id: number;
  patient: string;
  drug: string;
  quantity: number;
  notes: string;
  cost: number;
  status: string;
  created_at: string;
}

export interface Payment {
  id: number;
  request_id: number;
  amount: number;
  method: string;
  status: string;
  created_at: string;
}

const API_URL = '/api';

export async function login(username: string, password: string): Promise<User> {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    throw new Error('Sikertelen bejelentkezés');
  }
  return res.json();
}

export async function fetchTherapyLogs(): Promise<TherapyLog[]> {
  const res = await fetch(`${API_URL}/therapy_logs`);
  if (!res.ok) throw new Error('Nem sikerült lekérni a naplót');
  return res.json();
}

export async function addTherapyLog(user_id: number, text: string): Promise<number> {
  const res = await fetch(`${API_URL}/therapy_logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, text })
  });
  if (!res.ok) throw new Error('Nem sikerült hozzáadni a bejegyzést');
  const data = await res.json();
  return data.id;
}

export async function fetchNotifications(user_id: number): Promise<Notification[]> {
  const res = await fetch(`${API_URL}/notifications/${user_id}`);
  if (!res.ok) throw new Error('Nem sikerült lekérni az értesítéseket');
  return res.json();
}

export async function markNotificationRead(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/notifications/${id}/read`, { method: 'POST' });
  if (!res.ok) throw new Error('Nem sikerült olvasottnak jelölni');
}

export async function fetchMedicationRequests(caregiver_id?: number): Promise<MedicationRequest[]> {
  const url = caregiver_id ? `${API_URL}/medication_requests?caregiver_id=${caregiver_id}` : `${API_URL}/medication_requests`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Nem sikerült lekérni az igényléseket');
  return res.json();
}

export async function createMedicationRequest(req: Omit<MedicationRequest, 'id' | 'status' | 'created_at'>): Promise<number> {
  const res = await fetch(`${API_URL}/medication_requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  if (!res.ok) throw new Error('Nem sikerült létrehozni az igénylést');
  const data = await res.json();
  return data.id;
}

export async function updateMedicationRequestStatus(id: number, status: string): Promise<void> {
  const res = await fetch(`${API_URL}/medication_requests/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Nem sikerült frissíteni az igénylést');
}

export async function createPayment(req: { request_id: number; amount: number; method: string }): Promise<number> {
  const res = await fetch(`${API_URL}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  if (!res.ok) throw new Error('Nem sikerült létrehozni a fizetést');
  const data = await res.json();
  return data.id;
}

export async function fetchPayments(request_id?: number): Promise<Payment[]> {
  const url = request_id ? `${API_URL}/payments?request_id=${request_id}` : `${API_URL}/payments`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Nem sikerült lekérni a fizetéseket');
  return res.json();
}

export async function planRoute(start: string, end: string): Promise<{ distance: number; duration: number }> {
  const res = await fetch(`${API_URL}/route?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
  if (!res.ok) throw new Error('Nem sikerült útvonalat tervezni');
  return res.json();
}
