from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ChatRequest(BaseModel):
    message: str
    session_id: str  

class ChatResponse(BaseModel):
    reply: str

class SessionResponse(BaseModel):
    id: str
    title: str
    created_at: str

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender: str
    text: str
    created_at: str

class SessionCreate(BaseModel):
    title: str