const express = require('express');
const sqlite3 = require('sqlite3');
const path = require('path');
const app = express();
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

app.use(express.json());

// initialize tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS therapy_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    message TEXT,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS medication_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    caregiver_id INTEGER,
    patient TEXT,
    drug TEXT,
    quantity INTEGER,
    notes TEXT,
    cost REAL,
    status TEXT DEFAULT 'New',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(caregiver_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER,
    amount REAL,
    method TEXT,
    status TEXT DEFAULT 'Paid',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(request_id) REFERENCES medication_requests(id)
  )`);

  // seed sample users if table empty
  db.get('SELECT COUNT(*) AS cnt FROM users', (err, row) => {
    if (err) return;
    if (row.cnt === 0) {
      const stmt = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
      stmt.run('caregiver', 'test', 'caregiver');
      stmt.run('pharmacist', 'test', 'pharmacist');
      stmt.run('admin', 'test', 'admin');
      stmt.run('superadmin', 'test', 'superadmin');
      stmt.finalize();
    }
  });
});

// simple auth (not secure)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: 'Érvénytelen felhasználónév vagy jelszó' });
    res.json({ id: row.id, username: row.username, role: row.role });
  });
});

app.get('/api/users', (req, res) => {
  db.all('SELECT id, username, role FROM users ORDER BY id', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

function requireSuperadmin(req, res, next) {
  if (req.headers['x-role'] !== 'superadmin') {
    return res.status(403).json({ error: 'Nincs jogosultság' });
  }
  next();
}

app.post('/api/users', requireSuperadmin, (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Hiányzó adat' });
  }
  db.run(
    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
    [username, password, role],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.put('/api/users/:id', requireSuperadmin, (req, res) => {
  const { role } = req.body;
  if (!role) return res.status(400).json({ error: 'Hiányzó szerepkör' });
  db.run('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

app.delete('/api/users/:id', requireSuperadmin, (req, res) => {
  db.run('DELETE FROM users WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

app.get('/api/therapy_logs', (req, res) => {
  db.all('SELECT * FROM therapy_logs ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/therapy_logs', (req, res) => {
  const { user_id, text } = req.body;
  db.run('INSERT INTO therapy_logs (user_id, text) VALUES (?, ?)', [user_id, text], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// notifications
app.get('/api/notifications/:userId', (req, res) => {
  db.all('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [req.params.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/notifications/:id/read', (req, res) => {
  db.run('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

// medication requests
app.get('/api/medication_requests', (req, res) => {
  const { caregiver_id } = req.query;
  const params = [];
  let query = 'SELECT * FROM medication_requests';
  if (caregiver_id) {
    query += ' WHERE caregiver_id = ?';
    params.push(caregiver_id);
  }
  query += ' ORDER BY created_at DESC';
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/medication_requests', (req, res) => {
  const { caregiver_id, patient, drug, quantity, notes, cost } = req.body;
  db.run(
    'INSERT INTO medication_requests (caregiver_id, patient, drug, quantity, notes, cost) VALUES (?, ?, ?, ?, ?, ?)',
    [caregiver_id, patient, drug, quantity, notes, cost],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.put('/api/medication_requests/:id', (req, res) => {
  const { status } = req.body;
  db.run('UPDATE medication_requests SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

// payments
app.get('/api/payments', (req, res) => {
  const { request_id } = req.query;
  const params = [];
  let query = 'SELECT * FROM payments';
  if (request_id) {
    query += ' WHERE request_id = ?';
    params.push(request_id);
  }
  query += ' ORDER BY created_at DESC';
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/payments', (req, res) => {
  const { request_id, amount, method } = req.body;
  db.run(
    'INSERT INTO payments (request_id, amount, method) VALUES (?, ?, ?)',
    [request_id, amount, method],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      db.run('UPDATE medication_requests SET status = "Paid" WHERE id = ?', [request_id]);
      res.json({ id: this.lastID });
    }
  );
});

// simple route planning using OpenStreetMap services
app.get('/api/route', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) return res.status(400).json({ error: 'a kiindulási és cél cím megadása kötelező' });
  try {
    const headers = { 'User-Agent': 'telemed-demo/1.0' };
    // geocode start
    const startRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(start)}`, { headers });
    const startData = await startRes.json();
    if (!startData.length) return res.status(400).json({ error: 'a kiindulási cím nem található' });
    const s = startData[0];
    // geocode end
    const endRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(end)}`, { headers });
    const endData = await endRes.json();
    if (!endData.length) return res.status(400).json({ error: 'a cél cím nem található' });
    const e = endData[0];
    // route
    const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${s.lon},${s.lat};${e.lon},${e.lat}?overview=false`);
    const routeData = await routeRes.json();
    if (!routeData.routes || !routeData.routes.length) return res.status(400).json({ error: 'nem található útvonal' });
    const r = routeData.routes[0];
    res.json({
      start: { lat: s.lat, lon: s.lon },
      end: { lat: e.lat, lon: e.lon },
      distance: r.distance,
      duration: r.duration
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
