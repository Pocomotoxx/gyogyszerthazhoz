<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: index.php');
    exit;
}
$db = new SQLite3(__DIR__.'/../server/database.sqlite');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $text = $_POST['text'] ?? '';
    $photoPath = null;
    if (!empty($_FILES['photo']['tmp_name'])) {
        $uploadDir = __DIR__.'/../server/uploads';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
        $name = uniqid().'_'.basename($_FILES['photo']['name']);
        if (move_uploaded_file($_FILES['photo']['tmp_name'], "$uploadDir/$name")) {
            $photoPath = '/uploads/'.$name;
        }
    }
    $stmt = $db->prepare('INSERT INTO therapy_logs (user_id, text, photo) VALUES (?, ?, ?)');
    $stmt->bindValue(1, $_SESSION['user_id']);
    $stmt->bindValue(2, $text);
    $stmt->bindValue(3, $photoPath);
    $stmt->execute();
}
$logs = [];
$res = $db->query('SELECT * FROM therapy_logs ORDER BY created_at DESC');
while ($row = $res->fetchArray(SQLITE3_ASSOC)) {
    $logs[] = $row;
}
?>
<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<title>Vezérlőpult</title>
</head>
<body>
<p>Bejelentkezve: <?php echo htmlspecialchars($_SESSION['username']); ?> (<?php echo htmlspecialchars($_SESSION['role']); ?>) <a href="logout.php">Kijelentkezés</a></p>
<h2>Terápiás napló</h2>
<form method="post" enctype="multipart/form-data">
  <input name="text" placeholder="Új bejegyzés">
  <input type="file" name="photo">
  <button type="submit">Hozzáadás</button>
</form>
<ul>
<?php foreach ($logs as $l): ?>
  <li><?php echo htmlspecialchars($l['text']); ?> - <?php echo $l['created_at']; ?><?php if ($l['photo']): ?><br><img src="<?php echo htmlspecialchars($l['photo']); ?>" width="100"><?php endif; ?></li>
<?php endforeach; ?>
</ul>
</body>
</html>
