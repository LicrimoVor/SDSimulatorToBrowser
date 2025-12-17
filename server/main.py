import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List
import os

app = FastAPI()

CHUNK_SIZE = 1024 * 64  # 64 KB
DELAY = 0.1  # 0.1 сек


class FileInfo(BaseModel):
    name: str
    isDirectory: bool
    size: int
    lastModified: float


async def slow_file_reader(path: str):
    with open(path, "rb") as f:
        while chunk := f.read(CHUNK_SIZE):
            yield chunk
            await asyncio.sleep(DELAY)


@app.get("/api/list", response_model=List[FileInfo])
def list_files(path: str = "."):
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Path not found")

    if not os.path.isdir(path):
        raise HTTPException(status_code=400, detail="Path must be a directory")

    print(path)
    if path.startswith("/"):
        print(path)
        path = path[1:]

    result = []
    for name in os.listdir(path):
        full_path = os.path.join(path, name)
        stat = os.stat(full_path)
        result.append(
            FileInfo(
                name=name,
                isDirectory=os.path.isdir(full_path),
                size=stat.st_size,
                lastModified=stat.st_mtime,
            )
        )

    return result


@app.get("/api/file")
def get_file(path: str):
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")

    if os.path.isdir(path):
        raise HTTPException(status_code=400, detail="Path is a directory")

    return FileResponse(path, filename=os.path.basename(path))
    # return StreamingResponse(
    #     slow_file_reader(path),
    #     media_type="application/octet-stream",
    #     headers={"Content-Disposition": "attachment; filename=large_file.zip"},
    # )
