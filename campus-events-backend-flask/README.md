# Campus Events Backend (Flask)

Simple Flask API to support the React frontend for Lecture 8.

## Endpoints

- `GET /health` → `{"status":"ok"}`
- `GET /events` → Returns an array of events:
  ```json
  [
    {"id":1,"title":"Hackathon","date":"2025-09-01"},
    {"id":2,"title":"Cultural Fest","date":"2025-09-15"}
  ]
  ```
- `POST /addevent` → Creates an event. Body (JSON):
  ```json
  {"title":"Some Title","date":"2025-12-31"}
  ```
  Response:
  ```json
  {"status":"success","event":{"id":3,"title":"Some Title","date":"2025-12-31"}}
  ```

## Prerequisites

- **Python 3.10+** (3.12 recommended)
- **pip** (Python package manager)

Check versions:
```bash
python --version
pip --version
```

## Setup & Run (macOS/Linux)

```bash
# 1) Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate

# 2) Install dependencies
pip install -r requirements.txt

# 3) Start the server (port 5000)
python app.py
# API will be at http://localhost:5000
```

## Setup & Run (Windows PowerShell)

```powershell
# 1) Create and activate a virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 2) Install dependencies
pip install -r requirements.txt

# 3) Start the server (port 5000)
python app.py
# API will be at http://localhost:5000
```

## Test with curl

```bash
# Health
curl http://localhost:5000/health

# Get events
curl http://localhost:5000/events

# Add event
curl -X POST http://localhost:5000/addevent   -H "Content-Type: application/json"   -d '{"title":"Seminar","date":"2025-10-10"}'
```

## CORS

CORS is enabled for all routes using `flask-cors`, so a React dev server on `http://localhost:5173` can call this API freely during local development.
