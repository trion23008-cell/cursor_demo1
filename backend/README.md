# Lottery Service (FastAPI)

## Setup

1. Copy environment

```bash
cp .env.example .env
```

2. Start MySQL and Redis (Docker)

```bash
docker compose up -d
```

3. Create Python venv and install deps

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

4. Run API

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## API
- POST /api/auth/login
- GET /api/lotteries/{HK|MACAU|NEW_HK}/recent?limit=10
- GET /api/lotteries/{HK|MACAU|NEW_HK}?page=1&size=10
- POST /api/lotteries/NEW_HK (admin)