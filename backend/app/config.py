import os 
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GEMINI_API_KEY: str = os.getenv('GEMINI_API_KEY')
    GEMINI_MODEL: str = "gemini-2.5-flash"  # standard fast model for chat
    EMBEDDING_MODEL: str = "models/gemini-embedding-2"  # your scraper embedding model
    
    CHROMA_DB_PATH: str = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
        "backend", 
        "netsol_db"
    )
    
    SUPABASE_URL: str = os.getenv('SUPABASE_URL')
    SUPABASE_KEY: str = os.getenv('SUPABASE_KEY')

settings = Settings()