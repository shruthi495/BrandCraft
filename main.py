from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
import os

# Load environment variables from .env file (must be in the same folder as this file)
load_dotenv()

# ── Debug prints – remove these later once everything works ──────────────────
print("=== GROQ API KEY DEBUG ===")
print("Current working directory   :", os.getcwd())
print("GROQ_API_KEY from env       :", os.getenv("GROQ_API_KEY"))
print("Any env vars with GROQ      :", [k for k in os.environ if "GROQ" in k.upper()])
print("=== DEBUG END ===\n")

# Initialize Groq client
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError("GROQ_API_KEY not found. Check that .env exists and contains GROQ_API_KEY=your-key-here")

client = Groq(api_key=api_key)

app = FastAPI(title="BrandCraft Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    text: str
    feature: str | None = None
    answers: dict | None = None
    session_id: str | None = None

@app.post("/api/chat")
async def chat(msg: ChatMessage):
    if not msg.text.strip():
        raise HTTPException(400, "Message cannot be empty")

    # Basic system prompt — you can customize this heavily later
    system_prompt = "You are BrandCraft AI — a helpful, creative brand & content assistant. Be detailed, fun, professional, and always provide high-quality suggestions."

    user_content = msg.text

    if msg.feature and msg.answers:
        # Guided flow finished → generate final creative output
        user_content = f"""
Feature requested: {msg.feature.replace('-', ' ').title()}

User provided answers:
{chr(10).join([f"- {k}: {v}" for k, v in msg.answers.items()])}

Now generate excellent, creative results.
Offer multiple strong options when appropriate.
Use clear markdown formatting (bold, lists, etc.).
Be inspiring and professional.
"""

    try:
        completion = client.chat.completions.create(
    model="llama-3.3-70b-versatile",  # ← changed to current supported model
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user",   "content": user_content},
    ],
    temperature=0.75,
    max_tokens=1400,
)

        reply = completion.choices[0].message.content.strip()

        return {
            "reply": reply,
            "done": bool(msg.answers)  # true if this was the end of guided questions
        }

    except Exception as e:
        error_msg = str(e)
        print("Groq API error:", error_msg)  # log to terminal
        raise HTTPException(500, f"LLM error: {error_msg}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)