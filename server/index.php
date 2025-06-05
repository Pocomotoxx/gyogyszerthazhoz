<?php
header('Content-Type: application/json');

$dbFile = __DIR__ . '/database.sqlite';
$uploadsDir = __DIR__ . '/uploads';
if (!file_exists($uploadsDir)) {
    mkdir($uploadsDir, 0777, true);
}

$db = new SQLite3($dbFile);

// create tables
$db->exec("CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
)");
$db->exec("CREATE TABLE IF NOT EXISTS therapy_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    text TEXT,
    photo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
)");
$db->exec("CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    message TEXT,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
)");
$db->exec("CREATE TABLE IF NOT EXISTS medication_requests (
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
)");
$db->exec("CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER,
    amount REAL,
    method TEXT,
    status TEXT DEFAULT 'Paid',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(request_id) REFERENCES medication_requests(id)
)");
$db->exec("CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    receiver_id INTEGER,
    text TEXT,
    photo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sender_id) REFERENCES users(id),
    FOREIGN KEY(receiver_id) REFERENCES users(id)
)");

$count = $db->querySingle('SELECT COUNT(*) FROM users');
if ($count == 0) {
    $stmt = $db->prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
    $stmt->bindValue(1, 'caregiver');
    $stmt->bindValue(2, 'test');
    $stmt->bindValue(3, 'caregiver');
    $stmt->execute();
    $stmt->reset();
    $stmt->bindValue(1, 'pharmacist');
    $stmt->bindValue(2, 'test');
    $stmt->bindValue(3, 'pharmacist');
    $stmt->execute();
    $stmt->reset();
    $stmt->bindValue(1, 'admin');
    $stmt->bindValue(2, 'test');
    $stmt->bindValue(3, 'admin');
    $stmt->execute();
    $stmt->reset();
    $stmt->bindValue(1, 'superadmin');
    $stmt->bindValue(2, 'test');
    $stmt->bindValue(3, 'superadmin');
    $stmt->execute();
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

function json_body() {
    return json_decode(file_get_contents('php://input'), true) ?: [];
}

function error_response($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(['error' => $msg]);
    exit;
}

function require_superadmin() {
    if ($_SERVER['HTTP_X_ROLE'] ?? '' !== 'superadmin') {
        error_response('Nincs jogosultság', 403);
    }
}

switch (true) {
    case $method === 'POST' && $path === '/api/upload':
        if (!isset($_FILES['image'])) error_response('Nincs fájl');
        $name = uniqid() . '_' . basename($_FILES['image']['name']);
        if (!move_uploaded_file($_FILES['image']['tmp_name'], "$uploadsDir/$name")) {
            error_response('Nem sikerült menteni a fájlt', 500);
        }
        echo json_encode(['path' => "/uploads/$name"]);
        break;

    case $method === 'POST' && $path === '/api/login':
        $data = json_body();
        $stmt = $db->prepare('SELECT * FROM users WHERE username = ? AND password = ?');
        $stmt->bindValue(1, $data['username'] ?? '');
        $stmt->bindValue(2, $data['password'] ?? '');
        $res = $stmt->execute();
        $row = $res->fetchArray(SQLITE3_ASSOC);
        if (!$row) error_response('Érvénytelen felhasználónév vagy jelszó', 401);
        echo json_encode(['id'=>$row['id'],'username'=>$row['username'],'role'=>$row['role']]);
        break;

    case $method === 'GET' && $path === '/api/users':
        $res = $db->query('SELECT id, username, role FROM users ORDER BY id');
        $rows = [];
        while ($r = $res->fetchArray(SQLITE3_ASSOC)) $rows[] = $r;
        echo json_encode($rows);
        break;

    case $method === 'POST' && $path === '/api/users':
        require_superadmin();
        $data = json_body();
        if (!$data['username'] || !$data['password'] || !$data['role']) error_response('Hiányzó adat');
        $stmt = $db->prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
        $stmt->bindValue(1, $data['username']);
        $stmt->bindValue(2, $data['password']);
        $stmt->bindValue(3, $data['role']);
        if (!$stmt->execute()) error_response($db->lastErrorMsg(), 500);
        echo json_encode(['id' => $db->lastInsertRowID()]);
        break;

    case $method === 'PUT' && preg_match('#^/api/users/(\d+)$#', $path, $m):
        require_superadmin();
        $data = json_body();
        if (!$data['role']) error_response('Hiányzó szerepkör');
        $stmt = $db->prepare('UPDATE users SET role = ? WHERE id = ?');
        $stmt->bindValue(1, $data['role']);
        $stmt->bindValue(2, (int)$m[1]);
        if (!$stmt->execute()) error_response($db->lastErrorMsg(), 500);
        echo json_encode(['updated' => $db->changes()]);
        break;

    case $method === 'DELETE' && preg_match('#^/api/users/(\d+)$#', $path, $m):
        require_superadmin();
        $stmt = $db->prepare('DELETE FROM users WHERE id = ?');
        $stmt->bindValue(1, (int)$m[1]);
        if (!$stmt->execute()) error_response($db->lastErrorMsg(), 500);
        echo json_encode(['deleted' => $db->changes()]);
        break;

    case $method === 'GET' && $path === '/api/therapy_logs':
        $res = $db->query('SELECT * FROM therapy_logs ORDER BY created_at DESC');
        $rows = [];
        while ($r = $res->fetchArray(SQLITE3_ASSOC)) $rows[] = $r;
        echo json_encode($rows);
        break;

    case $method === 'POST' && $path === '/api/therapy_logs':
        $data = json_body();
        $stmt = $db->prepare('INSERT INTO therapy_logs (user_id, text, photo) VALUES (?, ?, ?)');
        $stmt->bindValue(1, $data['user_id']);
        $stmt->bindValue(2, $data['text']);
        $stmt->bindValue(3, $data['photo'] ?? null);
        if (!$stmt->execute()) error_response($db->lastErrorMsg(), 500);
        echo json_encode(['id' => $db->lastInsertRowID()]);
        break;

    case $method === 'GET' && preg_match('#^/api/notifications/(\d+)$#', $path, $m):
        $stmt = $db->prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC');
        $stmt->bindValue(1, (int)$m[1]);
        $res = $stmt->execute();
        $rows = [];
        while ($r = $res->fetchArray(SQLITE3_ASSOC)) $rows[] = $r;
        echo json_encode($rows);
        break;

    case $method === 'POST' && preg_match('#^/api/notifications/(\d+)/read$#', $path, $m):
        $stmt = $db->prepare('UPDATE notifications SET is_read = 1 WHERE id = ?');
        $stmt->bindValue(1, (int)$m[1]);
        if (!$stmt->execute()) error_response($db->lastErrorMsg(), 500);
        echo json_encode(['updated' => $db->changes()]);
        break;

    case $method === 'GET' && $path === '/api/medication_requests':
        $caregiver_id = $_GET['caregiver_id'] ?? null;
        $query = 'SELECT * FROM medication_requests';
        $params = [];
        if ($caregiver_id) { $query .= ' WHERE caregiver_id = ?'; }
        $query .= ' ORDER BY created_at DESC';
        $stmt = $db->prepare($query);
        if ($caregiver_id) $stmt->bindValue(1, $caregiver_id);
        $res = $stmt->execute();
        $rows = [];
        while ($r = $res->fetchArray(SQLITE3_ASSOC)) $rows[] = $r;
        echo json_encode($rows);
        break;

    case $method === 'POST' && $path === '/api/medication_requests':
        $data = json_body();
        $stmt = $db->prepare('INSERT INTO medication_requests (caregiver_id, patient, drug, quantity, notes, cost) VALUES (?, ?, ?, ?, ?, ?)');
        $stmt->bindValue(1, $data['caregiver_id']);
        $stmt->bindValue(2, $data['patient']);
        $stmt->bindValue(3, $data['drug']);
        $stmt->bindValue(4, $data['quantity']);
        $stmt->bindValue(5, $data['notes']);
        $stmt->bindValue(6, $data['cost']);
        if (!$stmt->execute()) error_response($db->lastErrorMsg(), 500);
        echo json_encode(['id' => $db->lastInsertRowID()]);
        break;

    case $method === 'PUT' && preg_match('#^/api/medication_requests/(\d+)$#', $path, $m):
        $data = json_body();
        $stmt = $db->prepare('UPDATE medication_requests SET status = ? WHERE id = ?');
        $stmt->bindValue(1, $data['status']);
        $stmt->bindValue(2, (int)$m[1]);
        if (!$stmt->execute()) error_response($db->lastErrorMsg(), 500);
        echo json_encode(['updated' => $db->changes()]);
        break;

    case $method === 'GET' && $path === '/api/payments':
        $request_id = $_GET['request_id'] ?? null;
        $query = 'SELECT * FROM payments';
        if ($request_id) $query .= ' WHERE request_id = ?';
        $query .= ' ORDER BY created_at DESC';
        $stmt = $db->prepare($query);
        if ($request_id) $stmt->bindValue(1, $request_id);
        $res = $stmt->execute();
        $rows = [];
        while ($r = $res->fetchArray(SQLITE3_ASSOC)) $rows[] = $r;
        echo json_encode($rows);
        break;

    case $method === 'POST' && $path === '/api/payments':
        $data = json_body();
        $stmt = $db->prepare('INSERT INTO payments (request_id, amount, method) VALUES (?, ?, ?)');
        $stmt->bindValue(1, $data['request_id']);
        $stmt->bindValue(2, $data['amount']);
        $stmt->bindValue(3, $data['method']);
        if (!$stmt->execute()) error_response($db->lastErrorMsg(), 500);
        $db->exec('UPDATE medication_requests SET status = "Paid" WHERE id = '.intval($data['request_id']));
        echo json_encode(['id' => $db->lastInsertRowID()]);
        break;

    case $method === 'GET' && $path === '/api/messages':
        $u1 = $_GET['user1'] ?? null;
        $u2 = $_GET['user2'] ?? null;
        if (!$u1 || !$u2) error_response('Hiányzó felhasználó azonosító');
        $stmt = $db->prepare('SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC');
        $stmt->bindValue(1, $u1);
        $stmt->bindValue(2, $u2);
        $stmt->bindValue(3, $u2);
        $stmt->bindValue(4, $u1);
        $res = $stmt->execute();
        $rows = [];
        while ($r = $res->fetchArray(SQLITE3_ASSOC)) $rows[] = $r;
        echo json_encode($rows);
        break;

    case $method === 'POST' && $path === '/api/messages':
        $data = json_body();
        if (!$data['sender_id'] || !$data['receiver_id'] || (!$data['text'] && !$data['photo'])) error_response('Hiányzó adat');
        $stmt = $db->prepare('INSERT INTO messages (sender_id, receiver_id, text, photo) VALUES (?, ?, ?, ?)');
        $stmt->bindValue(1, $data['sender_id']);
        $stmt->bindValue(2, $data['receiver_id']);
        $stmt->bindValue(3, $data['text'] ?? '');
        $stmt->bindValue(4, $data['photo'] ?? null);
        if (!$stmt->execute()) error_response($db->lastErrorMsg(), 500);
        echo json_encode(['id' => $db->lastInsertRowID()]);
        break;

    case $method === 'GET' && $path === '/api/route':
        $start = $_GET['start'] ?? null;
        $end = $_GET['end'] ?? null;
        if (!$start || !$end) error_response('a kiindulási és célcím megadása kötelező');
        $headers = ["http" => ["header" => "User-Agent: telemed-demo/1.0\r\n"]];
        $context = stream_context_create($headers);
        $sdata = json_decode(file_get_contents('https://nominatim.openstreetmap.org/search?format=json&q='.urlencode($start), false, $context), true);
        if (!$sdata) error_response('a kiindulási cím nem található');
        $edata = json_decode(file_get_contents('https://nominatim.openstreetmap.org/search?format=json&q='.urlencode($end), false, $context), true);
        if (!$edata) error_response('a cél cím nem található');
        $s = $sdata[0];
        $e = $edata[0];
        $rdata = json_decode(file_get_contents('https://router.project-osrm.org/route/v1/driving/'.$s['lon'].','.$s['lat'].';'.$e['lon'].','.$e['lat'].'?overview=false', false, $context), true);
        if (!$rdata['routes'][0]) error_response('nem található útvonal');
        $r = $rdata['routes'][0];
        echo json_encode(['start'=>['lat'=>$s['lat'],'lon'=>$s['lon']], 'end'=>['lat'=>$e['lat'],'lon'=>$e['lon']], 'distance'=>$r['distance'], 'duration'=>$r['duration']]);
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Not found']);
}
