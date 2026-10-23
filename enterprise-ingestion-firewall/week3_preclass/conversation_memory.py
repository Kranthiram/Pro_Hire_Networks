from uuid import uuid4
from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is missing from .env")
client = Groq(api_key=GROQ_API_KEY)


chat_sessions = {}

def create_session():
    session_id = str(uuid4())
    chat_sessions[session_id] = []
    return session_id

def add_message(session_id, role, content):
    chat_sessions[session_id].append(
        {
            "role": role,
            "content": content,
        }
    )


def get_history(session_id):
    return chat_sessions.get(session_id, [])


# Task 3: Send history to Groq
def generate_response(session_id, user_message):
   
    add_message(session_id, "user", user_message)
    messages = [
        {
            "role": "system",
            "content": (
                "You are a helpful customer-support assistant. "
                "Use the conversation history to understand follow-up "
                "questions. Do not invent facts."
            ),
        }
    ]

    messages.extend(get_history(session_id))

    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=messages,
        temperature=0.2,
    )
    assistant_response = completion.choices[0].message.content

    add_message(session_id,"assistant",assistant_response,)
    return assistant_response


# Task 1 & Task 2
session_a = create_session()
session_b = create_session()

print("Session A:", session_a)
print("Session B:", session_b)
print("Are sessions different?", session_a != session_b)


# Task 3: Context-aware conversation
print("\n========== SESSION A ==========")

response_1 = generate_response(
    session_a,
    "My payment was deducted twice."
)
print("\nUser: My payment was deducted twice.")
print("AI:", response_1)

response_2 = generate_response(
    session_a,
    "What should I do?"
)
print("\nUser: What should I do?")
print("AI:", response_2)


# Display Session A history
print("\n--- Session A History ---")
for message in get_history(session_a):
    print(message)
