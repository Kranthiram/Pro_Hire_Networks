from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from app.schemas.assistant import AssistantResult
from app.schemas.conversation import ConversationRequest

from app.services.llm_service import analyze_message
from app.services.response_service import generate_response
from app.services.database_service import (
    create_conversation,
    get_history,
    save_message,
)

from app.utils.token_counter import estimate_tokens


app = FastAPI(
    title="Enterprise Structured Ingestion Firewall",
    description="Classifies user messages and validates structured AI output.",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "message": "Ingestion Firewall API is running"
    }


@app.post("/api/analyze", response_model=AssistantResult)
def analyze(request: ConversationRequest):
    message = request.message.strip()

    if not message:
        raise HTTPException(
            status_code=422,
            detail="Message cannot be empty."
        )

    # Create a new conversation if session_id is not provided.
    if request.session_id:
        session_id = request.session_id
    else:
        session_id = create_conversation()

    try:
        # Step 1: Retrieve previous conversation history
        history = get_history(session_id)

        print("Session ID:", session_id)
        print("Conversation history:", history)

        # Week 1: Detect user intent
        result = analyze_message(message)

        # Add local token estimate
        result.token_metadata.estimated_input_tokens = estimate_tokens(message)

        # Week 2 + Week 3:
        # Generate response using previous conversation history
        response_markdown = generate_response(
            result,
            history,
        )

        # Save current user message
        save_message(
            session_id,
            "user",
            message,
        )

        # Save assistant response
        save_message(
            session_id,
            "assistant",
            response_markdown,
        )

        # Return the session_id to the frontend
        return AssistantResult(
            **result.model_dump(),
            response_markdown=response_markdown,
            session_id=session_id,
        )

    except ValidationError as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "error": "The model response did not pass schema validation.",
                "validation_errors": exc.errors(),
            },
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=(
                "LLM request failed. Check the API key, model name, "
                "network, and provider limits."
            ),
        ) from exc