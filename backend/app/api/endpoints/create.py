from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime

router = APIRouter()

# Mock DB
published_apps = []

TEMPLATES = [
    {
        "id": "tutor-1",
        "name": "Course Assistant",
        "icon": "🎓",
        "description": "Specialized tutor for a specific subject",
        "components": [
            {"label": "Subject Name", "type": "text_input", "placeholder": "e.g. Quantum Physics"},
            {"label": "Level", "type": "select", "options": ["Beginner", "Intermediate", "Advanced"]},
            {"label": "Style", "type": "select", "options": ["Academic", "Conversational", "ELI5"]}
        ]
    },
    {
        "id": "faq-2",
        "name": "Event Concierge",
        "icon": "📅",
        "description": "AI that knows everything about your event",
        "components": [
            {"label": "Event Name", "type": "text_input", "placeholder": "e.g. Pragyan 2026"},
            {"label": "FAQ Content", "type": "textarea", "placeholder": "Paste event details here..."}
        ]
    }
]

class CreateAppRequest(BaseModel):
    name: str
    template_id: str
    config: Dict[str, Any]

@router.get("/templates")
async def get_templates():
    return {"templates": TEMPLATES}

@router.post("/apps")
async def create_app(request: CreateAppRequest):
    new_app = {
        "id": str(uuid.uuid4()),
        "name": request.name,
        "template_id": request.template_id,
        "config": request.config,
        "created_at": datetime.now().isoformat(),
        "share_url": f"https://vidya-os.vercel.app/app/{str(uuid.uuid4())[:8]}"
    }
    published_apps.append(new_app)
    return new_app

@router.get("/apps")
async def get_apps():
    return {"apps": published_apps}

from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage
from app.services.agents import vidya_brain

class AppChatRequest(BaseModel):
    prompt: Optional[str] = None
    messages: Optional[list] = None

@router.post("/apps/{app_id}/chat")
async def app_chat(app_id: str, request: AppChatRequest):
    """Specific chat endpoint for published apps using the Builder persona."""
    
    user_prompt = request.prompt
    if not user_prompt and request.messages:
        user_prompt = request.messages[-1].get("content")

    if not user_prompt:
        return StreamingResponse(iter(["Error: No prompt"]), media_type="text/plain")

    # Force 'builder' node for this app_id context
    config = {"configurable": {"thread_id": f"app_{app_id}"}}
    input_message = HumanMessage(content=user_prompt)
    
    async def token_generator():
        try:
            # Start immediately in builder mode
            async for event in vidya_brain.astream(
                {"messages": [input_message]}, 
                config,
                stream_mode="values"
            ):
                pass
            
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
