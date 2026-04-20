from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_profile
from app.db.session import get_db_session
from app.models.profile import Profile
from app.models.task import TaskStatus
from app.schemas.task import TaskCreate, TaskListResponse, TaskRead, TaskTimingFilter, TaskUpdate
from app.services.tasks import create_task, delete_task, get_task, list_tasks, update_task

router = APIRouter(prefix='/tasks')


@router.get('', response_model=TaskListResponse)
def read_tasks(
    session: Annotated[Session, Depends(get_db_session)],
    profile: Annotated[Profile, Depends(get_current_profile)],
    status_filter: Annotated[TaskStatus | None, Query(alias='status')] = None,
    application_id: UUID | None = Query(default=None),
    timing: Annotated[TaskTimingFilter, Query()] = TaskTimingFilter.all,
) -> TaskListResponse:
    items, total = list_tasks(
        session,
        profile_id=profile.id,
        status=status_filter,
        application_id=application_id,
        timing=timing,
    )
    return TaskListResponse(items=[TaskRead.model_validate(item) for item in items], total=total)


@router.post('', response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task_endpoint(
    payload: TaskCreate,
    session: Annotated[Session, Depends(get_db_session)],
    profile: Annotated[Profile, Depends(get_current_profile)],
) -> TaskRead:
    task = create_task(session, profile_id=profile.id, payload=payload)
    return TaskRead.model_validate(task)


@router.get('/{task_id}', response_model=TaskRead)
def read_task(
    task_id: UUID,
    session: Annotated[Session, Depends(get_db_session)],
    profile: Annotated[Profile, Depends(get_current_profile)],
) -> TaskRead:
    task = get_task(session, profile_id=profile.id, task_id=task_id)
    return TaskRead.model_validate(task)


@router.patch('/{task_id}', response_model=TaskRead)
def update_task_endpoint(
    task_id: UUID,
    payload: TaskUpdate,
    session: Annotated[Session, Depends(get_db_session)],
    profile: Annotated[Profile, Depends(get_current_profile)],
) -> TaskRead:
    task = update_task(session, profile_id=profile.id, task_id=task_id, payload=payload)
    return TaskRead.model_validate(task)


@router.delete('/{task_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_task_endpoint(
    task_id: UUID,
    session: Annotated[Session, Depends(get_db_session)],
    profile: Annotated[Profile, Depends(get_current_profile)],
) -> Response:
    delete_task(session, profile_id=profile.id, task_id=task_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
