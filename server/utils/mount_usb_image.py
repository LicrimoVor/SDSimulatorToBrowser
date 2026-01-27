import os

from core.const import USB_IMG, USB_MOUNT
from utils.run_command import run_command
from utils.log_message import log_message


def mount_usb_image():
    """Монтирование USB образа"""
    if os.path.ismount(USB_MOUNT):
        return True

    log_message(f"Монтируем USB в {USB_MOUNT}")

    # Создаем директорию если нет
    os.makedirs(USB_MOUNT, exist_ok=True)

    # Пробуем смонтировать
    cmd = f"sudo mount -o loop {USB_IMG} {USB_MOUNT} 2>/dev/null || "
    cmd += f"sudo ntfs-3g -o loop {USB_IMG} {USB_MOUNT} 2>/dev/null || "
    cmd += f"sudo mount -o loop,ro {USB_IMG} {USB_MOUNT}"

    result = run_command(cmd)
    return result["success"]
