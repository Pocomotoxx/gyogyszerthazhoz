<?php
session_start();
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $db = new SQLite3(__DIR__.'/../server/database.sqlite');
    $stmt = $db->prepare('SELECT * FROM users WHERE username = ? AND password = ?');
    $stmt->bindValue(1, $_POST['username'] ?? '');
    $stmt->bindValue(2, $_POST['password'] ?? '');
    $res = $stmt->execute();
    $row = $res->fetchArray(SQLITE3_ASSOC);
    if ($row) {
        $_SESSION['user_id'] = $row['id'];
        $_SESSION['username'] = $row['username'];
        $_SESSION['role'] = $row['role'];
        header('Location: dashboard.php');
        exit;
    } else {
        $error = 'Érvénytelen bejelentkezési adatok';
    }
}
?>
<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<title>Bejelentkezés</title>
</head>
<body>
<h2>Bejelentkezés</h2>
<?php if ($error) echo '<p style="color:red">'.$error.'</p>'; ?>
<form method="post">
  <input name="username" placeholder="Felhasználónév">
  <input type="password" name="password" placeholder="Jelszó">
  <button type="submit">Belépés</button>
</form>
</body>
</html>
