import os

from fastapi import BackgroundTasks, HTTPException, APIRouter
from fastapi.responses import JSONResponse

from core.const import CHANGE_FS_SCRIPT
from model.fs import ChangeFSRequest
from utils.get_filesystem_info import get_filesystem_info
from utils.run_command import run_command
from utils.get_system_status import get_system_status
from utils.log_message import log_message
from utils.mount_usb_image import mount_usb_image


router = APIRouter()


@router.get("/api/fs/status")
async def api_status():
    """Получение статуса системы"""
    try:
        status = get_system_status()
        return JSONResponse(content=status.dict())
    except Exception as e:
        log_message(f"Ошибка получения статуса: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/fs/info")
async def fs_info():
    """Информация о файловой системе"""
    try:
        # Монтируем если не смонтировано
        if not mount_usb_image():
            raise HTTPException(status_code=500, detail="Не удалось смонтировать USB")

        info = get_filesystem_info()
        if info is None:
            raise HTTPException(status_code=500, detail="Не удалось получить информацию о ФС")

        return JSONResponse(content=info.dict())
    except HTTPException:
        raise
    except Exception as e:
        log_message(f"Ошибка получения информации о ФС: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/fs/change")
async def fs_change(request: ChangeFSRequest, background_tasks: BackgroundTasks):
    """Смена файловой системы"""
    try:
        # Проверяем наличие скрипта
        if not os.path.exists(CHANGE_FS_SCRIPT):
            raise HTTPException(status_code=500, detail="Скрипт смены ФС не найден")

        # Проверяем права
        if os.geteuid() != 0:
            raise HTTPException(status_code=403, detail="Требуются права root")

        # Выполняем смену ФС в фоновом режиме
        def change_filesystem_background():
            cmd = f"sudo {CHANGE_FS_SCRIPT} {request.filesystem}"
            result = run_command(cmd)

            if not result["success"]:
                log_message(f"Ошибка смены ФС: {result['stderr']}")

        background_tasks.add_task(change_filesystem_background)

        return JSONResponse(
            content={
                "message": f"Запущена смена файловой системы на {request.filesystem.upper()}",
                "warning": "Операция выполняется в фоне. Не отключайте питание!",
                "estimated_time": "2-5 минут",
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        log_message(f"Ошибка запуска смены ФС: {e}")
        raise HTTPException(status_code=500, detail=str(e))
