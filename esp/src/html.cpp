const char *htmlPage = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>SD File Browser</title>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #aaa; padding: 8px; text-align: left; }
    th { background-color: #ddd; }
    .folder { font-weight: bold; cursor: pointer; color: #0645AD; }
    .download-btn { text-decoration: none; color: green; font-weight: bold; }
  </style>
</head>
<body>
  <h2>Загрузчик SD Card</h2>
  <div id="pathDisplay">Path: /</div>
  <table id="fileTable">
    <thead>
      <tr><th>Name</th><th>Size</th><th>Action</th></tr>
    </thead>
    <tbody></tbody>
  </table>

  <script>
    let currentPath = "/";
    function loadFiles(path) {
      fetch(`http://browser_reader:8000/api/list?path=${path}`)
        .then(res => res.json())
        .then(data => {
          currentPath = path;
          document.getElementById("pathDisplay").innerText = "Path: " + path;
          const tbody = document.querySelector("#fileTable tbody");
          tbody.innerHTML = "";
          data.forEach(file => {
            const tr = document.createElement("tr");
            const nameTd = document.createElement("td");
            if (file.isDirectory) {
                let pathLoad = "";
                if (path == "/") {
                    pathLoad = `/${file.name}`;
                } else {
                    pathLoad = `${path}/${file.name}`;
                }
                nameTd.innerHTML = `<span class="folder" onclick="loadFiles('${pathLoad}')">${file.name}</span>`;
            } else {
                nameTd.textContent = file.name;
            }
            tr.appendChild(nameTd);
            tr.innerHTML += `
              <td>${file.size}</td>
              <td>${!file.isDirectory ? `<a class="download-btn" href="http://browser_reader:8000/api/file?path=${path}/${file.name}" target="_blank">⬇️</a>` : ""}</td>
            `;
            tbody.appendChild(tr);
          });
        });
    }
    loadFiles("/");
  </script>
</body>
</html>
)rawliteral";