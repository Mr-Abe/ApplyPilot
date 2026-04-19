"""create MVP core schema

Revision ID: 20260419_0001
Revises:
Create Date: 2026-04-19 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260419_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

application_status = sa.Enum(
    "wishlist",
    "applying",
    "applied",
    "screening",
    "interview",
    "final_round",
    "offer",
    "rejected",
    "withdrawn",
    name="application_status",
)


def upgrade() -> None:

    op.create_table(
        "profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("supabase_user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=True),
        sa.Column("display_name", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_profiles")),
        sa.UniqueConstraint("supabase_user_id", name=op.f("uq_profiles_supabase_user_id")),
    )

    op.create_table(
        "applications",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("profile_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("company_name", sa.String(length=255), nullable=False),
        sa.Column("role_title", sa.String(length=255), nullable=False),
        sa.Column("status", application_status, server_default=sa.text("'wishlist'::application_status"), nullable=False),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("job_url", sa.String(length=2048), nullable=True),
        sa.Column("source", sa.String(length=255), nullable=True),
        sa.Column("applied_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["profile_id"], ["profiles.id"], name=op.f("fk_applications_profile_id_profiles"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_applications")),
    )
    op.create_index(op.f("ix_applications_profile_id"), "applications", ["profile_id"], unique=False)
    op.create_index(op.f("ix_applications_profile_id_status"), "applications", ["profile_id", "status"], unique=False)

    op.create_table(
        "contacts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("profile_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=True),
        sa.Column("phone", sa.String(length=50), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=True),
        sa.Column("company", sa.String(length=255), nullable=True),
        sa.Column("linkedin_url", sa.String(length=2048), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["profile_id"], ["profiles.id"], name=op.f("fk_contacts_profile_id_profiles"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_contacts")),
    )
    op.create_index(op.f("ix_contacts_profile_id"), "contacts", ["profile_id"], unique=False)

    op.create_table(
        "application_contacts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("profile_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("application_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("contact_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("relationship_type", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["application_id"], ["applications.id"], name=op.f("fk_application_contacts_application_id_applications"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["contact_id"], ["contacts.id"], name=op.f("fk_application_contacts_contact_id_contacts"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["profile_id"], ["profiles.id"], name=op.f("fk_application_contacts_profile_id_profiles"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_application_contacts")),
        sa.UniqueConstraint("application_id", "contact_id", name=op.f("uq_application_contacts_application_id_contact_id")),
    )
    op.create_index(op.f("ix_application_contacts_profile_id"), "application_contacts", ["profile_id"], unique=False)

    op.create_table(
        "tasks",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("profile_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("application_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("contact_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("due_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["application_id"], ["applications.id"], name=op.f("fk_tasks_application_id_applications"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["contact_id"], ["contacts.id"], name=op.f("fk_tasks_contact_id_contacts"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["profile_id"], ["profiles.id"], name=op.f("fk_tasks_profile_id_profiles"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_tasks")),
    )
    op.create_index(op.f("ix_tasks_profile_id_due_at"), "tasks", ["profile_id", "due_at"], unique=False)

    op.create_table(
        "notes",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("profile_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("application_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("contact_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["application_id"], ["applications.id"], name=op.f("fk_notes_application_id_applications"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["contact_id"], ["contacts.id"], name=op.f("fk_notes_contact_id_contacts"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["profile_id"], ["profiles.id"], name=op.f("fk_notes_profile_id_profiles"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_notes")),
    )
    op.create_index(op.f("ix_notes_profile_id"), "notes", ["profile_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_notes_profile_id"), table_name="notes")
    op.drop_table("notes")

    op.drop_index(op.f("ix_tasks_profile_id_due_at"), table_name="tasks")
    op.drop_table("tasks")

    op.drop_index(op.f("ix_application_contacts_profile_id"), table_name="application_contacts")
    op.drop_table("application_contacts")

    op.drop_index(op.f("ix_contacts_profile_id"), table_name="contacts")
    op.drop_table("contacts")

    op.drop_index(op.f("ix_applications_profile_id_status"), table_name="applications")
    op.drop_index(op.f("ix_applications_profile_id"), table_name="applications")
    op.drop_table("applications")

    op.drop_table("profiles")

    bind = op.get_bind()
    application_status.drop(bind, checkfirst=True)
