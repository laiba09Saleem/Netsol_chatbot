from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import List
from langchain_core.messages import HumanMessage, AIMessage

from app.schemas.chat import (
    ChatRequest, 
    SessionResponse, 
    MessageResponse, 
    SessionCreate
)
from app.graph.workflow import chat_graph
from app.models.llm import get_llm
from app.models.supabase_client import get_supabase_client

router = APIRouter()

@router.post("/chat/sessions", response_model=SessionResponse)
def create_session(request: SessionCreate):
    try:
        supabase = get_supabase_client()
        response = supabase.table("conversations").insert({
            "title": request.title
        }).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create session")
            
        row = response.data[0]
        return SessionResponse(
            id=row["id"],
            title=row["title"],
            created_at=str(row["created_at"])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/sessions", response_model=List[SessionResponse])
def get_sessions():
    try:
        supabase = get_supabase_client()
        response = supabase.table("conversations").select("*").order("created_at", desc=True).execute()
        
        sessions = []
        for row in response.data:
            sessions.append(SessionResponse(
                id=row["id"],
                title=row["title"],
                created_at=str(row["created_at"])
            ))
        return sessions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/sessions/{session_id}/messages", response_model=List[MessageResponse])
def get_session_messages(session_id: str):
    try:
        supabase = get_supabase_client()
        response = supabase.table("messages").select("*").eq("conversation_id", session_id).order("created_at", desc=False).execute()
        
        messages = []
        for row in response.data:
            messages.append(MessageResponse(
                id=row["id"],
                conversation_id=row["conversation_id"],
                sender=row["sender"],
                text=row["text"],
                created_at=str(row["created_at"])
            ))
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/chat/sessions/{session_id}")
def delete_session(session_id: str):
    try:
        supabase = get_supabase_client()
        supabase.table("conversations").delete().eq("id", session_id).execute()
        return {"status": "success", "message": "Session deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        supabase = get_supabase_client()
        llm = get_llm()
        
        history_response = supabase.table("messages").select("*").eq("conversation_id", request.session_id).order("created_at", desc=False).execute()
        
        messages = []
        for row in history_response.data:
            if row["sender"] == "user":
                messages.append(HumanMessage(content=row["text"]))
            elif row["sender"] == "bot":
                messages.append(AIMessage(content=row["text"]))
        
        messages.append(HumanMessage(content=request.message))
        
        from app.models.vectorstore import get_retriever
        from langchain_core.messages import SystemMessage
        
        retriever = get_retriever()
        docs = retriever.invoke(request.message)
        context = "\n\n".join([doc.page_content for doc in docs])
        system_prompt = (
            "You are NETSOL's professional AI Assistant. Your task is to assist users "
            "by providing accurate, very brief, and concise information about NETSOL Technologies "
            "using ONLY the verified context provided below. "
            "CRITICAL RULES: "
            "1. Keep your answers strictly to 1 or 2 sentences maximum. "
            "2. If asked about non-NETSOL topics (like SQL, general coding, etc.), simply reply: 'I apologize, I am programmed to answer questions related to NETSOL Technologies only.' "
            "3. If asked about medical, personal, or ethical issues, reply: 'I cannot provide medical or ethical advice. Please consult a professional.' "
            "4. If the answer is not in the context, politely state: 'I do not have that information.'\n\n"
            f"--- CONTEXT ---\n{context}\n----------------"
        )
        
        messages_to_send = [SystemMessage(content=system_prompt)] + messages

        async def event_generator():
            full_reply = ""
            async for chunk in llm.astream(messages_to_send):
                token = chunk.content
                full_reply += token
                yield token
            
            supabase.table("messages").insert({
                "conversation_id": request.session_id,
                "sender": "user",
                "text": request.message
            }).execute()
            
            supabase.table("messages").insert({
                "conversation_id": request.session_id,
                "sender": "bot",
                "text": full_reply
            }).execute()
            
            if len(history_response.data) == 0:
                short_title = request.message[:25] + "..." if len(request.message) > 25 else request.message
                supabase.table("conversations").update({"title": short_title}).eq("id", request.session_id).execute()

        return StreamingResponse(event_generator(), media_type="text/plain")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))