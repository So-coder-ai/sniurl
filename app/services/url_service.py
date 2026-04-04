import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.redis import cache_get, cache_set, cache_delete
from app.models import URL, Click
from app.schemas import URLCreate, URLResponse, URLStatsResponse, URLUpdateRequest
from app.services.shortener import generate_short_code

logger = logging.getLogger(__name__)


def _build_short_url(short_code: str) -> str:
    return f"{settings.base_url}/{short_code}"


def _url_to_response(url: URL) -> URLResponse:
    return URLResponse(
        id=url.id,
        original_url=url.original_url,
        short_code=url.short_code,
        custom_alias=url.custom_alias,
        short_url=_build_short_url(url.short_code),
        is_active=url.is_active,
        click_count=url.click_count,
        created_at=url.created_at,
        expires_at=url.expires_at,
    )


async def create_url(db: Session, data: URLCreate, owner_id: Optional[int] = None) -> URLResponse:
    code = data.custom_alias
    if code:
        taken = db.query(URL).filter(
            (URL.short_code == code) | (URL.custom_alias == code)
        ).first()
        if taken:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Alias already taken")
    else:
        for _ in range(10):
            code = generate_short_code(settings.short_code_length)
            if not db.query(URL).filter(URL.short_code == code).first():
                break
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not generate a unique short code — try again",
            )

    url = URL(
        original_url=str(data.original_url),
        short_code=code,
        custom_alias=data.custom_alias,
        expires_at=data.expires_at,
        owner_id=owner_id,
    )
    db.add(url)
    db.commit()
    db.refresh(url)

    await cache_set(f"url:{code}", url.original_url, ttl=3600)
    logger.info(f"Created short URL {code} -> {url.original_url}")
    return _url_to_response(url)


async def resolve_url(db: Session, short_code: str) -> URL:
    cached = await cache_get(f"url:{short_code}")
    if cached:
        url = db.query(URL).filter(URL.short_code == short_code).first()
    else:
        url = db.query(URL).filter(URL.short_code == short_code).first()
        if url and url.is_active and not url.is_expired:
            await cache_set(f"url:{short_code}", url.original_url, ttl=3600)

    if not url or not url.is_active or url.is_expired:
        if url and url.is_expired:
            await cache_delete(f"url:{short_code}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="URL not found or expired")

    return url


async def record_click(
    db: Session,
    url: URL,
    ip_address: Optional[str],
    user_agent: Optional[str],
    referer: Optional[str],
) -> None:
    url.click_count += 1
    click = Click(
        url_id=url.id,
        ip_address=ip_address,
        user_agent=user_agent,
        referer=referer,
    )
    db.add(click)
    db.commit()
    await cache_delete(f"stats:{url.short_code}")


async def get_stats(db: Session, short_code: str, owner_id: Optional[int] = None) -> URLStatsResponse:
    cached = await cache_get(f"stats:{short_code}")
    if cached:
        return URLStatsResponse(**cached)

    url = db.query(URL).filter(URL.short_code == short_code).first()
    if not url:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="URL not found")

    if owner_id is not None and url.owner_id != owner_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    recent = (
        db.query(Click)
        .filter(Click.url_id == url.id)
        .order_by(Click.clicked_at.desc())
        .limit(50)
        .all()
    )
    last = recent[0].clicked_at if recent else None

    stats = URLStatsResponse(
        short_code=url.short_code,
        original_url=url.original_url,
        total_clicks=url.click_count,
        created_at=url.created_at,
        expires_at=url.expires_at,
        last_clicked=last,
        recent_clicks=recent,
    )

    payload = stats.model_dump(mode="json")
    await cache_set(f"stats:{short_code}", payload, ttl=300)
    return stats


async def update_url(
    db: Session, short_code: str, data: URLUpdateRequest, owner_id: int
) -> URLResponse:
    url = db.query(URL).filter(URL.short_code == short_code).first()
    if not url:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="URL not found")
    if url.owner_id != owner_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if data.is_active is not None:
        url.is_active = data.is_active
    if data.expires_at is not None:
        url.expires_at = data.expires_at

    db.commit()
    db.refresh(url)
    await cache_delete(f"url:{short_code}")
    await cache_delete(f"stats:{short_code}")
    return _url_to_response(url)


async def delete_url(db: Session, short_code: str, owner_id: int) -> None:
    url = db.query(URL).filter(URL.short_code == short_code).first()
    if not url:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="URL not found")
    if url.owner_id != owner_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    db.delete(url)
    db.commit()
    await cache_delete(f"url:{short_code}")
    await cache_delete(f"stats:{short_code}")


def get_user_urls(db: Session, owner_id: int, skip: int = 0, limit: int = 50) -> list[URLResponse]:
    urls = (
        db.query(URL)
        .filter(URL.owner_id == owner_id)
        .order_by(URL.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [_url_to_response(u) for u in urls]
