import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

my_api_key = os.getenv("GROQ_API_KEY")
if not my_api_key:
    raise ValueError("Api key not found")

client = Groq(api_key = my_api_key)
model = "openai/gpt-oss-120b"

response = client.chat.completions.create(
    model = model,
    messages = [
        {
        "role" : "user",
        "content":"Explain RAG in one sentence"
    }
    ]
)
print(response.choices[0].message.content)