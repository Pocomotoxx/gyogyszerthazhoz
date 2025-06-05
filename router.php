<?php
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (strpos($path, '/api') === 0) {
    chdir(__DIR__.'/server');
    include 'index.php';
    return;
}
if ($path === '/' || $path === '') {
    $path = '/index.php';
}
$file = __DIR__.'/public'.$path;
if (file_exists($file)) {
    include $file;
} else {
    http_response_code(404);
    echo 'Not Found';
}
