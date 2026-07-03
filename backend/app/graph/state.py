from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage

class ChatState(TypedDict):
    """
    Shared state of the LangGraph workflow.
    Every node can read and update this state.
    """
    messages: Annotated[list[BaseMessage], add_messages]