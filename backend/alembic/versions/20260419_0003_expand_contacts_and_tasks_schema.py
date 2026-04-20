"""expand contacts and tasks schema for MVP follow-up tracking

Revision ID: 20260419_0003
Revises: 20260419_0002
Create Date: 2026-04-19 00:50:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '20260419_0003'
down_revision: Union[str, None] = '20260419_0002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


task_priority = sa.Enum('low', 'medium', 'high', name='task_priority')
task_status = sa.Enum('open', 'completed', name='task_status')


def upgrade() -> None:
    op.alter_column('contacts', 'company', new_column_name='company_name')
    op.add_column('contacts', sa.Column('notes', sa.Text(), nullable=True))

    task_status.create(op.get_bind(), checkfirst=True)
    task_priority.create(op.get_bind(), checkfirst=True)
    op.add_column('tasks', sa.Column('status', task_status, server_default='open', nullable=False))
    op.add_column('tasks', sa.Column('priority', task_priority, server_default='medium', nullable=False))
    op.execute("UPDATE tasks SET status = 'completed' WHERE completed_at IS NOT NULL")
    op.execute("UPDATE tasks SET status = 'open' WHERE completed_at IS NULL")
    op.create_index(op.f('ix_tasks_profile_id_status'), 'tasks', ['profile_id', 'status'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_tasks_profile_id_status'), table_name='tasks')
    op.drop_column('tasks', 'priority')
    op.drop_column('tasks', 'status')
    task_priority.drop(op.get_bind(), checkfirst=True)
    task_status.drop(op.get_bind(), checkfirst=True)

    op.drop_column('contacts', 'notes')
    op.alter_column('contacts', 'company_name', new_column_name='company')
