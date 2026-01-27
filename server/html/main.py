main_html = """
<!DOCTYPE html>
<html>
<head>
    <title>Raspberry Pi Zero USB Storage</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; }
        .endpoint { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .method { display: inline-block; padding: 5px 10px; border-radius: 3px; color: white; font-weight: bold; }
        .get { background: #4CAF50; }
        .post { background: #2196F3; }
        .delete { background: #f44336; }
        code { background: #eee; padding: 2px 5px; }
    </style>
</head>
<body>
    <h1>Raspberry Pi Zero USB Storage API</h1>
    <p>Управление USB флешкой через веб-интерфейс</p>
    
    <h2>Endpoints:</h2>
    
    <div class="endpoint">
        <span class="method get">GET</span> <code>/api/status</code>
        <p>Статус системы</p>
    </div>
    
    <div class="endpoint">
        <span class="method get">GET</span> <code>/api/fs/info</code>
        <p>Информация о файловой системе</p>
    </div>
    
    <div class="endpoint">
        <span class="method post">POST</span> <code>/api/fs/change</code>
        <p>Сменить файловую систему (fat32, ntfs, exfat, ext4)</p>
    </div>
    
    <div class="endpoint">
        <span class="method get">GET</span> <code>/api/files</code>
        <p>Список файлов</p>
    </div>
    
    <div class="endpoint">
        <span class="method post">POST</span> <code>/api/files/upload</code>
        <p>Загрузить файл</p>
    </div>
    
    <div class="endpoint">
        <span class="method get">GET</span> <code>/api/files/download/{filename}</code>
        <p>Скачать файл</p>
    </div>
    
    <div class="endpoint">
        <span class="method delete">DELETE</span> <code>/api/files/{filename}</code>
        <p>Удалить файл</p>
    </div>
    
    <div class="endpoint">
        <span class="method get">GET</span> <code>/api/logs</code>
        <p>Посмотреть логи</p>
    </div>
    
    <h2>Web Interface:</h2>
    <p><a href="/web">Перейти к веб-интерфейсу</a></p>
</body>
</html>
"""
