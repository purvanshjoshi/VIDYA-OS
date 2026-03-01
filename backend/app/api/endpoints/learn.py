from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from langchain_core.messages import HumanMessage
from app.services.agents import vidya_brain

router = APIRouter()


class ChatRequest(BaseModel):
    prompt: Optional[str] = None
    messages: Optional[list] = None
    thread_id: Optional[str] = "default_user"
    mode: Optional[str] = "learn"
    language: Optional[str] = "English"


class QuizRequest(BaseModel):
    topic: str
    num_questions: int = 5


@router.post("/chat")
async def chat(request: ChatRequest):
    """Stream a response from the LangGraph Agentic Brain."""
    
    # Compatibility: Extract prompt from 'messages' if 'prompt' is missing
    user_prompt = request.prompt
    if not user_prompt and request.messages:
        # Get the content of the last message in the list
        last_msg = request.messages[-1]
        user_prompt = last_msg.get("content") if isinstance(last_msg, dict) else str(last_msg)

    if not user_prompt:
        return StreamingResponse(iter(["[Error: No prompt or messages provided]"]), media_type="text/plain")

    config = {"configurable": {"thread_id": request.thread_id}}
    input_message = HumanMessage(content=user_prompt)
    
    async def token_generator():
        try:
            # Stream from the graph
            async for event in vidya_brain.astream(
                {"messages": [input_message]}, 
                config, 
                stream_mode="values"
            ):
                pass
            
            # Get final state to yield the full message (stable baseline)
            final_state = await vidya_brain.aget_state(config)
            if final_state.values.get("messages"):
                yield final_state.values["messages"][-1].content
        except Exception as e:
            error_type = type(e).__name__
            if "AuthenticationError" in error_type:
                yield "[Error: System Authentication Failed. Please verify HF_API_TOKEN in backend settings.]"
            else:
                yield f"[Error: {error_type} - {str(e)}]"

    return StreamingResponse(token_generator(), media_type="text/plain")


@router.post("/quiz")
async def generate_quiz(request: QuizRequest):
    """Generate MCQ quiz from a topic."""
    prompt = (
        f"Generate {request.num_questions} multiple choice questions about '{request.topic}'. "
        "Format as JSON array: [{question, options:[A,B,C,D], answer}]. Return only JSON."
    )
    result = await inference_service.simple_chat(prompt, mode="learn")
    return {"quiz": result, "topic": request.topic}
