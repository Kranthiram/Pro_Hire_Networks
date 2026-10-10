# Enterprise Ingestion Firewall — Backend

This folder contains the FastAPI backend for the Enterprise Structured Ingestion Firewall.

## Files

- `app/main.py` — FastAPI application and API endpoints.
- `app/config.py` — Loads environment variables and application configuration.
- `app/schemas/ingestion.py` — Defines Pydantic request and response schemas.
- `app/services/llm_service.py` — Connects to Groq and generates structured AI output.
- `app/utils/token_counter.py` — Estimates input token usage.
- `tests/test_ingestion.py` — Backend tests.
- `requirements.txt` — Python dependencies.
- `.env.example` — Example environment variable configuration.

## How It Works

1. Frontend sends a user message to the FastAPI backend.
2. `IngestionRequest` validates the incoming request.
3. `main.py` sends the message to `llm_service.py`.
4. `llm_service.py` sends the message to Groq.
5. Instructor forces the LLM response to follow the `IngestionResult` Pydantic schema.
6. Pydantic validates the structured AI response.
7. Token metadata is added using the local token counter.
8. FastAPI returns the validated JSON response to the frontend.

## Main API

### Health Check

```text
GET /health