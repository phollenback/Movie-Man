# Running Movie-Man Locally (API + Frontend)

## 1. Azure Storage (one-time)

```bash
./scripts/setup-table-storage.sh
```

Copy the connection string from the output.

## 2. API (Azure Functions)

```bash
cd api
cp local.settings.json.example local.settings.json
# Edit local.settings.json:
#   - StorageConnectionString: paste from step 1
#   - ENTRA_CLIENT_ID: same as frontend (from .env.local)
#   - ENTRA_TENANT_ID: common
npm install
npm start
```

API runs at `http://localhost:7071`. Routes: `GET/POST/DELETE /api/watchlist`, `GET/POST/DELETE /api/watched`.

## 3. Frontend

```bash
cd front
cp .env.example .env.local
# Edit .env.local with REACT_APP_ENTRA_CLIENT_ID, REACT_APP_OMDB_API_KEY, REACT_APP_REDIRECT_URI=http://localhost:3000
npm start
```

Frontend runs at `http://localhost:3000`. It calls the API at `http://localhost:7071/api` by default.

**Optional:** Set `REACT_APP_API_URL=http://localhost:7071/api` in `.env.local` if the default does not apply.

## 4. Entra redirect URI

Add `http://localhost:3000` to your Entra app's SPA redirect URIs (Authentication → Single-page application).

## 5. CORS

The Functions runtime allows localhost by default. If you see CORS errors, add to `api/local.settings.json`:

```json
"CORS": "http://localhost:3000,http://localhost:8080"
```

## Summary

| Service   | URL                    |
|----------|------------------------|
| Frontend | http://localhost:3000  |
| API      | http://localhost:7071  |
