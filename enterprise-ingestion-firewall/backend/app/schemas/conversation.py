from typing import Optional

from pydantic import BaseModel, Field


class ConversationRequest(BaseModel):
    message: str = Field(min_length=1, max_length=5000)
    session_id: Optional[str] = None