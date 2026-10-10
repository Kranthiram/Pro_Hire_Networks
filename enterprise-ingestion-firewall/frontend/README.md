# Enterprise Ingestion Firewall — Frontend

This folder contains the frontend UI for the Enterprise Structured Ingestion Firewall project.

## Files

- `index.html` — Defines the webpage structure and UI elements.
- `style.css` — Handles styling, layout, colors, buttons, and responsive design.
- `script.js` — Handles user interactions and communication with the FastAPI backend.

## How It Works

1. User enters a message in the textarea.
2. `script.js` sends the message to the FastAPI backend.
3. Backend endpoint used:

   `POST http://127.0.0.1:8000/api/analyze`

4. FastAPI validates the request using Pydantic.
5. The backend sends the message to Groq through Instructor.
6. The validated `IngestionResult` is returned as JSON.
7. `script.js` displays the structured JSON in the frontend.

## Main Frontend Concepts

- HTML → Page structure
- CSS → Styling and responsive design
- JavaScript → User interaction and API communication
- `fetch()` → Sends HTTP requests
- `JSON.stringify()` → Converts JavaScript objects into formatted JSON
- `response.json()` → Reads JSON from the backend response
- `async/await` → Handles asynchronous API requests
- `try/catch/finally` → Handles success, errors, and cleanup

## Backend Connection

The frontend communicates with the FastAPI backend running at:

`http://127.0.0.1:8000`

Main API:

`POST /api/analyze`

## Important Note

The frontend only collects the user's message and displays the validated result.

The actual AI classification, Pydantic validation, and token estimation are performed by the backend.

## Technologies

- HTML
- CSS
- JavaScript
- FastAPI
- Groq
- Instructor
- Pydantic