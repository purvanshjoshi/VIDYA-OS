import json
from typing import Annotated, TypedDict, Union, List, Dict
from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from app.core.config import settings


# --- State Definition ---
class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], "The conversation history"]
    sender: str
    next_node: str


# --- Model setup ---
def get_model():
    return ChatOpenAI(
        model=settings.HF_MODEL_ID,
        api_key=settings.HF_API_TOKEN,
        base_url="https://api-inference.huggingface.co/v1",
        streaming=True,
    )


# --- Node Definitions ---

async def router_node(state: AgentState):
    """Analyzes intent and routes to Professor (Learn) or Builder (Create/App)"""
    messages = state["messages"]
    last_message = messages[-1].content

    model = get_model()
    # Simple prompt for routing
    routing_prompt = [
        SystemMessage(content=(
            "You are a router. Classify the user intent into 'LEARN' or 'BUILD'. "
            "Use 'LEARN' for academic questions, explanations, or quizzes. "
            "Use 'BUILD' for app ideas, code help, or tool creation. "
            "Reply with exactly one word: LEARN or BUILD."
        )),
        HumanMessage(content=last_message)
    ]
    
    response = await model.ainvoke(routing_prompt)
    intent = response.content.strip().upper()
    
    # Defaults
    next_node = "professor" if "LEARN" in intent else "builder"
    return {"next_node": next_node}


async def professor_node(state: AgentState):
    """The Academic Persona (Learn Pillar)"""
    messages = state["messages"]
    model = get_model()
    
    system_msg = SystemMessage(content=(
        "You are Professor VIDYA, a sovereign AI tutor for Indian campuses. "
        "Explain concepts step-by-step. Support Hinglish seamlessly. "
        "Always be encouraging and academic."
    ))
    
    # We prefix with system message but keep history
    response = await model.ainvoke([system_msg] + messages)
    return {"messages": [response], "sender": "professor"}


async def builder_node(state: AgentState):
    """The Software Architect Persona (Create Pillar)"""
    messages = state["messages"]
    model = get_model()
    
    system_msg = SystemMessage(content=(
        "You are VIDYA Builder, a software architect for campus apps. "
        "Help the user design, scaffold, and optimize their campus tool ideas. "
        "Suggest tech stacks and UI components."
    ))
    
    response = await model.ainvoke([system_msg] + messages)
    return {"messages": [response], "sender": "builder"}


# --- Graph Construction ---

def create_vidya_brain():
    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("router", router_node)
    workflow.add_node("professor", professor_node)
    workflow.add_node("builder", builder_node)

    # Entry point
    workflow.set_entry_point("router")

    # Conditional edges from router
    workflow.add_conditional_edges(
        "router",
        lambda x: x["next_node"],
        {
            "professor": "professor",
            "builder": "builder"
        }
    )

    # All paths lead to end for now
    workflow.add_edge("professor", END)
    workflow.add_edge("builder", END)

    # Checkpointer for state persistence
    memory = MemorySaver()
    return workflow.compile(checkpointer=memory)


vidya_brain = create_vidya_brain()
