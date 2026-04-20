from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.profile import Profile
from app.schemas.auth import CurrentUser


def get_or_create_profile(session: Session, current_user: CurrentUser) -> Profile:
    profile = session.scalar(select(Profile).where(Profile.supabase_user_id == current_user.user_id))

    if profile is None:
        profile = Profile(
            supabase_user_id=current_user.user_id,
            email=current_user.email,
        )
        session.add(profile)
        session.commit()
        session.refresh(profile)
        return profile

    if current_user.email and profile.email != current_user.email:
        profile.email = current_user.email
        session.add(profile)
        session.commit()
        session.refresh(profile)

    return profile
