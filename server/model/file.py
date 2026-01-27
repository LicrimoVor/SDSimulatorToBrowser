from datetime import datetime
from pydantic import BaseModel


class FileInfo(BaseModel):
    name: str
    path: str
    size: int
    modified: datetime
    is_dir: bool
