#include <Arduino.h>
#include <SD.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include "time.h"
#include "file_utils.h"

AsyncWebServer server(80);

void handleListRequest(AsyncWebServerRequest *request)
{
    String path = "/";
    if (request->hasParam("path"))
    {
        path = request->getParam("path")->value();
        path.replace("%20", " "); // простой способ вручную
    }
    File root = SD.open(path);

    if (!root || !root.isDirectory())
    {
        request->send(400, "application/json", "{\"error\":\"Invalid directory\"}");
        return;
    }

    String json = "[";
    File file = root.openNextFile();
    while (file)
    {
        json += "{";
        json += "\"name\":\"" + String(file.name()) + "\",";
        json += "\"isDirectory\":" + String(file.isDirectory() ? "true" : "false") + ",";
        json += "\"size\":\"" + formatBytes(file.size()) + "\",";

        struct stat st;
        if (stat(file.name(), &st) == 0)
        {
            json += "\"lastModified\":\"" + formatTime(st.st_mtime) + "\"";
        }
        else
        {
            json += "\"lastModified\":\"unknown\"";
        }

        json += "}";
        file = root.openNextFile();
        if (file)
            json += ",";
    }
    json += "]";
    request->send(200, "application/json", json);
}

void handleDownloadRequest(AsyncWebServerRequest *request)
{
    Serial.print("Обработка запроса: ");
    if (!request->hasParam("path"))
    {
        request->send(400, "text/plain", "Missing 'path' parameter");
        return;
    }

    String path = request->getParam("path")->value();
    Serial.println(path);
    path.replace("%20", " ");
    if (!path.startsWith("/"))
        path = "/" + path;

    Serial.println("Download request for: " + path);

    if (!SD.exists(path))
    {
        Serial.println("File not found.");
        request->send(404, "text/plain", "File not found");
        return;
    }

    File file = SD.open(path, "r");
    if (!file || file.isDirectory())
    {
        Serial.println("Failed to open file or it is a directory.");
        request->send(500, "text/plain", "Failed to open file");
        return;
    }

    request->send(file, path, "application/octet-stream", true);
}

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
      fetch(`/api/list?path=${path}`)
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
              <td>${!file.isDirectory ? `<a class="download-btn" href="/api/file?path=${path}/${file.name}" target="_blank">⬇️</a>` : ""}</td>
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

void setupWebServer()
{
    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request)
              { request->send(200, "text/html", htmlPage); });

    server.on("/api/list", HTTP_GET, handleListRequest);
    server.on("/api/file", HTTP_GET, handleDownloadRequest);

    server.begin();
}
