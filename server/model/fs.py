from typing import Dict
from datetime import datetime

from pydantic import BaseModel, Field


class FilesystemInfo(BaseModel):
    current_fs: str
    size_bytes: int
    used_bytes: int
    free_bytes: int
    files_count: int
    last_modified: datetime


class ChangeFSRequest(BaseModel):
    filesystem: str = Field(..., regex="^(fat32|ntfs|exfat|ext4)$")
    backup: bool = True


class SystemStatus(BaseModel):
    usb_status: str
    wifi_status: str
    api_status: str
    disk_usage: Dict
    uptime: str
