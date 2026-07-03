from langgraph.graph import StateGraph, START, END
from app.graph.state import ChatState
from app.graph.nodes import chatbot_node

def build_graph():
    """
    Builds the LangGraph workflow.
    Currently it contains only one node (chatbot_node),
    but more nodes and conditional edges can be added later.
    """
    
    graph_builder = StateGraph(ChatState)
    
    # Register the node
    graph_builder.add_node("chatbot", chatbot_node)
    
    # Define the workflow: START -> Chatbot -> END
    graph_builder.add_edge(START, "chatbot")
    graph_builder.add_edge("chatbot", END)
    
    # Compile the graph into an executable workflow
    graph = graph_builder.compile()
    
    return graph

# Reusable graph instance (avoids rebuilding for every request)
chat_graph = build_graph()