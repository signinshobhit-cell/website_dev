<?php
// Flexlyf Trade Intelligence CMS configuration
// CHANGE THIS PASSWORD before publishing the admin page.
// Generate a new hash with: php -r "echo password_hash('YOUR_PASSWORD', PASSWORD_DEFAULT), PHP_EOL;"
return [
    'admin_password_hash' => '$2y$12$nog/vcCrUfcA7uI1TWUqDesHH3MDKAjqp3vnkDm8.SdpJjTlOBMjG',
    'data_file' => __DIR__ . '/data/news.json',
    'upload_dir' => __DIR__ . '/news-images',
    'upload_url_prefix' => 'news-images/',
];
