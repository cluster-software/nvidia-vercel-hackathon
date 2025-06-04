from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict, List
import json
import os
from openai import OpenAI
from ui_struct import FlexibleContent, Section, Component

app = FastAPI(title="UI Structure Modifier", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    current_json: Dict[str, Any]
    messages: List[Message]
    selected_component_path: str | None = None


class ChatResponse(BaseModel):
    ai_message: str
    modified_json: Dict[str, Any]


class ModificationRequest(BaseModel):
    current_json: Dict[str, Any]
    messages: List[Dict[str, Any]]
    selected_component_path: str | None = None


class UIModificationService:
    def __init__(self):
        self.client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=os.getenv(
                "NVIDIA_API_KEY", "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"
            ),
        )

    def create_modification_prompt(self, ui_json: Dict[str, Any], message: str) -> str:
        """Create a detailed prompt for the LLM to understand the modification request."""

        prompt = f"""
You are a UI modification assistant. You need to modify a JSON structure based on user instructions.

The JSON follows this structure:
- FlexibleContent contains layout config and sections
- Sections contain components with styles and properties
- Components have types (text, image, button, input, etc.) and responsive styles
- Styles are organized by breakpoints (default, max-sm, max-md, max-lg, max-xl, max-2xl)
- Each breakpoint can have CSS-like style properties

CURRENT JSON STRUCTURE:
{json.dumps(ui_json, indent=2)}

USER INSTRUCTION: "{message}"

Please provide the modified JSON structure. Make sure to:
1. Keep all existing structure intact unless specifically requested to change
2. Apply changes to the appropriate component/section based on the instruction
3. Use proper CSS property names and values
4. If changing font size, use CSS units like 'px', 'rem', 'em'
5. If changing colors, use valid CSS color values
6. If changing dimensions, use CSS units like 'px', '%', 'rem', 'em', 'pt'
7. If the instruction is unclear about which component to modify, apply to all relevant components

RESPOND ONLY WITH THE MODIFIED JSON STRUCTURE - NO EXPLANATIONS OR ADDITIONAL TEXT.
"""
        return prompt

    def modify_ui_json(self, ui_json: Dict[str, Any], message: str) -> tuple[Dict[str, Any], str]:
        """Use LLM to modify the UI JSON based on the text message."""

        try:
            prompt = self.create_modification_prompt(ui_json, message)

            completion = self.client.chat.completions.create(
                model="meta/llama-3.3-70b-instruct",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                top_p=0.7,
                max_tokens=2048,
                stream=False,
            )

            response_content = completion.choices[0].message.content

            # Parse the JSON response
            try:
                modified_json = json.loads(response_content)
                changes_made = f"Applied modification: {message}"
                return modified_json, changes_made
            except json.JSONDecodeError:
                # If direct JSON parsing fails, try to extract JSON from the response
                import re

                json_match = re.search(r"\{.*\}", response_content, re.DOTALL)
                if json_match:
                    modified_json = json.loads(json_match.group())
                    changes_made = f"Applied modification: {message}"
                    return modified_json, changes_made
                else:
                    raise ValueError("Could not parse JSON from LLM response")

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error modifying UI: {str(e)}")


# Initialize the service
ui_service = UIModificationService()


@app.post("/modify-ui", response_model=ChatResponse)
async def modify_ui(request: ModificationRequest):
    """
    Modify UI JSON structure based on natural language instructions.
    """
    try:
        print(f"Received request: {request}")
        ui_json = request.current_json
        print(f"UI JSON keys: {list(ui_json.keys()) if ui_json else 'None'}")
        print(f"Messages: {request.messages}")

        # Validate that the input JSON follows the expected structure
        FlexibleContent(**ui_json)
        message = request.messages[-1]["content"]

        modified_json, changes_made = ui_service.modify_ui_json(ui_json, message)

        # Validate the modified JSON
        FlexibleContent(**modified_json)

        return ChatResponse(ai_message=changes_made, modified_json=modified_json)

    except Exception as e:
        print(f"Error in modify_ui: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid request: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "UI Structure Modifier API",
        "version": "1.0.0",
        "endpoints": {"modify_ui": "/modify-ui", "health": "/health"},
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
