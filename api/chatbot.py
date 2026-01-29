import os
from dotenv import load_dotenv
from services.storage import JsonStorageService, SupabaseStorageService
from services.llm import MockLLMService, GeminiLLMService

# Load environment variables
load_dotenv()

MOCK_MODE = os.getenv("MOCK_MODE", "false").lower() == "true"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# --- Service Initialization ---
print(f"DEBUG: Initializing Backend. Mock Mode: {MOCK_MODE}")

if MOCK_MODE:
    storage_service = JsonStorageService()
    llm_service = MockLLMService()
else:
    # Storage Init
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("CRITICAL WARNING: Supabase credentials missing. Falling back to JSON Storage.")
        storage_service = JsonStorageService()
    else:
        try:
            storage_service = SupabaseStorageService(SUPABASE_URL, SUPABASE_KEY)
        except Exception as e:
            print(f"Error initializing Supabase: {e}. Falling back to JSON.")
            storage_service = JsonStorageService()

    # LLM Init
    if not GEMINI_API_KEY:
        print("CRITICAL WARNING: Gemini API Key missing. Falling back to Mock LLM.")
        llm_service = MockLLMService()
    else:
        llm_service = GeminiLLMService(GEMINI_API_KEY)


# --- Core Chatbot Functions ---

def ask_gemini(user_input: str, conversation_id: str = None, mode: str = "University") -> str:
    print(f"DEBUG: ask_gemini called. Mode: {mode}")
    try:
        # 1. Save User Message
        if conversation_id:
            try:
                storage_service.save_message("user", user_input, conversation_id)
            except Exception as e:
                print(f"Error saving user message: {e}")

        # 2. Load History
        history = []
        if conversation_id:
            try:
                history = storage_service.load_chat_history(conversation_id)
            except Exception as e:
                print(f"Error loading history: {e}")
            
        # 3. Generate Response
        try:
            response = llm_service.generate_response(user_input, history, mode)
        except Exception as e:
             response = f"Error generating response: {e}"
             print(response)
        
        # 4. Save Bot Response
        if conversation_id:
            try:
                storage_service.save_message("assistant", response, conversation_id)
            except Exception as e:
                print(f"Error saving bot response: {e}")
            
        return response
    except Exception as e:
        import traceback
        traceback.print_exc()
        return f"CRITICAL BACKEND ERROR: {str(e)}"

def load_chat_history(conversation_id=None):
    return storage_service.load_chat_history(conversation_id)

def reset_chat_history(conversation_id):
    return storage_service.reset_chat_history(conversation_id)

# --- Study Tools ---

def generate_flashcards(topic: str):
    return llm_service.generate_flashcards(topic)

def generate_quiz(topic: str):
    return llm_service.generate_quiz(topic)

def generate_study_note(text: str):
    return llm_service.generate_study_note(text)

# --- Task Management ---

def get_tasks():
    return storage_service.get_tasks()

def create_task(title: str):
    return storage_service.create_task(title)

def update_task(task_id: int, completed: bool):
    return storage_service.update_task(task_id, completed)

def delete_task(task_id: int):
    storage_service.delete_task(task_id)

def delete_completed_tasks():
    storage_service.delete_completed_tasks()

# --- Notes Management ---

def create_note(title: str, content: str, summary: str):
    return storage_service.create_note(title, content, summary)

def get_notes():
    return storage_service.get_notes()

def delete_note(note_id: int):
    storage_service.delete_note(note_id)
