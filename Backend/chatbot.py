
from dotenv import load_dotenv
import google.generativeai as genai
from supabase import create_client, Client
import os
import json

# Load API key
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# This list will store conversation history
chat_history = []

def ask_gemini(user_input: str, conversation_id: str = None, mode: str = "University") -> str:
    print(f"DEBUG: ask_gemini called with input: {user_input}, conversation_id: {conversation_id}, mode: {mode}", flush=True)
    try:
        # Switched to gemini-2.0-flash-lite for better rate limits
        model = genai.GenerativeModel("gemini-2.0-flash-lite")

        # Save user message
        print("DEBUG: Saving user message...", flush=True)
        save_message("user", user_input, conversation_id)
        print("DEBUG: User message saved.", flush=True)

        # Load all chat history from database
        print("DEBUG: Loading chat history...", flush=True)
        chat_history = load_chat_history(conversation_id)
        print(f"DEBUG: Chat history loaded. Count: {len(chat_history)}", flush=True)

        # Build context
        context = "\n".join(f"{msg['role'].capitalize()}: {msg['message']}" for msg in chat_history)

        # Define mode-specific instructions
        mode_instructions = {
            "School": "Explain things simply, using analogies suitable for a school student. Avoid complex jargon.",
            "High School": "Explain with moderate detail, suitable for a high school student. Prepare them for exams.",
            "College": "Explain with academic rigor, suitable for a college student. Focus on concepts and applications.",
            "University": "Explain with deep technical detail, suitable for a university student. Cite theories and advanced concepts.",
            "Researcher": "Provide comprehensive, highly technical responses with references to current research. Assume expert knowledge."
        }
        
        selected_instruction = mode_instructions.get(mode, mode_instructions["University"])

        full_prompt = f"""
        You are a warm, friendly, and encouraging educational assistant and an intelligent AI tutor.
        Current Mode: {mode}
        Instruction: {selected_instruction}

        Continue the conversation naturally, using the previous context.
        Guidelines for your response:
        - Be concise, clear, and educational.
        - Maintain a polite and warm tone.
        - Focus only on what the student asked.
        - After explaining, end by gently asking if the student needs more help.

        Conversation so far:
        {context}
        """

        # Generate response
        print("DEBUG: Generating content with Gemini...", flush=True)
        response = model.generate_content(full_prompt)
        print(f"DEBUG: Gemini response received: {response}", flush=True)
        bot_reply = response.text if hasattr(response, "text") else response.candidates[0].content.parts[0].text
        print(f"DEBUG: Bot reply text: {bot_reply}", flush=True)

        # Save bot reply
        print("DEBUG: Saving bot reply...", flush=True)
        save_message("assistant", bot_reply, conversation_id)
        print("DEBUG: Bot reply saved.", flush=True)

        return bot_reply

    except Exception as e:
        print(f"DEBUG: Exception occurred: {e}", flush=True)
        return f"Error: {str(e)}"

def save_message(role, message, conversation_id=None):
    data = {
        "role": role,
        "message": message
    }
    if conversation_id:
        data["conversation_id"] = conversation_id
        
    supabase.table("chat_history").insert(data).execute()

def load_chat_history(conversation_id=None):
    query = supabase.table("chat_history").select("*").order("timestamp", desc=False)
    if conversation_id:
        query = query.eq("conversation_id", conversation_id)
    response = query.execute()
    return response.data

def reset_chat_history(conversation_id):
    if conversation_id:
        supabase.table("chat_history").delete().eq("conversation_id", conversation_id).execute()
        return {"message": "Chat history reset"} # Return expected dict
    return {"message": "No ID provided"}

# --- Task Management ---

def get_tasks():
    response = supabase.table("tasks").select("*").order("created_at", desc=True).execute()
    return response.data

def create_task(title: str):
    data = {"title": title, "completed": False}
    response = supabase.table("tasks").insert(data).execute()
    return response.data[0] if response.data else None

def update_task(task_id: int, completed: bool):
    response = supabase.table("tasks").update({"completed": completed}).eq("id", task_id).execute()
    return response.data[0] if response.data else None

def delete_task(task_id: int):
    supabase.table("tasks").delete().eq("id", task_id).execute()

def delete_completed_tasks():
    supabase.table("tasks").delete().eq("completed", True).execute()

# --- Study Tools Generation ---

def generate_flashcards(topic: str) -> list[dict]:
    """Generates 5-10 flashcards for a given topic using Gemini."""
    model = genai.GenerativeModel('gemini-2.0-flash-lite')
    prompt = f"""
    Create a set of 5 to 10 educational flashcards about "{topic}".
    Return ONLY a raw JSON array of objects. No markdown formatting.
    Each object must have:
    - "front": The question or concept (string).
    - "back": The answer or definition (string).

    Example output:
    [
        {{"front": "What is Mitochondria?", "back": "Powerhouse of the cell"}},
        {{"front": "Define Osmosis", "back": "Movement of water..."}}
    ]
    """
    try:
        response = model.generate_content(prompt)
        # Clean potential markdown code blocks
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        flashcards = json.loads(clean_text)
        return flashcards
    except Exception as e:
        print(f"Error generating flashcards: {e}")
        return []

def generate_quiz(topic: str) -> dict:
    """Generates a flexible multiple-choice quiz for a topic."""
    model = genai.GenerativeModel('gemini-2.0-flash-lite')
    prompt = f"""
    Create a 5-question multiple choice quiz about "{topic}".
    Return ONLY a raw JSON object. No markdown.
    Structure:
    {{
        "title": "Quiz Title",
        "questions": [
            {{
                "id": 1,
                "question": "Question text?",
                "options": ["A", "B", "C", "D"],
                "correct_answer": "Correct Option Text" 
            }}
        ]
    }}
    """
    try:
        response = model.generate_content(prompt)
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        quiz = json.loads(clean_text)
        return quiz
    except Exception as e:
        print(f"Error generating quiz: {e}")
        return {"title": "Error", "questions": []}

def generate_study_note(text: str) -> str:
    """Generates a structured, markdown-formatted study note from a chat log."""
    model = genai.GenerativeModel('gemini-2.0-flash-lite')
    prompt = f"""
    You are an expert student aid. Convert the following chat transcript into a comprehensive, well-structured study note (Markdown).
    
    Guidelines:
    - **Filter out small talk**: Ignore greetings ("hello", "thanks") and focus purely on the educational content.
    - **Structure**: Use H2 headers (##) for main topics.
    - **Key Concepts**: Define important terms clearly.
    - **Bullets**: Use bullet points for readability.
    - **Tone**: Professional, concise, and academic.
    
    Transcript:
    {text}
    """
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error generating study note: {e}")
        return "Could not generate study note from this session."
