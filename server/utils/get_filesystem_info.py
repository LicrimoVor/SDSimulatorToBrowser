import os
import subprocess
import shutil
from typing import Optional
from datetime import datetime

from model.fs import FilesystemInfo
from core.const import USB_IMG, USB_MOUNT
from utils.log_message import log_message


def get_filesystem_info() -> Optional[FilesystemInfo]:
    """Получение информации о файловой системе"""
    try:
        # Проверяем, смонтирована ли флешка
        if not os.path.ismount(USB_MOUNT):
            log_message(f"USB не смонтирован в {USB_MOUNT}")
            return None

        # Информация о диске
        disk_usage = shutil.disk_usage(USB_MOUNT)

        # Количество файлов
        file_count = sum([len(files) for _, _, files in os.walk(USB_MOUNT)])

        # Определяем тип файловой системы
        fs_type = "unknown"
        try:
            result = subprocess.run(["df", "-T", USB_MOUNT], capture_output=True, text=True)
            if result.returncode == 0:
                lines = result.stdout.strip().split("\n")
                if len(lines) > 1:
                    fs_type = lines[1].split()[1]
        except Exception:
            pass

        # Время последнего изменения
        stat = os.stat(USB_IMG)
        last_modified = datetime.fromtimestamp(stat.st_mtime)

        return FilesystemInfo(
            current_fs=fs_type,
            size_bytes=disk_usage.total,
            used_bytes=disk_usage.used,
            free_bytes=disk_usage.free,
            files_count=file_count,
            last_modified=last_modified,
        )
    except Exception as e:
        log_message(f"Ошибка получения информации о ФС: {e}")
        return None
