import os
import subprocess
import datetime as dt

from model.fs import SystemStatus
from core.const import USB_MOUNT


def get_system_status() -> SystemStatus:
    """Получение статуса системы"""

    # Статус USB
    usb_status = "active" if os.path.ismount(USB_MOUNT) else "inactive"

    # Статус WiFi
    wifi_status = "unknown"
    try:
        result = subprocess.run(["iwconfig", "wlan0"], capture_output=True, text=True)
        if "ESSID" in result.stdout:
            wifi_status = "connected"
        else:
            wifi_status = "disconnected"
    except Exception:
        wifi_status = "error"

    # Использование диска
    disk_usage = {}
    try:
        result = subprocess.run(["df", "-h", "/", USB_MOUNT], capture_output=True, text=True)
        disk_usage = {"output": result.stdout}
    except Exception:
        disk_usage = {"error": "Не удалось получить информацию"}

    # Uptime
    uptime = "unknown"
    try:
        with open("/proc/uptime", "r") as f:
            uptime_seconds = float(f.read().split()[0])
            uptime = str(dt.timedelta(seconds=uptime_seconds))
    except Exception:
        pass

    return SystemStatus(
        usb_status=usb_status,
        wifi_status=wifi_status,
        api_status="running",
        disk_usage=disk_usage,
        uptime=uptime,
    )
