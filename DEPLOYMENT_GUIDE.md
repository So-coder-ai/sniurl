# SnipURL Deployment Guide for Render

## Overview
This guide will help you deploy SnipURL on Render with separate backend API and frontend static site services.

## Prerequisites
- Render account (free tier is sufficient)
- GitHub repository with your code

## Step 1: Prepare Your Repository

1. **Commit all changes** to your GitHub repository
2. **Ensure these files are present:**
   - `render.yaml` (Render configuration)
   - `.env.production` (Backend environment variables)
   - `frontend/.env.production` (Frontend environment variables)

## Step 2: Deploy on Render

### Option A: Using render.yaml (Recommended)
1. Connect your GitHub repository to Render
2. Render will automatically detect `render.yaml` and create all services
3. Services will be created:
   - `snipurl-api` (Backend)
   - `snipurl-db` (PostgreSQL)
   - `snipurl-redis` (Redis)
   - `snipurl-frontend` (Frontend)

### Option B: Manual Setup
1. **Create Backend Service:**
   - Web Service → Python → FastAPI
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Add environment variables (see below)

2. **Create Database:**
   - PostgreSQL → Free tier
   - Note the connection string

3. **Create Redis:**
   - Redis → Free tier

4. **Create Frontend:**
   - Static Site → Node.js → Build & Deploy
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`

## Step 3: Environment Variables

### Backend Environment Variables
```bash
DATABASE_URL=postgresql://[connection-string]
REDIS_URL=redis://[connection-string]
SECRET_KEY=[generate-random-key]
BASE_URL=https://your-backend-name.onrender.com
CORS_ORIGINS=["https://your-frontend-name.onrender.com"]
```

### Frontend Environment Variables
```bash
VITE_API_BASE_URL=https://your-backend-name.onrender.com
```

## Step 4: Update URLs

After deployment, you need to update the URLs in your configuration:

1. **Get your actual Render URLs:**
   - Backend: `https://your-backend-name.onrender.com`
   - Frontend: `https://your-frontend-name.onrender.com`

2. **Update CORS origins** in backend environment variables:
   ```bash
   CORS_ORIGINS=["https://your-frontend-name.onrender.com"]
   ```

3. **Update frontend API URL** in frontend environment variables:
   ```bash
   VITE_API_BASE_URL=https://your-backend-name.onrender.com
   ```

## Step 5: Test the Deployment

1. **Backend Health Check:**
   ```bash
   curl https://your-backend-name.onrender.com/health
   ```

2. **Frontend Access:**
   - Open `https://your-frontend-name.onrender.com`
   - Try creating a short URL

## Troubleshooting

### Issue: "Failed to create short URL"
**Causes:**
1. Wrong API URL in frontend
2. CORS not configured properly
3. Backend not running

**Solutions:**
1. Check browser console for CORS errors
2. Verify `VITE_API_BASE_URL` is correct
3. Check backend logs on Render dashboard

### Issue: CORS Errors
**Solution:**
Update `CORS_ORIGINS` in backend to include your frontend URL:
```bash
CORS_ORIGINS=["https://your-frontend-name.onrender.com"]
```

### Issue: Database Connection Errors
**Solution:**
1. Ensure database is created and running
2. Check `DATABASE_URL` is correct
3. Run migrations manually if needed

### Issue: Rust Compilation Error (pydantic-core)
**Error:** `error: failed to create directory '/usr/local/cargo/registry/cache'`

**Causes:**
- pydantic-core requires Rust to compile
- Render's build environment has filesystem restrictions

**Solutions:**
1. **Use Docker Deployment (Recommended):**
   - The `render.yaml` now uses Docker with `Dockerfile.render`
   - Uses Python 3.11 and compatible package versions
   - Avoids Rust compilation entirely

2. **Use Compatible Package Versions:**
   - `requirements-render.txt` has pre-compiled versions
   - Uses older but stable package versions
   - Avoids packages that need Rust compilation

3. **Manual Deployment Steps:**
   ```bash
   # In Render dashboard, set these environment variables:
   PYTHON_VERSION=3.11.7
   PIP_VERSION=latest
   ```

### Issue: Out of Memory (Free Tier)
**Error:** `Out of memory (used over 512Mi)`

**Causes:**
- Render free tier has 512MB memory limit
- Multi-stage Docker builds use more memory
- Multiple worker processes consume too much memory

**Solutions:**
1. **Use Lightweight Dockerfile:**
   - `Dockerfile.lightweight` is optimized for memory
   - Single-stage build instead of multi-stage
   - Minimal dependencies only

2. **Use Minimal Requirements:**
   - `requirements-minimal.txt` has essential packages only
   - Removes testing and development dependencies
   - Uses memory-efficient package versions

3. **Optimize Startup:**
   - Single worker process: `--workers 1`
   - Set `WEB_CONCURRENCY=1` environment variable
   - Use `start.sh` script for memory management

4. **Alternative: Upgrade Plan:**
   - Render Standard plan ($7/month) provides 1GB RAM
   - Better for production applications
   - More reliable performance

### Issue: Build Timeout
**Solution:**
1. Use Docker deployment (more reliable)
2. Reduce package count in requirements
3. Use Render's build caching

## Production Considerations

1. **Security:**
   - Use a strong `SECRET_KEY`
   - Enable HTTPS (Render does this automatically)
   - Consider rate limiting

2. **Performance:**
   - Monitor Redis usage
   - Consider upgrading database for high traffic

3. **Scaling:**
   - Backend can be scaled horizontally
   - Frontend is static (CDN-friendly)

## Example URLs for Testing

Try these URLs to test your deployed application:

- **Frontend:** `https://your-frontend-name.onrender.com`
- **Backend API:** `https://your-backend-name.onrender.com/docs`
- **Health Check:** `https://your-backend-name.onrender.com/health`

## Support

If you encounter issues:
1. Check Render service logs
2. Verify environment variables
3. Test API endpoints directly
4. Check browser console for JavaScript errors
