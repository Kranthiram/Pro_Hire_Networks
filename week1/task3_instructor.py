import os
from pydantic import BaseModel, Field
from groq import Groq
from dotenv import load_dotenv
import instructor

load_dotenv()
class UserProfile(BaseModel):
    name : str = Field(min_length=2)
    age : int = Field(ge=18, le=100)
    email : str
    pan : str

my_api_key = os.getenv("GROQ_API_KEY")
if not my_api_key:
    raise ValueError("API key not found")

groq_client = Groq(api_key = my_api_key)

client = instructor.from_groq(groq_client, mode = instructor.Mode.JSON)

user = client.chat.completions.create(
    model = "openai/gpt-oss-120b",
    response_model = UserProfile,
    messages = [{
        "role":"user",
        "content": """
            Create a user profile for Kranthi
            his age is 22 and email address is ak@gmail.com and 
            his PAN id number is AKILU1437K
            """
        }
    ])

print(user)
print(type(user))


