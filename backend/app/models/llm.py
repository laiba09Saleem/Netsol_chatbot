from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import settings

def get_llm():
    """
    Returns the Google Gemini LLM client.
    """
    llm = ChatGoogleGenerativeAI(
        api_key=settings.GEMINI_API_KEY,
        model=settings.GEMINI_MODEL,
        temperature=0.3, 
    )
    return llm