from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import os
from dotenv import load_dotenv
import uvicorn

# ------------------------
# load environment
# ------------------------

load_dotenv()

groq_api_key = os.getenv("groq_api")

if not groq_api_key:
    raise ValueError("Please add GROQ API key in .env file")

client = Groq(api_key=groq_api_key)

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

    completion = client.chat.completions.create(

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

        "status": "ok"
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


    completion = client.chat.completions.create(

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