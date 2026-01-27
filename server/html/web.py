web_html = """
<!DOCTYPE html>
<html>
<head>
    <title>USB Storage Web Interface</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .card { border: 1px solid #ddd; padding: 20px; margin: 10px 0; border-radius: 5px; }
        .status { padding: 10px; margin: 5px 0; border-radius: 3px; }
        .success { background: #d4edda; color: #155724; }
        .warning { background: #fff3cd; color: #856404; }
        .error { background: #f8d7da; color: #721c24; }
        button { padding: 10px 15px; margin: 5px; border: none; border-radius: 3px; cursor: pointer; }
        .btn-primary { background: #007bff; color: white; }
        .btn-danger { background: #dc3545; color: white; }
        .btn-success { background: #28a745; color: white; }
        .fs-option { margin: 10px; }
        .file-list { max-height: 300px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; }
    </style>
    <script>
        async function getStatus() {
            const response = await fetch('/api/status');
            const data = await response.json();
            document.getElementById('status').innerHTML = JSON.stringify(data, null, 2);
        }
        
        async function getFSInfo() {
            const response = await fetch('/api/fs/info');
            const data = await response.json();
            document.getElementById('fs-info').innerHTML = JSON.stringify(data, null, 2);
        }
        
        async function changeFilesystem(fsType) {
            if (!confirm(`Сменить файловую систему на ${fsType.toUpperCase()}?`)) return;
            
            const response = await fetch('/api/fs/change', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filesystem: fsType, backup: true })
            });
            
            const data = await response.json();
            alert(data.message || 'Операция начата');
        }
        
        async function uploadFile() {
            const fileInput = document.getElementById('fileInput');
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            
            const response = await fetch('/api/files/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            alert(data.message || 'Файл загружен');
            listFiles();
        }
        
        async function listFiles() {
            const response = await fetch('/api/files');
            const data = await response.json();
            
            const fileList = document.getElementById('file-list');
            fileList.innerHTML = '';
            
            data.files.forEach(file => {
                const div = document.createElement('div');
                div.innerHTML = `
                    ${file.name} (${formatBytes(file.size)})
                    <button onclick="downloadFile('${file.name}')">Скачать</button>
                    <button class="btn-danger" onclick="deleteFile('${file.name}')">Удалить</button>
                `;
                fileList.appendChild(div);
            });
        }
        
        async function downloadFile(filename) {
            window.open(`/api/files/download/${encodeURIComponent(filename)}`, '_blank');
        }
        
        async function deleteFile(filename) {
            if (!confirm(`Удалить ${filename}?`)) return;
            
            const response = await fetch(`/api/files/${encodeURIComponent(filename)}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            alert(data.message || 'Файл удален');
            listFiles();
        }
        
        function formatBytes(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
        
        // Загружаем данные при загрузке страницы
        window.onload = function() {
            getStatus();
            getFSInfo();
            listFiles();
        }
    </script>
</head>
<body>
    <h1>USB Storage Web Interface</h1>
    
    <div class="card">
        <h2>Системный статус</h2>
        <pre id="status">Загрузка...</pre>
        <button onclick="getStatus()">Обновить статус</button>
    </div>
    
    <div class="card">
        <h2>Файловая система</h2>
        <pre id="fs-info">Загрузка...</pre>
        <button onclick="getFSInfo()">Обновить информацию</button>
        
        <h3>Сменить файловую систему:</h3>
        <div>
            <button class="fs-option btn-primary" onclick="changeFilesystem('fat32')">FAT32</button>
            <button class="fs-option btn-primary" onclick="changeFilesystem('ntfs')">NTFS</button>
            <button class="fs-option btn-primary" onclick="changeFilesystem('exfat')">exFAT</button>
            <button class="fs-option btn-primary" onclick="changeFilesystem('ext4')">ext4</button>
        </div>
        <p><small>Предупреждение: Смена ФС удалит все данные!</small></p>
    </div>
    
    <div class="card">
        <h2>Файлы</h2>
        <div class="file-list" id="file-list">
            Загрузка...
        </div>
        <button onclick="listFiles()">Обновить список</button>
        
        <h3>Загрузить файл:</h3>
        <input type="file" id="fileInput">
        <button class="btn-success" onclick="uploadFile()">Загрузить</button>
    </div>
</body>
</html>
"""
