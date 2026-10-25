from pydantic import Field

from app.schemas.ingestion import IngestionResult


class AssistantResult(IngestionResult):
    response_markdown: str = Field(
        min_length=1,
        description="LLM-generated answer formatted as Markdown",
    )

    session_id: str = Field(
        min_length=1,
        description="Unique identifier for the conversation session",
    )