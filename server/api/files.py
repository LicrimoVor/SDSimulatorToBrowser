import os
import shutil
from datetime import datetime

from fastapi import HTTPException, UploadFile, File, APIRouter
from fastapi.responses import JSONResponse, FileResponse

from core.const import USB_MOUNT
from model.file import FileInfo
from utils.log_message import log_message
from utils.mount_usb_image import mount_usb_image


router = APIRouter()


@router.get("/api/files")
async def list_files(path: str = ""):
    """Список файлов"""
    try:
        # Монтируем если не смонтировано
        if not mount_usb_image():
            raise HTTPException(status_code=500, detail="Не удалось смонтировать USB")

        target_path = os.path.join(USB_MOUNT, path.lstrip("/"))

        # Проверяем безопасность пути
        if not target_path.startswith(USB_MOUNT):
            raise HTTPException(status_code=400, detail="Некорректный путь")

        if not os.path.exists(target_path):
            raise HTTPException(status_code=404, detail="Путь не найден")

        files = []
        for item in os.listdir(target_path):
            item_path = os.path.join(target_path, item)
            stat = os.stat(item_path)

            files.append(
                FileInfo(
                    name=item,
                    path=os.path.relpath(item_path, USB_MOUNT),
                    size=stat.st_size,
                    modified=datetime.fromtimestamp(stat.st_mtime),
                    is_dir=os.path.isdir(item_path),
                ).dict()
            )

        # Сортируем: сначала директории, потом файлы
        files.sort(key=lambda x: (not x["is_dir"], x["name"].lower()))

        return JSONResponse(
            content={
                "path": path,
                "total_files": len([f for f in files if not f["is_dir"]]),
                "total_dirs": len([f for f in files if f["is_dir"]]),
                "files": files,
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        log_message(f"Ошибка получения списка файлов: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/files/upload")
async def upload_file(file: UploadFile = File(...)):
    """Загрузка файла"""
    try:
        # Монтируем если не смонтировано
        if not mount_usb_image():
            raise HTTPException(status_code=500, detail="Не удалось смонтировать USB")

        # Проверяем свободное место
        disk_free = shutil.disk_usage(USB_MOUNT).free
        file_size = 0

        # Считываем размер файла
        content = await file.read()
        file_size = len(content)

        if file_size > disk_free:
            raise HTTPException(status_code=400, detail="Недостаточно свободного места")

        # Сохраняем файл
        file_path = os.path.join(USB_MOUNT, file.filename)

        # Защита от перезаписи
        counter = 1
        base_name, ext = os.path.splitext(file.filename)
        while os.path.exists(file_path):
            file_path = os.path.join(USB_MOUNT, f"{base_name}_{counter}{ext}")
            counter += 1

        with open(file_path, "wb") as f:
            f.write(content)

        log_message(f"Файл загружен: {file.filename} ({file_size} bytes)")

        return JSONResponse(
            content={
                "message": "Файл успешно загружен",
                "filename": os.path.basename(file_path),
                "size": file_size,
                "path": os.path.relpath(file_path, USB_MOUNT),
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        log_message(f"Ошибка загрузки файла: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/files/download/{filename:path}")
async def download_file(filename: str):
    """Скачивание файла"""
    try:
        # Монтируем если не смонтировано
        if not mount_usb_image():
            raise HTTPException(status_code=500, detail="Не удалось смонтировать USB")

        file_path = os.path.join(USB_MOUNT, filename.lstrip("/"))

        # Проверяем безопасность пути
        if not file_path.startswith(USB_MOUNT):
            raise HTTPException(status_code=400, detail="Некорректный путь")

        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Файл не найден")

        if os.path.isdir(file_path):
            raise HTTPException(status_code=400, detail="Нельзя скачать директорию")

        log_message(f"Скачивание файла: {filename}")

        return FileResponse(
            path=file_path,
            filename=os.path.basename(file_path),
            media_type="application/octet-stream",
        )
    except HTTPException:
        raise
    except Exception as e:
        log_message(f"Ошибка скачивания файла: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/api/files/{filename:path}")
async def delete_file(filename: str):
    """Удаление файла"""
    try:
        # Монтируем если не смонтировано
        if not mount_usb_image():
            raise HTTPException(status_code=500, detail="Не удалось смонтировать USB")

        file_path = os.path.join(USB_MOUNT, filename.lstrip("/"))

        # Проверяем безопасность пути
        if not file_path.startswith(USB_MOUNT):
            raise HTTPException(status_code=400, detail="Некорректный путь")

        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Файл не найден")

        # Удаляем
        if os.path.isdir(file_path):
            shutil.rmtree(file_path)
        else:
            os.remove(file_path)

        log_message(f"Файл удален: {filename}")

        return JSONResponse(content={"message": "Файл успешно удален", "filename": filename})
    except HTTPException:
        raise
    except Exception as e:
        log_message(f"Ошибка удаления файла: {e}")
        raise HTTPException(status_code=500, detail=str(e))
