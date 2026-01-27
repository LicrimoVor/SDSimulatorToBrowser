import subprocess

from utils.log_message import log_message


def run_command(cmd: str) -> dict:
    """Выполнение shell команды"""
    log_message(f"Выполнение команды: {cmd}")

    try:
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True, timeout=300  # 5 минут таймаут
        )

        return {
            "success": result.returncode == 0,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode,
        }
    except subprocess.TimeoutExpired:
        log_message(f"Таймаут команды: {cmd}")
        return {"success": False, "stdout": "", "stderr": "Command timeout", "returncode": -1}
    except Exception as e:
        log_message(f"Ошибка выполнения команды: {e}")
        return {"success": False, "stdout": "", "stderr": str(e), "returncode": -1}
