from fastapi import APIRouter

from app.api.v1.endpoints.applications import router as applications_router
from app.api.v1.endpoints.contacts import router as contacts_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.dashboard import router as dashboard_router
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.tasks import router as tasks_router

router = APIRouter()
router.include_router(health_router, tags=['health'])
router.include_router(auth_router, tags=['auth'])
router.include_router(dashboard_router, tags=['dashboard'])
router.include_router(applications_router, tags=['applications'])
router.include_router(contacts_router, tags=['contacts'])
router.include_router(tasks_router, tags=['tasks'])
