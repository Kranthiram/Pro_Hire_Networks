import json

from groq import Groq

from app.config import GROQ_API_KEY, GROQ_MODEL
from app.schemas.ingestion import IngestionResult


RESPONSE_SYSTEM_PROMPT = """
You are a virtual customer-support assistant for an e-commerce company.

Your primary purpose is to help customers with:
- products
- orders
- payments
- refunds
- billing
- delivery
- customer support

The incoming message has already been classified by another AI layer.
Use the supplied intent, risk profile, priority, and action requirement
to decide how detailed the response should be.

Rules:
- Keep responses concise and directly useful.
- Do not behave like a general-purpose chatbot.
- For unrelated general questions, briefly explain that you are focused
  on customer-support topics and redirect the user.
- For simple questions, answer in 1-3 short sentences.
- For normal support issues, use a few short bullet points when useful.
- For payment, refund, or other important issues, provide only the
  necessary safe next steps.
- Never claim that you performed an external action unless a tool actually
  performed that action.
- Never ask for passwords, OTPs, or full card numbers.
- Do not repeat information unnecessarily.
- Return only the final Markdown answer.
""".strip()


def get_response_policy(intent_result: IngestionResult) -> dict:
    """
    Decide the response policy using the structured intent analysis.
    """

    intent = intent_result.intent
    risk = intent_result.risk_profile
    priority = intent_result.priority
    requires_action = intent_result.requires_action

    
    max_tokens = 150

    if intent in {
        "payment_issue",
        "refund_request",
        "order_issue",
        "delivery_issue",
    }:
        max_tokens = 350

    if risk in {"medium", "high"}:
        max_tokens += 50

    if priority in {"medium", "high"}:
        max_tokens += 50

    if requires_action:
        max_tokens += 50

    
    max_tokens = min(max_tokens, 500)

    return {
        "max_tokens": max_tokens,
        "intent": intent,
        "risk_profile": risk,
        "priority": priority,
        "requires_action": requires_action,
    }


def generate_response(
    intent_result: IngestionResult,
    history: list[dict] | None = None,
) -> str:

    if not GROQ_API_KEY:
        raise RuntimeError(
            "GROQ_API_KEY is missing. Add it to backend/.env before using the LLM."
        )

    if history is None:
        history = []

    intent_context = {
        "intent": intent_result.intent,
        "summary": intent_result.summary,
        "risk_profile": intent_result.risk_profile,
        "priority": intent_result.priority,
        "requires_action": intent_result.requires_action,
    }

    # Decide response budget from structured analysis
    response_policy = get_response_policy(intent_result)

    client = Groq(api_key=GROQ_API_KEY)

    messages = [
        {
            "role": "system",
            "content": RESPONSE_SYSTEM_PROMPT,
        }
    ]

    # Add previous conversation history
    for message in history:
        messages.append(
            {
                "role": message["role"],
                "content": message["content"],
            }
        )

    # Add current classified request
    messages.append(
        {
            "role": "user",
            "content": (
                "Generate the final customer-support response using "
                "the following structured analysis and response policy.\n\n"
                f"Intent analysis:\n"
                f"{json.dumps(intent_context, ensure_ascii=False)}\n\n"
                f"Response policy:\n"
                f"{json.dumps(response_policy, ensure_ascii=False)}"
            ),
        }
    )

    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        temperature=0.3,
        max_tokens=response_policy["max_tokens"],
        messages=messages,
    )

    answer = completion.choices[0].message.content

    if not answer or not answer.strip():
        raise ValueError("The LLM returned an empty response")

    return answer.strip()