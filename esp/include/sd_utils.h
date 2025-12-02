#pragma once
#include <FS.h>

void listDir(fs::FS &fs, const char *dirname, uint8_t levels = 0);
void test_work();
