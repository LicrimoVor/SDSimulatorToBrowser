#pragma once
#include <Arduino.h>
#include <FS.h>
#include <SD.h>
#include <vector>

struct FileInfo
{
    String name;
    bool isDirectory;
    uint32_t size;
    String lastWrite;
};

std::vector<FileInfo> listDirectory(fs::FS &fs, const char *dirname, uint8_t levels = 1);
String formatBytes(size_t bytes);
String formatTime(time_t ts);
