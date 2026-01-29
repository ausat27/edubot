from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import os
import json
from datetime import datetime
from supabase import create_client, Client

class StorageInterface(ABC):
    @abstractmethod
    def save_message(self, role: str, message: str, conversation_id: str):
        pass

    @abstractmethod
    def load_chat_history(self, conversation_id: str) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def reset_chat_history(self, conversation_id: str):
        pass

    @abstractmethod
    def get_tasks(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def create_task(self, title: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    def update_task(self, task_id: int, completed: bool) -> Dict[str, Any]:
        pass

    @abstractmethod
    def delete_task(self, task_id: int):
        pass

    @abstractmethod
    def delete_completed_tasks(self):
        pass
    
    @abstractmethod
    def create_note(self, title: str, content: str, summary: str) -> Dict[str, Any]:
        pass
        
    @abstractmethod
    def get_notes(self) -> List[Dict[str, Any]]:
        pass
        
    @abstractmethod
    def delete_note(self, note_id: int):
        pass

class JsonStorageService(StorageInterface):
    def __init__(self, file_path="local_data.json"):
        # On Vercel (or any read-only FS), we can only write to /tmp
        # Check if we are in a serverless environment (often indicated by AWS_LAMBDA_FUNCTION_NAME or VERCEL)
        if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
            self.file_path = f"/tmp/{file_path}"
        else:
            self.file_path = file_path
            
        self._load_data()

    def _load_data(self):
        if not os.path.exists(self.file_path):
            self.data = {"chat_history": [], "tasks": [], "notes": []}
            self._save_data()
        else:
            try:
                with open(self.file_path, "r") as f:
                    self.data = json.load(f)
            except json.JSONDecodeError:
                self.data = {"chat_history": [], "tasks": [], "notes": []}

    def _save_data(self):
        with open(self.file_path, "w") as f:
            json.dump(self.data, f, indent=4)

    def save_message(self, role: str, message: str, conversation_id: str):
        self.data["chat_history"].append({
            "role": role,
            "message": message,
            "conversation_id": conversation_id,
            "timestamp": datetime.now().isoformat()
        })
        self._save_data()

    def load_chat_history(self, conversation_id: str) -> List[Dict[str, Any]]:
        return [msg for msg in self.data["chat_history"] if msg.get("conversation_id") == conversation_id]

    def reset_chat_history(self, conversation_id: str):
        self.data["chat_history"] = [msg for msg in self.data["chat_history"] if msg.get("conversation_id") != conversation_id]
        self._save_data()
        return {"message": "Chat history reset"}

    def get_tasks(self) -> List[Dict[str, Any]]:
        return sorted(self.data["tasks"], key=lambda x: x.get("created_at", ""), reverse=True)

    def create_task(self, title: str) -> Dict[str, Any]:
        current_ids = [t["id"] for t in self.data["tasks"]]
        new_id = max(current_ids) + 1 if current_ids else 1
        new_task = {
            "id": new_id,
            "title": title,
            "completed": False,
            "created_at": datetime.now().isoformat()
        }
        self.data["tasks"].append(new_task)
        self._save_data()
        return new_task

    def update_task(self, task_id: int, completed: bool) -> Dict[str, Any]:
        for task in self.data["tasks"]:
            if task["id"] == task_id:
                task["completed"] = completed
                self._save_data()
                return task
        return None

    def delete_task(self, task_id: int):
        self.data["tasks"] = [t for t in self.data["tasks"] if t["id"] != task_id]
        self._save_data()

    def delete_completed_tasks(self):
        self.data["tasks"] = [t for t in self.data["tasks"] if not t["completed"]]
        self._save_data()

    def create_note(self, title: str, content: str, summary: str) -> Dict[str, Any]:
        current_ids = [n["id"] for n in self.data["notes"]]
        new_id = max(current_ids) + 1 if current_ids else 1
        new_note = {
             "id": new_id,
             "title": title,
             "content": content,
             "summary": summary,
             "created_at": datetime.now().isoformat()
        }
        self.data["notes"].append(new_note)
        self._save_data()
        return new_note

    def get_notes(self) -> List[Dict[str, Any]]:
        return sorted(self.data["notes"], key=lambda x: x.get("created_at", ""), reverse=True)

    def delete_note(self, note_id: int):
        self.data["notes"] = [n for n in self.data["notes"] if n["id"] != note_id]
        self._save_data()


class SupabaseStorageService(StorageInterface):
    def __init__(self, url: str, key: str):
        self.client: Client = create_client(url, key)

    def save_message(self, role: str, message: str, conversation_id: str):
        data = {
            "role": role,
            "message": message,
            "conversation_id": conversation_id
        }
        self.client.table("chat_history").insert(data).execute()

    def load_chat_history(self, conversation_id: str) -> List[Dict[str, Any]]:
        query = self.client.table("chat_history").select("*").order("timestamp", desc=False)
        if conversation_id:
            query = query.eq("conversation_id", conversation_id)
        response = query.execute()
        return response.data

    def reset_chat_history(self, conversation_id: str):
        if conversation_id:
            self.client.table("chat_history").delete().eq("conversation_id", conversation_id).execute()
        return {"message": "Chat history reset"}

    def get_tasks(self) -> List[Dict[str, Any]]:
        response = self.client.table("tasks").select("*").order("created_at", desc=True).execute()
        return response.data

    def create_task(self, title: str) -> Dict[str, Any]:
        data = {"title": title, "completed": False}
        response = self.client.table("tasks").insert(data).execute()
        return response.data[0] if response.data else None

    def update_task(self, task_id: int, completed: bool) -> Dict[str, Any]:
        response = self.client.table("tasks").update({"completed": completed}).eq("id", task_id).execute()
        return response.data[0] if response.data else None

    def delete_task(self, task_id: int):
        self.client.table("tasks").delete().eq("id", task_id).execute()

    def delete_completed_tasks(self):
        self.client.table("tasks").delete().eq("completed", True).execute()
    
    def create_note(self, title: str, content: str, summary: str) -> Dict[str, Any]:
        data = {
            "title": title,
            "content": content,
            "summary": summary
        }
        response = self.client.table("notes").insert(data).execute()
        return response.data[0] if response.data else None

    def get_notes(self) -> List[Dict[str, Any]]:
        response = self.client.table("notes").select("*").order("created_at", desc=True).execute()
        return response.data
    
    def delete_note(self, note_id: int):
        self.client.table("notes").delete().eq("id", note_id).execute()
