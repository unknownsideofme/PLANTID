import os
import json
import shutil
import uuid
import logging
from typing import Dict, List, Optional
from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from modelgpt import handle_image_upload, handle_chat_message
from model_api import process_uploaded_image  # Import for new endpoint

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(title="Plant Disease Diagnosis Chat")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development. In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directories if they don't exist
UPLOAD_DIR = "uploads"
IMAGE_DIR = "image"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(IMAGE_DIR, exist_ok=True)

# Mount only the uploads directory as static files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Connection manager for WebSockets
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        
    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        logger.info(f"WebSocket connected for session: {session_id}")
        
    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
            logger.info(f"WebSocket disconnected for session: {session_id}")
    
    async def send_message(self, session_id: str, message: str):
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_text(message)
            logger.info(f"Message sent to session {session_id}")
        else:
            logger.warning(f"Attempted to send message to non-existent session: {session_id}")

manager = ConnectionManager()

# Request models
class ChatRequest(BaseModel):
    session_id: str
    message: str

class AnalysisRequest(BaseModel):
    symptoms: Optional[str] = None

# Response models
class ChatResponse(BaseModel):
    success: bool
    response: str = ""
    error: Optional[str] = None

# API endpoints
@app.get("/")
async def get_home():
    """Basic health check endpoint"""
    return {"status": "ok", "message": "Plant Disease Diagnosis API is running"}

@app.post("/api/upload")
async def upload_image(
    file: UploadFile = File(...), 
    symptoms: Optional[str] = Form(None)
):
    """Upload an image and get initial diagnosis"""
    try:
        # Generate a unique filename
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save the uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"Image uploaded successfully: {file_path}")
        
        # Process the image
        result = await handle_image_upload(file_path, symptoms)
        
        # Add the file path to the response
        if result["success"]:
            result["file_path"] = f"/uploads/{unique_filename}"
            logger.info(f"Image analysis successful for session: {result.get('session_id')}")
        else:
            logger.error(f"Image analysis failed: {result.get('error')}")
        
        return result
    except Exception as e:
        logger.error(f"Error processing upload: {str(e)}")
        return {"success": False, "error": f"Error processing upload: {str(e)}"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat_message(request: ChatRequest):
    """Handle a chat message"""
    try:
        logger.info(f"Received chat message for session: {request.session_id}")
        result = await handle_chat_message(request.session_id, request.message)
        return result
    except Exception as e:
        logger.error(f"Error processing chat message: {str(e)}")
        return ChatResponse(success=False, error=f"Error processing chat message: {str(e)}")

# New endpoint for plant disease diagnosis
@app.post("/api/diagnose-plant-disease/")
async def diagnose_plant_disease(
    file: UploadFile = File(...),
    symptoms: Optional[str] = Form(None)
):
    """
    Upload an image of a plant and get a diagnosis of potential diseases.
    
    - **file**: The image file to upload
    - **symptoms**: Optional description of symptoms observed
    """
    # Validate file is an image
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400, 
            detail="Uploaded file must be an image"
        )
    
    try:
        # Generate a unique filename to prevent collisions
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(IMAGE_DIR, unique_filename)
        
        # Save the uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process the image for disease detection
        result = await process_uploaded_image(file_path, symptoms)
        
        # Clean up the file after processing
        if os.path.exists(file_path):
            os.remove(file_path)
        
        return JSONResponse(content=result)
        
    except Exception as e:
        # Clean up on error
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
            
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}"
        )

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time chat"""
    await manager.connect(websocket, session_id)
    try:
        # Send initial message to confirm connection
        await websocket.send_text(json.dumps({
            "type": "system",
            "message": "Connected to plant disease diagnosis system"
        }))
        
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            logger.info(f"Received WebSocket message from session {session_id}: {data}")
            
            try:
                message_data = json.loads(data)
                
                # Process the message
                if message_data.get("type") == "chat":
                    user_message = message_data.get("message", "")
                    logger.info(f"Processing chat message: {user_message}")
                    
                    # Send acknowledgment first
                    await websocket.send_text(json.dumps({
                        "type": "system",
                        "message": "Processing your message..."
                    }))
                    
                    # Process the message
                    result = await handle_chat_message(session_id, user_message)
                    
                    # Send response back to client
                    await websocket.send_text(json.dumps(result))
                    logger.info(f"Response sent to client for session {session_id}")
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON received from session {session_id}")
                await websocket.send_text(json.dumps({
                    "success": False,
                    "error": "Invalid message format"
                }))
            
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session {session_id}")
        manager.disconnect(session_id)
    except Exception as e:
        logger.error(f"WebSocket error for session {session_id}: {str(e)}")
        error_response = {
            "success": False,
            "error": str(e)
        }
        try:
            await websocket.send_text(json.dumps(error_response))
        except:
            logger.error("Failed to send error message to client")
        manager.disconnect(session_id)

# Run with: uvicorn main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)