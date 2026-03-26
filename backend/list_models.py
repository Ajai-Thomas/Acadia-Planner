import os
from google import genai
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "backend", ".env")) # Wait, the .env is in backend. My script runs in backend.
# Actually let's just use load_dotenv('.env') since we run from backend
load_dotenv('.env')

client = genai.Client()
for m in client.models.list():
    print(m.name)
