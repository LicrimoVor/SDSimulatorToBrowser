from fastapi import APIRouter
from .files import router as files_router
from .fs import router as fs_router
from .general import router as general_router

router = APIRouter()
router.include_router(files_router)
router.include_router(fs_router)
router.include_router(general_router)
