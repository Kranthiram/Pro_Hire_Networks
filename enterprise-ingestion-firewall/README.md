# Enterprise Ingestion Firewall

An AI-powered customer-support system that classifies incoming user messages, validates structured LLM outputs, applies response policies, and maintains persistent conversation memory using MySQL.

## Overview

The Enterprise Ingestion Firewall is designed for e-commerce customer-support use cases such as payments, refunds, orders, billing, products, and delivery.

The system uses a two-stage LLM workflow:

1. The first LLM call analyzes the incoming message and produces structured information such as intent, risk profile, priority, and whether an action is required.
2. A response policy uses this structured information to control response behavior and token budget.
3. The second LLM call generates the final customer-support response.
4. Conversation history is stored in MySQL and retrieved using a unique session ID, allowing context-aware follow-up conversations.

## Key Features

- Structured LLM-based intent classification
- Pydantic validation for AI-generated structured outputs
- Intent, risk, priority, and action classification
- Dynamic response policy and token budget
- Customer-support domain restriction
- MySQL-based persistent conversation memory
- Session-based conversation handling
- FastAPI backend
- HTML/CSS/JavaScript frontend
- Markdown response rendering
- REST API communication
- CORS support
- Token estimation
- Environment-based configuration

## Architecture

```text
                    User
                     |
                     v
          HTML / CSS / JavaScript
                     |
                     | POST /api/analyze
                     v
              FastAPI Backend
                     |
                     v
          Conversation / Session
              Memory Lookup
                     |
                     v
             LLM Classification
                     |
                     v
       Structured Pydantic Validation
                     |
          +----------+----------+
          |                     |
       Intent                Risk
       Priority              Action
          |                     |
          +----------+----------+
                     |
                     v
              Response Policy
                     |
              Dynamic Token Budget
                     |
                     v
             Response LLM Call
                     |
                     v
             Final Markdown
                     |
          +----------+----------+
          |                     |
          v                     v
      Save User            Save Assistant
       Message               Response
          |                     |
          +----------+----------+
                     |
                     v
                   MySQL
```

## Technology Stack

### Backend

- Python
- FastAPI
- Pydantic
- Groq API
- Instructor
- MySQL Connector/Python

### Frontend

- HTML
- CSS
- JavaScript
- Marked.js for Markdown rendering

### Database

- MySQL

### Development Tools

- Git
- GitHub
- uv
- pytest

## Project Structure

```text
enterprise-ingestion-firewall/
│
├── backend/
│   ├── app/
│   │   ├── schemas/
│   │   │   ├── assistant.py
│   │   │   ├── conversation.py
│   │   │   └── ingestion.py
│   │   │
│   │   ├── services/
│   │   │   ├── database_service.py
│   │   │   ├── llm_service.py
│   │   │   └── response_service.py
│   │   │
│   │   ├── utils/
│   │   │   └── token_counter.py
│   │   │
│   │   ├── config.py
│   │   └── main.py
│   │
│   ├── tests/
│   │   └── test_ingestion.py
│   │
│   ├── .env
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── week3_preclass/
│   └── conversation_memory.py
│
├── .gitignore
├── pyproject.toml
├── uv.lock
└── README.md
```

## How the System Works

### 1. User Message

The user enters a customer-support message through the frontend.

Example:

```text
My payment was deducted twice. What should I do?
```

The frontend sends the message to:

```text
POST /api/analyze
```

with an optional session ID.

### 2. Session Management

If a session ID does not exist, the backend creates a new unique conversation ID.

If a session ID already exists, the backend retrieves the previous conversation history from MySQL.

This allows follow-up questions to use previous conversation context.

### 3. Intent Classification

The first LLM call analyzes the incoming message and returns structured information.

Example fields:

```text
intent
risk_profile
priority
requires_action
summary
token_metadata
```

The structured response is validated using Pydantic.

### 4. Response Policy

The system uses the structured classification to determine how the response should be generated.

The response policy considers:

- Intent
- Risk profile
- Priority
- Whether an action is required

The system then dynamically selects an appropriate `max_tokens` value instead of using the same response budget for every request.

Simple requests use a smaller budget, while important customer-support issues can receive a larger response budget.

### 5. Response Generation

A second LLM call generates the final customer-support response using:

- System instructions
- Previous conversation history
- Current structured intent analysis
- Response policy

The final answer is returned as Markdown.

### 6. Conversation Memory

After the response is generated, both the user message and assistant response are stored in MySQL.

Each message is associated with the conversation's unique session ID.

This allows the system to retrieve previous messages when the user asks follow-up questions.

## Database Design

The project uses two main MySQL tables.

### Conversations

```text
id
title
created_at
updated_at
```

### Messages

```text
id
conversation_id
role
content
created_at
```

The `conversation_id` connects messages to their conversation.

A foreign key with cascade deletion is used between conversations and messages.

An index is created on conversation ID and message creation time to support conversation-history retrieval.

## API

### Health Check

```http
GET /health
```

Example response:

```json
{
  "status": "ok",
  "message": "Ingestion Firewall API is running"
}
```

### Analyze Message

```http
POST /api/analyze
```

Request:

```json
{
  "message": "My payment was deducted twice.",
  "session_id": null
}
```

For an existing conversation:

```json
{
  "message": "What should I do next?",
  "session_id": "existing-session-id"
}
```

The response contains the structured analysis, generated Markdown response, and session ID.

## Environment Configuration

Create a `.env` file inside the `backend` directory.

Example:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=enterprise_ingestion_firewall
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=your_groq_model
```

Never commit the real `.env` file or API credentials to GitHub.

Use `.env.example` as the safe configuration template.

## Installation

Clone the repository:

```bash
git clone <your-repository-url>
cd enterprise-ingestion-firewall
```

Create and activate the virtual environment:

```bash
uv venv
```

Install dependencies:

```bash
uv sync
```

If using the active virtual environment:

```bash
uv add mysql-connector-python
```

## Database Setup

Create a MySQL database:

```sql
CREATE DATABASE enterprise_ingestion_firewall;
```

Then create the required `conversations` and `messages` tables using the project database schema.

Update the MySQL configuration in `backend/.env`.

## Running the Backend

From the project root:

```bash
uv run uvicorn backend.app.main:app --reload
```

If running from the `backend` directory:

```bash
uvicorn app.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Health check:

```text
http://127.0.0.1:8000/health
```

## Running the Frontend

Open:

```text
frontend/index.html
```

in a browser while the FastAPI backend is running.

The frontend communicates with the backend through:

```text
http://127.0.0.1:8000
```

## Testing

The project includes backend tests using pytest.

Run:

```bash
uv run pytest
```

## Security Notes

- API keys are stored in environment variables.
- Database credentials are stored in `.env`.
- `.env` files are excluded from Git.
- Passwords, OTPs, CVVs, and full card numbers should not be requested from users.
- The application does not claim to perform external actions unless an actual tool or service performs that action.

## Future Improvements

Possible future extensions include:

- Order-status lookup tools
- Refund-status lookup
- Product search
- Customer-support ticket creation
- Tool calling and action execution
- Authentication and user accounts
- Conversation deletion and management
- Production database configuration
- Deployment to a cloud platform

## Project Goal

The goal of this project is to demonstrate how structured LLM outputs, response policies, token optimization, API development, and persistent conversation memory can be combined to build a more controlled AI customer-support system instead of a generic chatbot.