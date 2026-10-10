# Enterprise Structured Ingestion Firewall

A production-style AI ingestion layer built with FastAPI, Groq, Instructor, and Pydantic.

The application accepts unstructured user messages, classifies them using an LLM, validates the AI-generated response against a strict Pydantic schema, and returns structured JSON for downstream applications.

## Project Overview

AI applications can produce unpredictable text responses.

This project solves that problem by placing a validation layer between the user's input and downstream systems.

The system converts an unstructured user message into structured data containing:

- Intent
- Risk Profile
- Priority
- Action Requirement
- Summary
- Token Metadata

The AI-generated response is validated using Pydantic before it is returned to the client.

## Architecture

```text
User
  |
  v
Frontend
  |
  | POST /api/analyze
  v
FastAPI
  |
  v
IngestionRequest
  |
  | Input Validation
  v
LLM Service
  |
  +--> Groq
  |
  +--> Instructor
  |
  v
IngestionResult
  |
  | Pydantic Validation
  v
Token Estimation
  |
  v
Validated JSON
  |
  v
Frontend / Downstream Application

