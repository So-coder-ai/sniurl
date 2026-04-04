from fastapi import APIRouter, Depends, BackgroundTasks, Request
from fastapi.responses import RedirectResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.services import resolve_url, record_click

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(tags=["redirect"])


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.get("/{short_code}", status_code=302, include_in_schema=False)
@limiter.limit(settings.rate_limit_redirect)
async def redirect(
    request: Request,
    short_code: str,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    url = await resolve_url(db, short_code)
    background.add_task(
        record_click,
        db,
        url,
        _client_ip(request),
        request.headers.get("user-agent"),
        request.headers.get("referer"),
    )
    return RedirectResponse(url.original_url, status_code=302)
