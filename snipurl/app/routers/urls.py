from fastapi import APIRouter, Depends, BackgroundTasks, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.database import get_db
from app.middleware.auth import get_current_user, get_optional_user
from app.models import User
from app.schemas import URLCreate, URLResponse, URLStatsResponse, URLUpdateRequest
from app.services import create_url, get_stats, update_url, delete_url, get_user_urls

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/urls", tags=["urls"])


@router.post("", response_model=URLResponse, status_code=201)
@limiter.limit(settings.rate_limit_create)
async def shorten(
    request: Request,
    data: URLCreate,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    owner_id = current_user.id if current_user else None
    return await create_url(db, data, owner_id=owner_id)


@router.get("/me", response_model=list[URLResponse])
def list_my_urls(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_urls(db, owner_id=current_user.id, skip=skip, limit=limit)


@router.get("/{short_code}/stats", response_model=URLStatsResponse)
@limiter.limit("30/minute")
async def stats(
    request: Request,
    short_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_stats(db, short_code, owner_id=current_user.id)


@router.patch("/{short_code}", response_model=URLResponse)
async def update(
    short_code: str,
    data: URLUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await update_url(db, short_code, data, owner_id=current_user.id)


@router.delete("/{short_code}", status_code=204)
async def delete(
    short_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await delete_url(db, short_code, owner_id=current_user.id)
