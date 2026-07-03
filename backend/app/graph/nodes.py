from app.graph.state import ChatState
from app.models.llm import get_llm
from app.models.vectorstore import get_retriever
from langchain_core.messages import SystemMessage

def chatbot_node(state: ChatState) -> ChatState:
    """
    Retrieves context from ChromaDB, formats the system prompt,
    sends history and context to Gemini LLM, and returns the response.
    """
    llm = get_llm()
    retriever = get_retriever()
    
    latest_query = state["messages"][-1].content
    
    docs = retriever.invoke(latest_query)
    context = "\n\n".join([doc.page_content for doc in docs])
    
    system_prompt = (
        "You are NETSOL's professional AI Assistant. Your task is to assist users "
        "by providing accurate information about NETSOL Technologies (such as products like NFS Ascent, "
        "services, partners, careers, and company information) using ONLY the verified context provided below. "
        "If you do not know the answer or if it is not present in the context, politely state that you "
        "do not have that information. Do not invent any facts.\n\n"
        f"--- CONTEXT ---\n{context}\n----------------"
    )
    
    messages_to_send = [SystemMessage(content=system_prompt)] + state["messages"]
    
    response = llm.invoke(messages_to_send)
    
    return {"messages": [response]}