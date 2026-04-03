from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, HttpUrl, Field, field_validator
import re


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        if not re.match(r"^[a-zA-Z0-9_-]+$", v):
            raise ValueError("Username may only contain letters, digits, hyphens, and underscores")
        return v


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class URLCreate(BaseModel):
    original_url: HttpUrl
    custom_alias: Optional[str] = Field(default=None, min_length=3, max_length=50)
    expires_at: Optional[datetime] = None

    @field_validator("custom_alias")
    @classmethod
    def alias_format(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not re.match(r"^[a-zA-Z0-9_-]+$", v):
            raise ValueError("Alias may only contain letters, digits, hyphens, and underscores")
        return v


class URLResponse(BaseModel):
    id: int
    original_url: str
    short_code: str
    custom_alias: Optional[str]
    short_url: str
    is_active: bool
    click_count: int
    created_at: datetime
    expires_at: Optional[datetime]

    model_config = {"from_attributes": True}


class ClickResponse(BaseModel):
    id: int
    ip_address: Optional[str]
    user_agent: Optional[str]
    referer: Optional[str]
    country: Optional[str]
    clicked_at: datetime

    model_config = {"from_attributes": True}


class URLStatsResponse(BaseModel):
    short_code: str
    original_url: str
    total_clicks: int
    created_at: datetime
    expires_at: Optional[datetime]
    last_clicked: Optional[datetime]
    recent_clicks: List[ClickResponse]

    model_config = {"from_attributes": True}


class URLUpdateRequest(BaseModel):
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None
