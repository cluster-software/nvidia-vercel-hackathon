from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional
import json
import os
import re
import logging
from openai import OpenAI
from ui_struct import FlexibleContent, Section, Component

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    target_component_id: Optional[str] = Field(None, description="ID of the specific component to modify")


class UIModificationService:
    def __init__(self):
        self.client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=os.getenv(
                "NVIDIA_API_KEY", "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"
            ),
        )

    def extract_component_id_from_path(self, component_path: str) -> Optional[str]:
        """Extract component ID from the component path."""
        if not component_path:
            return None
        
        # Parse component path like "sections.form_section.components.0" to get component ID
        try:
            # Split path and find component index
            parts = component_path.split('.')
            if 'components' in parts:
                component_index = int(parts[parts.index('components') + 1])
                section_name = parts[parts.index('sections') + 1]
                return f"{section_name}_component_{component_index}"
        except (ValueError, IndexError):
            pass
        
        return None

    def find_component_id_from_path(self, ui_json: Dict[str, Any], component_path: str) -> Optional[str]:
        """Find the actual component ID from the path by navigating the JSON structure."""
        if not component_path:
            return None
            
        try:
            # Parse path like "sections.form_section.components.0"
            parts = component_path.split('.')
            current = ui_json
            
            # Navigate to the component
            for part in parts:
                if part.isdigit():
                    current = current[int(part)]
                else:
                    current = current[part]
            
            # If we reached a component, return its ID
            if isinstance(current, dict) and 'id' in current:
                return current['id']
                
        except (KeyError, IndexError, ValueError):
            logger.warning(f"Could not extract component ID from path: {component_path}")
            
        return None

    def create_modification_prompt(self, ui_json: Dict[str, Any], message: str, target_component_id: Optional[str] = None) -> str:
        """Create a detailed prompt for the LLM to understand the modification request."""
        
        target_instruction = ""
        if target_component_id:
            target_instruction = f"""
IMPORTANT: You must ONLY modify the component with ID "{target_component_id}". 
Do NOT modify any other components, sections, or parts of the JSON structure.
Find the component with id: "{target_component_id}" and apply changes only to its styles.
"""
        
        prompt = f"""
You are a UI modification assistant. You need to modify a JSON structure based on user instructions.

{target_instruction}

CRITICAL JSON REQUIREMENTS:
1. Return ONLY valid JSON - no explanations, no markdown, no additional text
2. Maintain EXACT same field names (e.g., "fontSize" not "font-size")
3. Maintain EXACT same structure - do not add or remove fields
4. Use proper JSON syntax with double quotes
5. No trailing commas
6. Ensure all brackets and braces are properly closed

CURRENT JSON STRUCTURE:
{json.dumps(ui_json, indent=2)}

USER INSTRUCTION: "{message}"

MODIFICATION RULES:
1. Keep all existing structure completely intact
2. Only modify the styles of the specified component (if target provided)
3. Use CSS property names exactly as they appear in the original JSON
4. For font size: use "fontSize" field with values like "18px"
5. For colors: use valid CSS colors like "#00FF00" or "green"
6. For background: use "backgroundColor" field
7. Maintain all other fields exactly as they are
8. If no specific component is targeted, apply to relevant components based on instruction

RESPOND WITH ONLY THE COMPLETE MODIFIED JSON STRUCTURE.
"""
        return prompt

    def _parse_json_response(self, response_content: str) -> Dict[str, Any]:
        """Parse JSON from LLM response with robust error handling."""
        
        logger.info(f"Raw LLM response length: {len(response_content)}")
        
        # Strategy 1: Direct JSON parsing
        try:
            cleaned_content = response_content.strip()
            return json.loads(cleaned_content)
        except json.JSONDecodeError as e:
            logger.warning(f"Direct JSON parsing failed: {e}")
        
        # Strategy 2: Extract JSON block from markdown
        json_block_pattern = r'```(?:json)?\s*(\{.*?\})\s*```'
        match = re.search(json_block_pattern, response_content, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError as e:
                logger.warning(f"Markdown JSON block parsing failed: {e}")
        
        # Strategy 3: Find first complete JSON object
        json_pattern = r'\{.*\}'
        match = re.search(json_pattern, response_content, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError as e:
                logger.warning(f"JSON object extraction failed: {e}")
        
        # Strategy 4: Clean up response
        cleaned_content = response_content.strip()
        
        # Remove markdown blocks
        if cleaned_content.startswith('```') and cleaned_content.endswith('```'):
            cleaned_content = cleaned_content[3:-3].strip()
            if cleaned_content.startswith('json'):
                cleaned_content = cleaned_content[4:].strip()
        
        # Remove common prefixes
        prefixes = ['Here is the modified JSON:', 'Modified JSON:', 'Result:', 'Here\'s the modified JSON:']
        for prefix in prefixes:
            if cleaned_content.startswith(prefix):
                cleaned_content = cleaned_content[len(prefix):].strip()
        
        try:
            return json.loads(cleaned_content)
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing failed. Error: {e}")
            logger.error(f"Content around error: {cleaned_content[max(0, e.pos-50):e.pos+50]}")
        
        # Strategy 5: Fix common JSON issues
        try:
            # Fix trailing commas
            fixed_content = re.sub(r',(\s*[}\]])', r'\1', cleaned_content)
            return json.loads(fixed_content)
        except json.JSONDecodeError:
            pass
        
        raise ValueError("Could not parse valid JSON from LLM response")

    def modify_ui_json(self, ui_json: Dict[str, Any], message: str, target_component_id: Optional[str] = None) -> tuple[Dict[str, Any], str]:
        """Use LLM to modify the UI JSON based on the text message."""

        try:
            prompt = self.create_modification_prompt(ui_json, message, target_component_id)
            
            logger.info(f"Processing modification request: {message}")
            if target_component_id:
                logger.info(f"Target component: {target_component_id}")

            completion = self.client.chat.completions.create(
                model="meta/llama-3.3-70b-instruct",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,  # Very low temperature for consistency
                top_p=0.7,
                max_tokens=8192,  # Increased token limit for larger structures
                stream=False,
            )

            response_content = completion.choices[0].message.content
            logger.info("Received LLM response")

            # Parse the JSON response with improved error handling
            modified_json = self._parse_json_response(response_content)
            
            # Create appropriate change message
            if target_component_id:
                changes_made = f"Applied modification to component '{target_component_id}': {message}"
            else:
                changes_made = f"Applied modification: {message}"
                
            return modified_json, changes_made

        except Exception as e:
            logger.error(f"Error in modify_ui_json: {e}")
            raise HTTPException(status_code=500, detail=f"Error modifying UI: {str(e)}")


# Initialize the service
ui_service = UIModificationService()


@app.post("/modify-ui", response_model=ChatResponse)
async def modify_ui(request: ModificationRequest):
    """
    Modify UI JSON structure based on natural language instructions.
    
    If selected_component_path or target_component_id is provided, only that specific component will be modified.
    """
    try:
        print(f"Received request: {request}")
        ui_json = request.current_json
        print(f"UI JSON keys: {list(ui_json.keys()) if ui_json else 'None'}")
        print(f"Messages: {request.messages}")

        # Validate that the input JSON follows the expected structure
        FlexibleContent(**ui_json)
        message = request.messages[-1]["content"]
        
        # Determine target component ID
        target_component_id = request.target_component_id
        
        # If no explicit target_component_id but we have a selected_component_path, extract the ID
        if not target_component_id and request.selected_component_path:
            target_component_id = ui_service.find_component_id_from_path(ui_json, request.selected_component_path)
            logger.info(f"Extracted component ID from path: {target_component_id}")

        modified_json, changes_made = ui_service.modify_ui_json(ui_json, message, target_component_id)

        # Validate the modified JSON
        FlexibleContent(**modified_json)

        return ChatResponse(ai_message=changes_made, modified_json=modified_json)

    except Exception as e:
        print(f"Error in modify_ui: {str(e)}")
        logger.error(f"Request processing error: {e}")
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
