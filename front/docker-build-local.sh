#!/bin/bash
# Build Docker image for local dev - reads from .env.local
set -e
cd "$(dirname "$0")"

if [ ! -f .env.local ]; then
  echo "Missing .env.local - copy from .env.example and add your Entra client ID"
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env.local
set +a

: "${REACT_APP_ENTRA_CLIENT_ID:?REACT_APP_ENTRA_CLIENT_ID not set in .env.local}"
REACT_APP_ENTRA_TENANT_ID="${REACT_APP_ENTRA_TENANT_ID:-common}"
REACT_APP_REDIRECT_URI="${REACT_APP_REDIRECT_URI:-http://localhost:8080}"

docker build -t movie-man-front:latest \
  --build-arg REACT_APP_ENTRA_CLIENT_ID="${REACT_APP_ENTRA_CLIENT_ID}" \
  --build-arg REACT_APP_ENTRA_TENANT_ID="${REACT_APP_ENTRA_TENANT_ID:-common}" \
  --build-arg REACT_APP_REDIRECT_URI="${REACT_APP_REDIRECT_URI:-http://localhost:8080}" \
  --build-arg REACT_APP_OMDB_API_KEY="${REACT_APP_OMDB_API_KEY:-}" \
  -f Dockerfile .

echo ""
echo "Run with: docker run -d -p 8080:80 movie-man-front:latest"
echo "Open:     http://localhost:8080"
