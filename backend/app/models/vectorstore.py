import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma
from app.config import settings

def get_retriever():
    """
    Initializes Chroma DB and returns a retriever interface.
    """
    embeddings = GoogleGenerativeAIEmbeddings(
        model=settings.EMBEDDING_MODEL,
        google_api_key=settings.GEMINI_API_KEY
    )
    
    # ChromaDB ko local path se load karna
    vector_store = Chroma(
        persist_directory=settings.CHROMA_DB_PATH,
        embedding_function=embeddings
    )
    
    # database se top 3 relevant parts (k=3) match karne ke liye retriever return karna
    return vector_store.as_retriever(search_kwargs={"k": 3})