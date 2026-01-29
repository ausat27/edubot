from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from chatbot import ask_gemini, load_chat_history, reset_chat_history, generate_flashcards, generate_quiz
import uuid

app = FastAPI()

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None
    mode: str = "University"

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    history: list

class ResetRequest(BaseModel):
    conversation_id: str

class TopicRequest(BaseModel):
    topic: str

@app.get("/")
async def health_check():
    return {"status": "ok", "message": "Chatbot API is running"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    conversation_id = request.conversation_id
    if not conversation_id:
        conversation_id = str(uuid.uuid4())

    answer = ask_gemini(request.message, conversation_id, request.mode)
    
    # Get updated history
    raw_history = load_chat_history(conversation_id)
    
    # Format history for frontend if needed, or send raw
    # The frontend expects {role: 'user'|'assistant', message: '...'}
    # Supabase returns exactly that structure usually.
    
    return ChatResponse(
        response=answer,
        conversation_id=conversation_id,
        history=raw_history
    )

@app.post("/reset")
async def reset_chat_endpoint(request: ResetRequest):
    # Use the imported function from chatbot.py which handles Supabase/DB reset
    result = reset_chat_history(request.conversation_id)
    return result

# --- Study Tools Endpoints ---

@app.post("/api/flashcards/generate")
async def api_generate_flashcards(request: TopicRequest):
    cards = generate_flashcards(request.topic)
    return cards

@app.post("/api/quiz/generate")
async def api_generate_quiz(request: TopicRequest):
    quiz = generate_quiz(request.topic)
    return quiz


@app.get("/history/{conversation_id}")
async def get_history(conversation_id: str):
    history = load_chat_history(conversation_id)
    return {"history": history}

# --- Task Endpoints ---

from chatbot import get_tasks, create_task, update_task, delete_task, delete_completed_tasks, generate_study_note, supabase

class TaskCreate(BaseModel):
    title: str

class TaskUpdate(BaseModel):
    completed: bool

@app.get("/tasks")
async def read_tasks():
    return get_tasks()

@app.post("/tasks")
async def add_task(task: TaskCreate):
    return create_task(task.title)

@app.put("/tasks/{task_id}")
async def edit_task(task_id: int, task: TaskUpdate):
    return update_task(task_id, task.completed)

@app.delete("/tasks/completed")
async def clear_completed_tasks():
    delete_completed_tasks()
    return {"status": "success"}

@app.delete("/tasks/{task_id}")
async def remove_task(task_id: int):
    delete_task(task_id)
    return {"status": "success"}

# --- Notes & Summarization Endpoints ---

from chatbot import supabase

class NoteCreate(BaseModel):
    title: str
    content: str

class SummarizeRequest(BaseModel):
    text: str

from chatbot import ask_gemini, reset_chat_history, get_tasks, create_task, update_task, delete_task, delete_completed_tasks, generate_flashcards, generate_quiz, generate_study_note, supabase

# ... (Previous code)

@app.post("/api/notes")
async def create_note(note: NoteCreate):
    # Generate a structured study note from the chat transcript
    generated_content = generate_study_note(note.content)
    
    # Create a short preview for the card view
    summary_preview = generated_content[:150].replace("#", "").strip() + "..." if len(generated_content) > 150 else generated_content

    data = {
        "title": note.title,
        "content": generated_content, # Now stores the AI Summary/Note
        "summary": summary_preview    # Stores a short preview
    }
    response = supabase.table("notes").insert(data).execute()
    return response.data[0] if response.data else None

@app.get("/api/notes")
async def get_notes():
    response = supabase.table("notes").select("*").order("created_at", desc=True).execute()
    return response.data

@app.post("/api/notes/summarize")
async def api_summarize_text(request: SummarizeRequest):
    summary = generate_study_note(request.text)
    return {"summary": summary}

@app.delete("/api/notes/{note_id}")
async def delete_note(note_id: int):
    supabase.table("notes").delete().eq("id", note_id).execute()
    return {"status": "success"}

# --- Weekly Planner Endpoints ---

class PlannerEventCreate(BaseModel):
    title: str
    start_time: str
    end_time: str
    type: str = "study"

@app.get("/api/planner")
async def get_planner_events():
    response = supabase.table("planner_events").select("*").order("start_time").execute()
    return response.data

@app.post("/api/planner")
async def create_planner_event(event: PlannerEventCreate):
    data = {
        "title": event.title,
        "start_time": event.start_time,
        "end_time": event.end_time,
        "type": event.type
    }
    response = supabase.table("planner_events").insert(data).execute()
    return response.data[0] if response.data else None

@app.delete("/api/planner/{event_id}")
async def delete_planner_event(event_id: int):
    supabase.table("planner_events").delete().eq("id", event_id).execute()
    return {"status": "success"}


