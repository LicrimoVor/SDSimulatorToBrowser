import os

# PlatformIO передает env через аргументы скрипта
Import("env")  # noqa E402 это нужно именно так

env_path = ".env"

if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip()
            # подставляем в build_flags
            env.Append(
                BUILD_FLAGS=[f'-D{key}=\\"{value}\\"']
            )
