"""expand applications schema for MVP CRUD

Revision ID: 20260419_0002
Revises: 20260419_0001
Create Date: 2026-04-19 00:30:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '20260419_0002'
down_revision: Union[str, None] = '20260419_0001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('applications', 'role_title', new_column_name='job_title')
    op.alter_column('applications', 'job_url', new_column_name='posting_url')

    op.add_column('applications', sa.Column('work_type', sa.String(length=100), nullable=True))
    op.add_column('applications', sa.Column('salary_min', sa.Integer(), nullable=True))
    op.add_column('applications', sa.Column('salary_max', sa.Integer(), nullable=True))
    op.add_column('applications', sa.Column('resume_version', sa.String(length=255), nullable=True))
    op.add_column('applications', sa.Column('cover_letter_version', sa.String(length=255), nullable=True))
    op.add_column('applications', sa.Column('date_found', sa.Date(), nullable=True))
    op.add_column('applications', sa.Column('date_applied', sa.Date(), nullable=True))
    op.add_column('applications', sa.Column('next_action', sa.String(length=255), nullable=True))
    op.add_column('applications', sa.Column('next_action_due_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('applications', sa.Column('notes_summary', sa.Text(), nullable=True))
    op.add_column('applications', sa.Column('archived', sa.Boolean(), server_default=sa.text('false'), nullable=False))

    op.execute('UPDATE applications SET date_applied = applied_at::date WHERE applied_at IS NOT NULL')
    op.drop_column('applications', 'applied_at')

    op.create_index(op.f('ix_applications_profile_id_archived'), 'applications', ['profile_id', 'archived'], unique=False)
    op.create_index(op.f('ix_applications_profile_id_date_applied'), 'applications', ['profile_id', 'date_applied'], unique=False)
    op.create_index(op.f('ix_applications_profile_id_next_action_due_at'), 'applications', ['profile_id', 'next_action_due_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_applications_profile_id_next_action_due_at'), table_name='applications')
    op.drop_index(op.f('ix_applications_profile_id_date_applied'), table_name='applications')
    op.drop_index(op.f('ix_applications_profile_id_archived'), table_name='applications')

    op.add_column('applications', sa.Column('applied_at', sa.DateTime(timezone=True), nullable=True))
    op.execute("UPDATE applications SET applied_at = date_applied::timestamp WHERE date_applied IS NOT NULL")

    op.drop_column('applications', 'archived')
    op.drop_column('applications', 'notes_summary')
    op.drop_column('applications', 'next_action_due_at')
    op.drop_column('applications', 'next_action')
    op.drop_column('applications', 'date_applied')
    op.drop_column('applications', 'date_found')
    op.drop_column('applications', 'cover_letter_version')
    op.drop_column('applications', 'resume_version')
    op.drop_column('applications', 'salary_max')
    op.drop_column('applications', 'salary_min')
    op.drop_column('applications', 'work_type')

    op.alter_column('applications', 'posting_url', new_column_name='job_url')
    op.alter_column('applications', 'job_title', new_column_name='role_title')
