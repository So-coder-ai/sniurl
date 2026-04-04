#!/bin/bash

# Memory-efficient startup for Render free tier
export PYTHONUNBUFFERED=1
export PYTHONDONTWRITEBYTECODE=1

# Use single worker to reduce memory usage
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1
