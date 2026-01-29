from abc import ABC, abstractmethod
from typing import List, Dict, Any
import google.generativeai as genai
import json

class LLMInterface(ABC):
    @abstractmethod
    def generate_response(self, prompt: str, history: List[Dict[str, Any]] = None, mode: str = "University") -> str:
        pass

    @abstractmethod
    def generate_flashcards(self, topic: str) -> List[dict]:
        pass

    @abstractmethod
    def generate_quiz(self, topic: str) -> dict:
        pass
    
    @abstractmethod
    def generate_study_note(self, text: str) -> str:
        pass

class MockLLMService(LLMInterface):
    def generate_response(self, prompt: str, history: List[Dict[str, Any]] = None, mode: str = "University") -> str:
        return f"[MOCK MODE: {mode}] This is a simulated response for: {prompt[:50]}..."

    def generate_flashcards(self, topic: str) -> List[dict]:
        return [
            {"front": f"Mock Question 1 about {topic}", "back": "Mock Answer 1"},
            {"front": f"Mock Question 2 about {topic}", "back": "Mock Answer 2"},
            {"front": f"Mock Question 3 about {topic}", "back": "Mock Answer 3"}
        ]

    def generate_quiz(self, topic: str) -> dict:
         return {
            "title": f"Mock Quiz: {topic}",
            "questions": [
                {
                    "id": 1,
                    "question": f"What is a mock question about {topic}?",
                    "options": ["A", "B", "C", "D"],
                    "correct_answer": "A"
                },
                   {
                    "id": 2,
                    "question": f"Another mock question about {topic}?",
                    "options": ["X", "Y", "Z", "Q"],
                    "correct_answer": "X"
                }
            ]
        }
    
    def generate_study_note(self, text: str) -> str:
        return f"# Mock Study Note\n\n## Summary\nThis is a mock summary of the following text:\n\n> {text[:100]}...\n\n- Key Point 1\n- Key Point 2"

class GeminiLLMService(LLMInterface):
    def __init__(self, api_key: str, model_name: str = "gemini-2.0-flash-lite"):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model_name)

    def generate_response(self, prompt: str, history: List[Dict[str, Any]] = None, mode: str = "University") -> str:
        # Reconstruct full context from history if provided
        context = ""
        if history:
             context = "\n".join(f"{msg['role'].capitalize()}: {msg['message']}" for msg in history)
        
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
        
        User: {prompt}
        """
        
        try:
            response = self.model.generate_content(full_prompt)
            # Handle potential block/safety ratings or empty responses
            if hasattr(response, "text"):
                 return response.text
            elif response.candidates:
                 return response.candidates[0].content.parts[0].text
            else:
                 return "I'm sorry, I couldn't generate a response."
        except Exception as e:
            return f"Error communicating with Gemini: {e}"

    def generate_flashcards(self, topic: str) -> List[dict]:
        prompt = f"""
        Create a set of 5 to 10 educational flashcards about "{topic}".
        Return ONLY a raw JSON array of objects. No markdown formatting.
        Each object must have:
        - "front": The question or concept (string).
        - "back": The answer or definition (string).
        """
        try:
            response = self.model.generate_content(prompt)
            clean_text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_text)
        except Exception as e:
            print(f"Error generating flashcards: {e}")
            return []

    def generate_quiz(self, topic: str) -> dict:
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
            response = self.model.generate_content(prompt)
            clean_text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_text)
        except Exception as e:
             print(f"Error generating quiz: {e}")
             return {"title": "Error", "questions": []}

    def generate_study_note(self, text: str) -> str:
        prompt = f"""
        You are an expert student aid. Convert the following chat transcript into a comprehensive, well-structured study note (Markdown).
        
        Guidelines:
        - **Filter out small talk**: Ignore greetings and focus purely on educational content.
        - **Structure**: Use H2 headers (##) for main topics.
        - **Key Concepts**: Define important terms clearly.
        - **Bullets**: Use bullet points for readability.
        - **Tone**: Professional, concise, and academic.
        
        Transcript:
        {text}
        """
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error generating study note: {e}")
            return "Could not generate study note."
