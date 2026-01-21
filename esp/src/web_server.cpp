#include <Arduino.h>
#include <SD.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <WiFiClientSecure.h>
#include "time.h"
#include "file_utils.h"
#include "html.h"

AsyncWebServer http_server(80);
AsyncWebServer api_server(8000);

bool checkAuth(AsyncWebServerRequest *request)
{
    return true;
    // if (!request->hasHeader("Authorization"))
    //     return false;
    // return request->getHeader("Authorization")->value() == API_TOKEN;
}

void handleListRequest(AsyncWebServerRequest *request)
{
    if (!checkAuth(request))
    {
        request->send(401, "application/json", "{\"error\":\"Unauthorized\"}");
        return;
    }

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
    if (!checkAuth(request))
    {
        request->send(401, "application/json", "{\"error\":\"Unauthorized\"}");
        return;
    }

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

const char *API_TOKEN = "device-secret";

void setupWebServer()
{
    // http_server.on("/", HTTP_GET, [](AsyncWebServerRequest *request)
    //                {
    //     if (!checkAuth(request)) {
    //         request->send(401, "application/json", "{\"error\":\"Unauthorized\"}");
    //         return;
    //     }
    //     request->send(200, "text/html", htmlPage); });

    api_server.on("/api/list", HTTP_GET, handleListRequest);
    api_server.on("/api/file", HTTP_GET, handleDownloadRequest);

    http_server.begin();
    api_server.begin();
}
