import os

from fastapi import HTTPException, APIRouter
from fastapi.responses import HTMLResponse, JSONResponse

from core.const import LOG_FILE, USB_MOUNT
from html.main import main_html
from html.web import web_html
from utils.run_command import run_command
from utils.log_message import log_message


router = APIRouter()


@router.get("/", response_class=HTMLResponse)
async def root():
    """Главная страница с документацией API"""
    return HTMLResponse(content=main_html)


@router.get("/web")
async def web_interface():
    """Веб интерфейс для управления"""
    return HTMLResponse(content=web_html)


@router.get("/api/logs")
async def get_logs(limit: int = 100):
    """Получение логов"""
    try:
        if not os.path.exists(LOG_FILE):
            return JSONResponse(content={"logs": [], "message": "Лог файл не найден"})

        with open(LOG_FILE, "r") as f:
            lines = f.readlines()

        # Берем последние limit строк
        logs = lines[-limit:] if len(lines) > limit else lines

        return JSONResponse(
            content={
                "total_lines": len(lines),
                "shown_lines": len(logs),
                "logs": [line.strip() for line in logs],
            }
        )
    except Exception as e:
        log_message(f"Ошибка чтения логов: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/system/restart")
async def restart_system():
    """Перезапуск USB системы"""
    try:
        # Останавливаем USB гаджет
        if os.path.exists("/sys/kernel/config/usb_gadget/flash/UDC"):
            with open("/sys/kernel/config/usb_gadget/flash/UDC", "w") as f:
                f.write("")

        # Размонтируем
        run_command(f"sudo umount {USB_MOUNT} 2>/dev/null || true")

        # Запускаем снова
        run_command("sudo systemctl restart usb-mass-storage.service")

        return JSONResponse(content={"message": "Система USB перезапущена", "status": "restarting"})
    except Exception as e:
        log_message(f"Ошибка перезапуска системы: {e}")
        raise HTTPException(status_code=500, detail=str(e))
