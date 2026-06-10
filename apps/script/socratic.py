from functools import lru_cache
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import APIError, Groq
import logging
import os
from dotenv import load_dotenv

# ------------------------
# load environment
# ------------------------

load_dotenv()

logger = logging.getLogger(__name__)


def get_groq_api_key():
    return os.getenv("GROQ_API_KEY", "").strip().strip("\"'")


@lru_cache(maxsize=1)
def get_groq_client():
    api_key = get_groq_api_key()
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="GROQ_API_KEY is not configured for this deployment",
        )

    return Groq(
        api_key=api_key,
        timeout=12.0,
        max_retries=1,
    )


def create_completion(**kwargs):
    try:
        return get_groq_client().chat.completions.create(**kwargs)
    except HTTPException:
        raise
    except APIError as error:
        logger.exception("Groq request failed")
        raise HTTPException(
            status_code=502,
            detail="AI provider request failed",
        ) from error

# ------------------------
# create app
# ------------------------

app = FastAPI(title="Socratic AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------
# models
# ------------------------

class MessageItem(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):

    topic: str
    history: list[MessageItem]
    message: str
    revealAnswer: bool = False   # important


class ChatResponse(BaseModel):

    reply: str
    isIrrelevant: bool


# ------------------------
# AI logic
# ------------------------

def ask_ai(topic, history, question, reveal):
    # --------------------
    # REVEAL ANSWER MODE
    # --------------------

    if reveal:

        messages = [

            {
                "role": "system",

                "content": f"""
You are expert teacher of {topic}.

Give direct final answer.

Rules:
- Start directly with solution
- Do NOT ask questions
- Do NOT mention Socratic tutor
- Do NOT apologise
- Do NOT mention hints
- Give clear step-by-step answer
"""
            },

            {
                "role": "user",
                "content": question
            }
        ]


    # --------------------
    # NORMAL SOCRATIC MODE
    # --------------------

    else:

        messages = [

            {
                "role": "system",

                "content": f"""
You are Socratic tutor for {topic}.

Rules:
- Ask guiding question
- Give hints only
- Do NOT give final answer
- Keep answer short (3-5 lines)
- If unrelated respond ONLY IRRELEVANT
"""
            }
        ]

        # include previous messages
        for msg in history[-6:]:

            messages.append({

                "role": msg.role,

                "content": msg.content
            })

        messages.append({

            "role": "user",

            "content": question
        })


    # --------------------
    # call groq model
    # --------------------

    completion = create_completion(

        model="llama-3.1-8b-instant",

        messages=messages,

        temperature=0.2

    )

    reply = completion.choices[0].message.content.strip()


    # --------------------
    # irrelevant logic
    # --------------------

    if reveal:

        return reply, False


    if "IRRELEVANT" in reply.upper():

        return "Ask question related to topic.", True


    return reply, False


# ------------------------
# routes
# ------------------------

@app.get("/")
def home():

    return {

        "message": "Socratic AI running"
    }


@app.get("/health")

def health():

    return {

        "status": "ok",
        "groqConfigured": bool(get_groq_api_key()),
    }


@app.post("/chat", response_model=ChatResponse)

def chat(req: ChatRequest):

    reply, irrelevant = ask_ai(

        req.topic,

        req.history,

        req.message,

        req.revealAnswer
    )

    return {

        "reply": reply,

        "isIrrelevant": irrelevant
    }


@app.post("/generate-topic")

def generate_topic(req: dict):
    message = req.get("message", "")

    if not message:

        return {"topic": "New Session"}


    completion = create_completion(

        model="llama-3.1-8b-instant",

        messages=[

            {

                "role": "system",

                "content": "You are a concise summarizer. Summarize the following question/topic into a 2-3 word title. Use title case. No punctuation."

            },

            {

                "role": "user",

                "content": message

            }

        ],

        max_tokens=10,

        temperature=0.3

    )


    topic = completion.choices[0].message.content.strip()

    return {"topic": topic}


# ------------------------
# run server
# ------------------------


if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000
    )
