#include <Arduino.h>
#include <DNSServer.h>
#include <WiFi.h>
#include "sdusb.h"
#include "web_server.h"
#include "sd_utils.h"

#define SD_MISO 37
#define SD_MOSI 39
#define SD_SCK 38
#define SD_CS 40

SDCard2USB dev;

const char *ssid = "CDBrowser";
// const char *password = "1q2w3e4r5t";
IPAddress apIP(192, 168, 4, 1);
IPAddress netMsk(255, 255, 255, 0);
DNSServer dnsServer;

void setupWifi()
{
    WiFi.softAPConfig(apIP, apIP, netMsk);
    WiFi.softAP(ssid);
    Serial.println("Точка доступа запущена:");
    Serial.println(WiFi.softAPIP());
}
void setupDNS()
{
    dnsServer.start(53, "*", apIP); // Все запросы → IP ESP32
    Serial.println("DNS сервер запущен (все запросы → ESP32)");
}
void setup()
{
    Serial.begin(115200);
    if (dev.initSD(SD_SCK, SD_MISO, SD_MOSI, SD_CS))
    {
        if (dev.begin())
        {
            Serial.println("MSC lun 1 begin");
        }
        else
        {
            log_e("LUN 1 failed");
        }
    }
    else
    {
        Serial.println("Failed to init SD");
    }

    setupWifi();
    setupDNS();
    setupWebServer();
}

void loop()
{
    dnsServer.processNextRequest();
}
