# SnipURL - URL Shortener Application

## Overview
SnipURL is a modern URL shortener built with FastAPI (backend) and React (frontend). It features JWT authentication, analytics, Redis caching, and rate limiting.

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 16+
- PostgreSQL (optional, uses SQLite by default)
- Redis (optional, for caching)

### Quick Start

1. **Clone and Setup:**
   ```bash
   git clone https://github.com/So-coder-ai/sniurl.git
   cd snipurl
   ```

2. **Backend Setup:**
   ```bash
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your settings
   
   # Run backend
   uvicorn app.main:app --reload --port 10000
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:10000
   - API Docs: http://localhost:10000/docs

### Features

- **URL Shortening**: Create short URLs with custom aliases
- **Analytics**: Track clicks and visitor statistics
- **Authentication**: JWT-based user authentication
- **Rate Limiting**: Prevent abuse with configurable limits
- **Caching**: Redis integration for fast redirects
- **Modern UI**: Clean, responsive React interface

### Project Structure

```
snipurl/
├── app/                    # Backend application
│   ├── core/              # Core configuration
│   ├── models/            # Database models
│   ├── routers/           # API endpoints
│   └── main.py           # FastAPI application
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   └── api.js        # API configuration
│   └── package.json
├── Dockerfile            # Docker configuration
├── requirements.txt      # Python dependencies
└── README.md            # Project documentation
```

### API Endpoints

- `POST /urls` - Create short URL
- `GET /urls/me` - Get user's URLs
- `GET /urls/{short_code}/stats` - Get URL statistics
- `PATCH /urls/{short_code}` - Update URL status
- `DELETE /urls/{short_code}` - Delete URL
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Environment Variables

```bash
# Database
DATABASE_URL=sqlite:///./snipurl.db

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Application
BASE_URL=http://localhost:10000
SHORT_CODE_LENGTH=7

# CORS
CORS_ORIGINS=["http://localhost:3000"]

# Rate Limiting
RATE_LIMIT_DEFAULT=60/minute
RATE_LIMIT_CREATE=20/minute
RATE_LIMIT_REDIRECT=200/minute
```

### Testing

```bash
# Backend tests
pytest

# Frontend tests
cd frontend
npm test
```

### Docker Development

```bash
# Build and run with Docker
docker-compose up --build

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:10000
```

## Production Deployment

### Render Deployment

1. **Push to GitHub** and connect to Render
2. **Create Services:**
   - Backend: Web Service (Python/FastAPI)
   - Database: PostgreSQL
   - Frontend: Static Site
3. **Configure Environment Variables**
4. **Deploy**

### Key Considerations

- Use PostgreSQL for production database
- Configure Redis for caching
- Set strong SECRET_KEY
- Enable HTTPS (automatic on Render)
- Monitor rate limits and usage

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 10000 (backend) and 3000 (frontend) are available
2. **Database Connection**: Check DATABASE_URL in .env file
3. **CORS Errors**: Verify CORS_ORIGINS includes frontend URL
4. **Redis Connection**: Optional - app works without Redis

### Development Tips

- Use `uvicorn --reload` for auto-reloading during development
- Check `/docs` for interactive API documentation
- Monitor logs for debugging
- Use browser dev tools to inspect API calls

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes and test
4. Submit pull request

## License

This project is for educational and portfolio purposes.
