#include "file_utils.h"

String formatBytes(size_t bytes)
{
    if (bytes < 1024)
        return String(bytes) + " B";
    else if (bytes < (1024 * 1024))
        return String(bytes / 1024.0, 2) + " KB";
    else
        return String(bytes / 1024.0 / 1024.0, 2) + " MB";
}

String formatTime(time_t ts)
{
    struct tm *tm_info = localtime(&ts);
    char buffer[30];
    strftime(buffer, sizeof(buffer), "%Y-%m-%d %H:%M:%S", tm_info);
    return String(buffer);
}

std::vector<FileInfo> listDirectory(fs::FS &fs, const char *dirname, uint8_t levels)
{
    std::vector<FileInfo> results;
    File root = fs.open(dirname);
    if (!root || !root.isDirectory())
        return results;

    File file = root.openNextFile();
    while (file)
    {
        FileInfo info;
        info.name = String(file.name());
        info.isDirectory = file.isDirectory();
        info.size = file.size();

        struct stat st;
        if (stat(file.name(), &st) == 0)
            info.lastWrite = formatTime(st.st_mtime);
        else
            info.lastWrite = "unknown";

        results.push_back(info);
        file = root.openNextFile();
    }
    return results;
}
