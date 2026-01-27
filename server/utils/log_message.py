from datetime import datetime
from core.const import LOG_FILE


def log_message(message: str):
    """Запись в лог файл"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"[{timestamp}] {message}\n"

    try:
        with open(LOG_FILE, "a") as f:
            f.write(log_entry)
    except Exception:
        pass  # Если не можем писать в лог - продолжаем

    print(log_entry.strip())
