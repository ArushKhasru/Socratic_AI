from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import os
import re
import time
from dotenv import load_dotenv

load_dotenv()

groq_api_key = (
    os.getenv("GROQ_API_KEY")
    or os.getenv("groq_api")
    or os.getenv("GROQ_API")
)
groq_model_name = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant").strip()

if not groq_api_key:
    raise RuntimeError("GROQ_API_KEY is missing. Add it to apps/script/.env before starting the service.")

client = Groq(api_key=groq_api_key)

app = FastAPI(title="Socratic AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MessageItem(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    topic: str
    history: list[MessageItem]
    message: str


class ChatResponse(BaseModel):
    reply: str
    isIrrelevant: bool


def format_provider_error(exc: Exception) -> str:
    error_text = str(exc).strip() or exc.__class__.__name__
    lowered = error_text.lower()

    if "429" in lowered or "quota" in lowered or "rate limit" in lowered:
        retry_match = re.search(r"retry (?:after|in) ([0-9]+)s?", error_text, re.IGNORECASE)
        retry_suffix = f" Please retry in about {retry_match.group(1)} seconds." if retry_match else ""
        return f"Groq quota or rate limit exceeded for model '{groq_model_name}'.{retry_suffix}"

    if "401" in lowered or "403" in lowered or "api key" in lowered or "permission" in lowered:
        return f"Groq API key or permissions failed for model '{groq_model_name}'."

    if "503" in lowered or "timeout" in lowered or "unavailable" in lowered or "connection" in lowered:
        return f"Groq network or service issue for model '{groq_model_name}'."

    return f"Groq request failed for model '{groq_model_name}'. {error_text}"


def build_fallback_reply(topic: str, question: str) -> str:
    cleaned_question = question.strip().rstrip("?.!")
    return (
        f"I am temporarily out of live provider quota for {topic}, so let's keep going in a lighter mode.\n\n"
        f"For your question about \"{cleaned_question}\", what do you already know about it?\n"
        f"Try answering these two prompts:\n"
        f"1. What is the main idea or definition in your own words?\n"
        f"2. Can you think of one real example from {topic} where it shows up?\n\n"
        f"Reply with your attempt and I will guide you from there."
    )


def get_socratic_response(topic: str, history: list[MessageItem], question: str) -> tuple[str, bool]:
    messages = [
        {
            "role": "system",
            "content": (
                f"You are a Socratic AI tutor specializing in {topic}. "
                "Never give the final answer directly. Ask 1-2 guiding questions, "
                "give short hints, adapt to the student's replies, keep responses short "
                "(3-5 lines max), and if the user's question is unrelated to the topic, "
                "respond with exactly IRRELEVANT."
            ),
        }
    ]

    for message in history[-6:]:
        if message.role in {"user", "assistant"}:
            messages.append({"role": message.role, "content": message.content})

    messages.append({"role": "user", "content": question})

    for attempt in range(3):
        try:
            completion = client.chat.completions.create(
                model=groq_model_name,
                messages=messages,
                temperature=0.7,
                max_tokens=220,
            )
            reply = (completion.choices[0].message.content or "").strip()
            break
        except Exception as exc:
            formatted_error = format_provider_error(exc)
            if "quota or rate limit exceeded" in formatted_error.lower():
                return build_fallback_reply(topic, question), False
            if attempt < 2:
                time.sleep(1.5 * (attempt + 1))
            else:
                raise RuntimeError(formatted_error) from exc

    if not reply:
        raise RuntimeError(
            f"Groq returned an empty response for model '{groq_model_name}'."
        )

    if "IRRELEVANT" in reply.upper() and len(reply) < 50:
        return (
            f"That question does not seem related to {topic}. "
            f"Please ask something connected to {topic}.",
            True,
        )

    return reply, False


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "socratic-ai",
        "provider": "groq",
        "configuredModel": groq_model_name,
    }


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    try:
        reply, is_irrelevant = get_socratic_response(req.topic, req.history, req.message)
    except RuntimeError as exc:
        detail = str(exc)
        status_code = 429 if "quota or rate limit exceeded" in detail.lower() else 503
        raise HTTPException(status_code=status_code, detail=detail) from exc

    return ChatResponse(reply=reply, isIrrelevant=is_irrelevant)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
