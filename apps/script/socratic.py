import streamlit as st
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain.schema import Document
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

gemini_api_key = os.getenv("GEMINI_API_KEY")

# ---------------------------
# 🔐 GEMINI API KEY
# ---------------------------
genai.configure(api_key= gemini_api_key)

model = genai.GenerativeModel("gemini-flash-latest")

# ---------------------------
# 🧠 SESSION STATE
# ---------------------------
if "chats" not in st.session_state:
    st.session_state.chats = {}

if "current_chat" not in st.session_state:
    st.session_state.current_chat = None

# ---------------------------
# 📚 GENERATE NOTES
# ---------------------------
def generate_notes(topic):
    prompt = f"""
Create short structured study notes for: {topic}
"""
    res = model.generate_content(prompt)
    return res.text

# ---------------------------
# 🔍 VECTOR STORE
# ---------------------------
def create_vectorstore(text):
    splitter = CharacterTextSplitter(chunk_size=300, chunk_overlap=50)
    chunks = splitter.split_text(text)

    docs = [Document(page_content=c) for c in chunks]
    embeddings = HuggingFaceEmbeddings()

    return FAISS.from_documents(docs, embeddings)

# ---------------------------
# 🧠 SMART SOCRATIC RESPONSE (1 CALL)
# ---------------------------
def get_socratic_response(chat, question):
    docs = chat["vectorstore"].similarity_search(question, k=2)
    context = "\n".join([d.page_content for d in docs])

    history_text = "\n".join(
        [f"{m['role']}: {m['content']}" for m in chat["history"][-3:]]
    )

    prompt = f"""
You are a smart AI tutor 🎓

Step 1:
Check if the question is related to topic: {chat['topic']}

- If NOT related:
    Reply ONLY with:
    IRRELEVANT

- If related:
    Follow rules below 👇

Rules:
- Ask ONLY ONE question ❗
- Keep answer SHORT (2–3 lines)
- Use bullet points
- Use different emojis 🎯✨📘🤔🔥💡🧠🚀
- Do NOT give direct answers

Conversation History:
{history_text}

Context:
{context}

Student:
{question}

Now:
- Give a small hint (optional)
- Ask ONE question only
"""

    res = model.generate_content(prompt)
    return res.text.strip()

# ---------------------------
# 🌐 UI CONFIG
# ---------------------------
st.set_page_config(page_title="Socratic AI Tutor", layout="wide")

st.title("🧠 Socratic AI Tutor")

# ---------------------------
# 📌 SIDEBAR
# ---------------------------
with st.sidebar:
    st.markdown("## 💬 Your Chats")

    if st.button("➕ New Chat", use_container_width=True):
        st.session_state.current_chat = None

    st.markdown("---")

    for chat_name in st.session_state.chats:
        active = chat_name == st.session_state.current_chat
        btn_type = "primary" if active else "secondary"

        if st.button(f"📘 {chat_name}", use_container_width=True, type=btn_type):
            st.session_state.current_chat = chat_name

# ---------------------------
# 📍 NO CHAT SELECTED
# ---------------------------
if st.session_state.current_chat is None:
    st.info("👉 Start a new chat by entering a topic")

    topic = st.text_input("Enter Topic (e.g., Math, Chemistry)")

    if st.button("Start Learning"):
        topic_name = topic.strip().title()

        if topic_name in st.session_state.chats:
            st.warning("⚠️ Chat already exists!")
        else:
            with st.spinner("⚡ Generating knowledge..."):
                notes = generate_notes(topic)

            st.session_state.chats[topic_name] = {
                "topic": topic_name,
                "vectorstore": create_vectorstore(notes),
                "history": []
            }

            st.session_state.current_chat = topic_name
            st.success(f"Started learning: {topic_name}")
            st.rerun()

    st.stop()

# ---------------------------
# 📘 CURRENT CHAT
# ---------------------------
chat = st.session_state.chats[st.session_state.current_chat]

st.markdown(f"### 📘 {chat['topic']}")
st.markdown("---")

# ---------------------------
# 💬 CHAT HISTORY
# ---------------------------
for msg in chat["history"]:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# ---------------------------
# 📝 USER INPUT
# ---------------------------
user_input = st.chat_input("Ask your question...")

if user_input:

    # ✅ Always show user message
    chat["history"].append({
        "role": "user",
        "content": user_input
    })

    # 🤖 ONE API CALL (check + response)
    with st.spinner("🤖 Thinking..."):
        reply = get_socratic_response(chat, user_input)

    # ❗ Handle irrelevant
    if "IRRELEVANT" in reply.upper():
        warning = f"""
⚠️ **Topic mismatch**

You are currently learning **{chat['topic']}**

• Ask related questions 📘  
• Or create a new chat 🔄
"""
        chat["history"].append({
            "role": "assistant",
            "content": warning
        })

        st.rerun()

    # ✅ Normal tutor response
    chat["history"].append({
        "role": "assistant",
        "content": reply
    })

    st.rerun()