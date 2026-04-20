"""add note types for application note tracking

Revision ID: 20260419_0004
Revises: 20260419_0003
Create Date: 2026-04-19 01:20:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '20260419_0004'
down_revision: Union[str, None] = '20260419_0003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


note_type = sa.Enum('general', 'interview', 'call', 'followup', name='note_type')


def upgrade() -> None:
    note_type.create(op.get_bind(), checkfirst=True)
    op.add_column('notes', sa.Column('note_type', note_type, server_default='general', nullable=False))
    op.create_index(op.f('ix_notes_profile_id_application_id'), 'notes', ['profile_id', 'application_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_notes_profile_id_application_id'), table_name='notes')
    op.drop_column('notes', 'note_type')
    note_type.drop(op.get_bind(), checkfirst=True)
