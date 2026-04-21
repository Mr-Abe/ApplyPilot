from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_profile
from app.db.session import get_db_session
from app.models.profile import Profile
from app.schemas.dashboard import DashboardStatusBreakdown, DashboardSummary, DashboardTaskListResponse
from app.services.dashboard import (
    get_dashboard_summary,
    get_status_breakdown,
    list_overdue_tasks,
    list_upcoming_tasks,
)

router = APIRouter(prefix='/dashboard')


@router.get('/summary', response_model=DashboardSummary)
def read_dashboard_summary(
    session: Annotated[Session, Depends(get_db_session)],
    profile: Annotated[Profile, Depends(get_current_profile)],
) -> DashboardSummary:
    return get_dashboard_summary(session, profile_id=profile.id)


@router.get('/status-breakdown', response_model=DashboardStatusBreakdown)
def read_dashboard_status_breakdown(
    session: Annotated[Session, Depends(get_db_session)],
    profile: Annotated[Profile, Depends(get_current_profile)],
) -> DashboardStatusBreakdown:
    return DashboardStatusBreakdown(items=get_status_breakdown(session, profile_id=profile.id))


@router.get('/tasks/overdue', response_model=DashboardTaskListResponse)
def read_dashboard_overdue_tasks(
    session: Annotated[Session, Depends(get_db_session)],
    profile: Annotated[Profile, Depends(get_current_profile)],
    limit: Annotated[int, Query(ge=1, le=20)] = 5,
) -> DashboardTaskListResponse:
    items, total = list_overdue_tasks(session, profile_id=profile.id, limit=limit)
    return DashboardTaskListResponse(items=items, total=total)


@router.get('/tasks/upcoming', response_model=DashboardTaskListResponse)
def read_dashboard_upcoming_tasks(
    session: Annotated[Session, Depends(get_db_session)],
    profile: Annotated[Profile, Depends(get_current_profile)],
    limit: Annotated[int, Query(ge=1, le=20)] = 5,
) -> DashboardTaskListResponse:
    items, total = list_upcoming_tasks(session, profile_id=profile.id, limit=limit)
    return DashboardTaskListResponse(items=items, total=total)
