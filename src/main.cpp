#include <Arduino.h>
#include <WiFi.h>
#include "sdusb.h"
#include "web_server.h"
#include "sd_utils.h"

#define SD_MISO 37
#define SD_MOSI 39
#define SD_SCK 38
#define SD_CS 40

SDCard2USB dev;

const char *ssid = "Lol";
const char *password = "1q2w3e4r5t";

void initWiFi()
{
    WiFi.softAP(ssid, password);
    IPAddress IP = WiFi.softAPIP();
    Serial.print("AP IP address: ");
    Serial.println(IP);
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

    initWiFi();
    setupWebServer();
}

void loop()
{
    delay(10000);
    test_work();
}
