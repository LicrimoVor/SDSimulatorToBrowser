#include <Arduino.h>
#include <FS.h>
#include "sd_utils.h"
#include "SD.h"

void listDir(fs::FS &fs, const char *dirname, uint8_t levels)
{
    File root = fs.open(dirname);
    if (!root || !root.isDirectory())
        return;
    File file = root.openNextFile();
    while (file)
    {
        Serial.printf("%s - %d bytes\n", file.name(), file.size());
        file = root.openNextFile();
    }
}

void test_work()
{
    uint8_t cardType = SD.cardType();
    Serial.print("SD Card Type: ");
    if (cardType == CARD_MMC)
        Serial.println("MMC");
    else if (cardType == CARD_SD)
        Serial.println("SDSC");
    else if (cardType == CARD_SDHC)
        Serial.println("SDHC");
    else
        Serial.println("UNKNOWN");

    Serial.printf("SD Card Size: %lluMB\n", SD.cardSize() / (1024 * 1024));
    listDir(SD, "/", 0);
}
