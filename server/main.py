import os

from fastapi import FastAPI
from fastapi.responses import JSONResponse
import uvicorn

from core.const import LOG_FILE, USB_MOUNT
from utils.log_message import log_message
from api import router

app = FastAPI(
    title="Raspberry Pi Zero USB Storage API",
    description="API для управления USB флешкой на Raspberry Pi Zero",
    version="1.0.0",
)

app.include_router(router)


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    log_message(f"Необработанное исключение: {exc}")
    return JSONResponse(
        status_code=500, content={"detail": "Внутренняя ошибка сервера", "error": str(exc)}
    )


if __name__ == "__main__":
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    os.makedirs(USB_MOUNT, exist_ok=True)

    log_message("=== Запуск USB Storage API Server ===")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
