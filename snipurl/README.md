# SnipURL — Production URL Shortener API

A production-grade URL shortener built with FastAPI, PostgreSQL, and Redis. Features JWT authentication, per-user link management, click analytics, Redis caching, and per-route rate limiting.

---

## Features
- 🚀 Instant URL shortening with custom aliases
- 📊 Real-time click analytics (IP, device, country)
- ⚡ Redis-powered ultra-fast redirects
- 🔐 Secure JWT authentication
- ⏳ Link expiration support
- 🛡️ Built-in rate limiting for abuse prevention
- **Clean, self-documenting code with minimal necessary comments

---
## Frontend

A clean React-based UI for:

- Creating short URLs
- Custom aliases & expiration
- Viewing link details and stats

## Architecture

```
┌─────────────┐     ┌────────────────────────────────────┐     ┌──────────┐
│   Client    │────▶│           FastAPI App              │────▶│ Postgres │
└─────────────┘     │                                    │     └──────────┘
                    │  POST /auth/register  /auth/login  │
                    │  POST /urls           (create)     │     ┌──────────┐
                    │  GET  /{code}         (redirect)   │────▶│  Redis   │
                    │  GET  /urls/me        (list)       │     └──────────┘
                    │  GET  /urls/{code}/stats           │
                    │  PATCH/DELETE /urls/{code}         │
                    └────────────────────────────────────┘
```

**Redirect hot path:**
1. Check Redis for `url:{code}` — return in ~1ms on hit
2. On miss, query Postgres, write to Redis (TTL 1 hour), return
3. `record_click()` runs as a FastAPI `BackgroundTask` — redirect happens immediately, analytics write is async

**Short code generation:**
`secrets.choice` over base-62 alphabet (a–z, A–Z, 0–9), 7 characters = 62⁷ ≈ 3.5 trillion possible codes. Collision probability is negligible at scale; the service retries up to 10 times before failing.

---

## Folder Structure

```
snipurl/
├── app/
│   ├── core/
│   │   ├── config.py        # pydantic-settings, all env vars
│   │   ├── database.py      # SQLAlchemy engine + session
│   │   ├── security.py      # bcrypt + JWT
│   │   └── redis.py         # async Redis client, graceful degradation
│   ├── models/
│   │   └── url.py           # User, URL, Click ORM models
│   ├── schemas/
│   │   └── url.py           # Pydantic request/response schemas
│   ├── services/
│   │   ├── url_service.py   # URL CRUD, caching, analytics
│   │   ├── auth_service.py  # register, login
│   │   └── shortener.py     # short code generation
│   ├── middleware/
│   │   └── auth.py          # JWT bearer dependency
│   ├── routers/
│   │   ├── auth.py          # POST /auth/register  /auth/login
│   │   ├── urls.py          # CRUD under /urls
│   │   └── redirect.py      # GET /{code}
│   └── main.py              # app factory, middleware, lifespan
├── alembic/
│   ├── versions/
│   │   └── 0001_initial_schema.py
│   └── env.py
├── tests/
│   └── test_api.py          # 12 pytest cases covering auth + URLs
├── Dockerfile
├── docker-compose.yml
├── alembic.ini
├── requirements.txt
└── .env.example
```

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | FastAPI 0.115 |
| Database | PostgreSQL 16 + SQLAlchemy 2 |
| Cache | Redis 7 (async, graceful degradation) |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| Migrations | Alembic |
| Rate Limiting | SlowAPI (per-route, per-IP) |
| Validation | Pydantic v2 |
| Testing | pytest + httpx TestClient |
| Container | Docker + Docker Compose |

---

## Quickstart

### With Docker (recommended)

```bash
git clone https://github.com/yourname/snipurl
cd snipurl
cp .env.example .env
docker compose up --build
```

API is live at `http://localhost:8000`. Docs at `http://localhost:8000/docs`.

### Local development

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# Start Postgres + Redis (or use Docker for just infra)
docker compose up db redis -d

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

---

## API Reference

### Auth

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/auth/register` | `{email, username, password}` | Create account |
| POST | `/auth/login` | form: `{username, password}` | Get JWT token |

### URLs

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/urls` | Optional | Shorten a URL |
| GET | `/{code}` | — | Redirect to original |
| GET | `/urls/me` | Required | List your links |
| GET | `/urls/{code}/stats` | Required | Click analytics |
| PATCH | `/urls/{code}` | Required | Toggle active / set expiry |
| DELETE | `/urls/{code}` | Required | Delete a link |

### Example: shorten a URL

```bash
curl -X POST http://localhost:8000/urls \
  -H "Content-Type: application/json" \
  -d '{"original_url": "https://example.com/very/long/path"}'
```

```json
{
  "id": 1,
  "original_url": "https://example.com/very/long/path",
  "short_code": "aB3kR9z",
  "custom_alias": null,
  "short_url": "http://localhost:8000/aB3kR9z",
  "is_active": true,
  "click_count": 0,
  "created_at": "2025-01-01T00:00:00Z",
  "expires_at": null
}
```

### Example: custom alias with expiry

```bash
curl -X POST http://localhost:8000/urls \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "original_url": "https://example.com",
    "custom_alias": "launch",
    "expires_at": "2025-12-31T23:59:59Z"
  }'
```

### Example: click analytics

```bash
curl http://localhost:8000/urls/launch/stats \
  -H "Authorization: Bearer <token>"
```

```json
{
  "short_code": "launch",
  "original_url": "https://example.com",
  "total_clicks": 42,
  "created_at": "2025-01-01T00:00:00Z",
  "expires_at": "2025-12-31T23:59:59Z",
  "last_clicked": "2025-06-15T14:32:00Z",
  "recent_clicks": [
    {
      "id": 99,
      "ip_address": "203.0.113.5",
      "user_agent": "Mozilla/5.0 ...",
      "referer": "https://twitter.com",
      "country": "IN",
      "clicked_at": "2025-06-15T14:32:00Z"
    }
  ]
}
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` | Postgres connection string |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string |
| `SECRET_KEY` | — | JWT signing secret (change in prod) |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Token lifetime |
| `BASE_URL` | `http://localhost:8000` | Prefix for short URLs |
| `SHORT_CODE_LENGTH` | `7` | Length of auto-generated codes |
| `RATE_LIMIT_DEFAULT` | `60/minute` | Global per-IP limit |
| `RATE_LIMIT_CREATE` | `20/minute` | Limit on POST /urls |
| `RATE_LIMIT_REDIRECT` | `200/minute` | Limit on GET /{code} |
| `CORS_ORIGINS` | `["*"]` | Allowed CORS origins |

---

## Running Tests

```bash
pytest tests/ -v
```

Tests run against an in-memory SQLite database and mock Redis (via graceful degradation). No external services required.

---

## Database Schema

```
users
  id, email, username, hashed_password, is_active, created_at

urls
  id, original_url, short_code, custom_alias, owner_id (FK),
  is_active, click_count, created_at, expires_at
  INDEX: short_code (unique), owner_id

clicks
  id, url_id (FK), ip_address, user_agent, referer, country, clicked_at
  INDEX: url_id, clicked_at
```

---

## Scaling to Millions of Users

**Horizontal scaling:** The API is stateless — run multiple instances behind a load balancer (AWS ALB, nginx). Redis and Postgres are the only shared state.

**Read performance:** Redirects hit Redis first. At 10k RPS with a 90% cache hit rate, Postgres sees only ~1k reads/sec. Increase Redis TTL or add replica read nodes to push this further.

**Write performance:** Click analytics use FastAPI `BackgroundTasks` so the HTTP redirect completes immediately. Under extreme write load, move analytics writes to a queue (Celery + RabbitMQ or AWS SQS) and process asynchronously.

**Database:** Add a Postgres read replica for analytics queries. Partition the `clicks` table by month (`clicks_2025_01`, etc.) once it exceeds tens of millions of rows.

**Short code space:** At length 7 with base-62, the theoretical limit is ~3.5 trillion codes. At 1 million new links/day, this exhausts in ~9,500 years. Increase `SHORT_CODE_LENGTH` to 8 when approaching 10% saturation.

**Caching:** Promote the Redis cluster to Redis Sentinel or Redis Cluster for HA. Add a local in-process LRU cache (functools.lru_cache or a small dict) for the top 1% of codes by traffic.

---

## Bonus Features (in future)

- **QR codes** — generate a QR code PNG for any short URL via `/urls/{code}/qr` using `qrcode` library
- **Link preview** — return Open Graph metadata for the destination URL
- **Dashboard** — React frontend showing click timeseries, top referers, geo heatmap
- **Branded domains** — allow users to use their own domain as the base URL
- **Webhook notifications** — fire a POST to a user-defined URL on each click
- **Bulk shortening** — `POST /urls/bulk` accepting a list of URLs

---

