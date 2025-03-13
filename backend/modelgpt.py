import os
import json
import uuid
import base64
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain.agents import initialize_agent
from langchain.chains.conversation.memory import ConversationBufferMemory
from langchain.tools import BaseTool
from transformers import BlipProcessor, BlipForConditionalGeneration, DetrImageProcessor, DetrForObjectDetection
from PIL import Image
import torch
# Add LangSmith imports
from langsmith import Client
from langchain.callbacks.tracers.langchain import LangChainTracer
from langchain.callbacks.manager import CallbackManager

# Load environment variables
load_dotenv()

class ImageCaptionTool(BaseTool):
    name: str = "Image captioner"
    description: str = (
        "Use this tool when given the path to an image that you would like to be described."
    )

    def _run(self, img_path: str) -> str:
        # Normalize path for cross-platform compatibility
        img_path = os.path.normpath(img_path).replace("\\", "/")
        
        try:
            # Check if file exists
            if not os.path.exists(img_path):
                return f"Error: Image file not found at path: {img_path}"
                
            image = Image.open(img_path).convert("RGB")

            model_name = "Salesforce/blip-image-captioning-large"
            device = "cuda" if torch.cuda.is_available() else "cpu"

            processor = BlipProcessor.from_pretrained(model_name)
            model = BlipForConditionalGeneration.from_pretrained(model_name).to(device)

            inputs = processor(image, return_tensors="pt").to(device)
            output = model.generate(**inputs, max_new_tokens=20)

            caption = processor.decode(output[0], skip_special_tokens=True)

            return caption
        except Exception as e:
            return f"Error processing image: {str(e)}"

    def _arun(self, query: str):
        raise NotImplementedError("This tool does not support async")

class ObjectDetectionTool(BaseTool):
    name: str = "Object detector"
    description: str = (
        "Use this tool when given the path to an image that you would like to detect objects. "
        "It will return a list of all detected objects. Each element in the list is in the format: "
        "[x1, y1, x2, y2] class_name confidence_score."
    )

    def _run(self, img_path: str) -> str:
        # Normalize path for cross-platform compatibility
        img_path = os.path.normpath(img_path).replace("\\", "/")
        
        try:
            # Check if file exists
            if not os.path.exists(img_path):
                return f"Error: Image file not found at path: {img_path}"
                
            image = Image.open(img_path).convert("RGB")

            processor = DetrImageProcessor.from_pretrained("facebook/detr-resnet-50")
            model = DetrForObjectDetection.from_pretrained("facebook/detr-resnet-50")

            inputs = processor(images=image, return_tensors="pt")
            outputs = model(**inputs)

            # Convert outputs (bounding boxes and class logits) to COCO API
            target_sizes = torch.tensor([image.size[::-1]])
            results = processor.post_process_object_detection(outputs, target_sizes=target_sizes, threshold=0.9)[0]

            detections = ""
            for score, label, box in zip(results["scores"], results["labels"], results["boxes"]):
                detections += "[{}, {}, {}, {}]".format(int(box[0]), int(box[1]), int(box[2]), int(box[3]))
                detections += " {}".format(model.config.id2label[int(label)])
                detections += " {}\n".format(float(score))

            return detections
        except Exception as e:
            return f"Error detecting objects: {str(e)}"

    def _arun(self, query: str):
        raise NotImplementedError("This tool does not support async")

class PlantDiseaseChat:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if self.api_key is None:
            raise ValueError("API Key not set. Please set the OPENAI_API_KEY environment variable.")
        
        # Initialize LangSmith client
        self.langsmith_api_key = os.getenv("LANGCHAIN_API_KEY")
        self.langsmith_project = os.getenv("LANGCHAIN_PROJECT", "plant-disease-diagnosis")
        
        if self.langsmith_api_key:
            # Set LangSmith environment variables
            os.environ["LANGCHAIN_TRACING_V2"] = "true"
            os.environ["LANGCHAIN_PROJECT"] = self.langsmith_project
            self.langsmith_client = Client(api_key=self.langsmith_api_key)
            self.tracer = LangChainTracer(project_name=self.langsmith_project)
            self.callback_manager = CallbackManager([self.tracer])
            print(f"LangSmith tracing enabled for project: {self.langsmith_project}")
        else:
            self.langsmith_client = None
            self.tracer = None
            self.callback_manager = None
            print("Warning: LANGCHAIN_API_KEY not set. LangSmith tracing is disabled.")
        
        # Initialize OpenAI model with GPT-4o which has vision capabilities
        self.llm = ChatOpenAI(
            api_key=self.api_key, 
            model="gpt-4o",  # Using GPT-4o which has vision capabilities
            temperature=0.7,
            max_tokens=1024,
            callbacks=[self.tracer] if self.tracer else None
        )
        
        # Initialize tools
        self.tools = [ImageCaptionTool(), ObjectDetectionTool()]
        
        # Setup persistent conversation memory
        self.sessions = {}
    
    def _get_or_create_session(self, session_id: str) -> Dict:
        """Get existing session or create a new one"""
        if session_id not in self.sessions:
            self.sessions[session_id] = {
                "memory": ConversationBufferMemory(
                    memory_key='chat_history',
                    return_messages=True
                ),
                "agent": None,
                "image_path": None,
                "initial_diagnosis": None,
                "run_ids": []  # For LangSmith tracking
            }
            
            # Initialize agent with memory and tracer
            self.sessions[session_id]["agent"] = initialize_agent(
                agent="chat-conversational-react-description",
                tools=self.tools,
                llm=self.llm,
                max_iterations=5,
                verbose=True,
                memory=self.sessions[session_id]["memory"],
                early_stopping_method='generate',
                handle_parsing_errors=True,
                callbacks=[self.tracer] if self.tracer else None
            )
            
        return self.sessions[session_id]
    
    def _parse_response_for_ui(self, response_text: str) -> str:
        """Format the response for UI display"""
        # Clean any JSON or technical formatting for a user-friendly response
        try:
            # Check if there's a JSON object in the text
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx >= 0 and end_idx > 0:
                try:
                    json_str = response_text[start_idx:end_idx]
                    data = json.loads(json_str)
                    
                    formatted_response = "**Plant Disease Analysis**\n\n"
                    
                    if data.get("possible_diagnosis"):
                        formatted_response += "**Possible Diagnosis:**\n"
                        for diagnosis in data["possible_diagnosis"]:
                            formatted_response += f"- {diagnosis}\n"
                        formatted_response += "\n"
                    
                    if data.get("causes"):
                        formatted_response += "**Causes:**\n"
                        for cause in data["causes"]:
                            formatted_response += f"- {cause}\n"
                        formatted_response += "\n"
                    
                    if data.get("remedies_or_cure"):
                        formatted_response += "**Remedies:**\n"
                        for remedy in data["remedies_or_cure"]:
                            formatted_response += f"- {remedy}\n"
                    
                    return formatted_response
                except json.JSONDecodeError:
                    # If JSON parsing fails, return the cleaned text
                    return response_text
            
            # If no JSON found, return the original text
            return response_text
            
        except Exception as e:
            # If parsing fails, return the original text with error info
            return f"Error formatting response: {str(e)}\n\n{response_text}"
    
    def _encode_image(self, image_path: str) -> str:
        """
        Encode image as base64 for direct API use
        """
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
        
    async def process_image(
        self, 
        session_id: str,
        image_path: str, 
        symptoms: Optional[str] = None
    ) -> str:
        """
        Process a plant image and initialize a chat session
        
        Args:
            session_id: Unique identifier for the chat session
            image_path: Path to the uploaded image
            symptoms: Optional description of symptoms
            
        Returns:
            Formatted response for the user
        """
        # Validate image path
        if not os.path.exists(image_path):
            return f"Error: Image file not found at path: {image_path}"
        
        try:
            # Test image loading before proceeding
            Image.open(image_path).convert("RGB")
        except Exception as e:
            return f"Error loading image: {str(e)}. Please ensure the file is a valid image."
        
        session = self._get_or_create_session(session_id)
        session["image_path"] = image_path
        
        # Default symptoms if not provided
        if symptoms is None:
            symptoms = """
            Please analyze this plant image and identify any possible diseases or issues.
            """
        
        try:
            # Normalize the image path for cross-platform compatibility
            normalized_path = os.path.normpath(image_path).replace("\\", "/")
            
            # Use the image tools to get descriptions
            caption = self.tools[0]._run(normalized_path)
            objects = self.tools[1]._run(normalized_path)
            
            # Create a comprehensive prompt with the tool outputs
            enhanced_prompt = f"""
            You are a plant disease diagnosis expert. Analyze the following information and the provided symptoms.

            Symptoms:
            {symptoms}
            
            Image caption: {caption}
            
            Detected objects: {objects}
            
            Based on this information, provide a detailed analysis of:
            1. Possible disease diagnosis
            2. Likely causes
            3. Recommended treatments or remedies
            
            Present your answer in a well-formatted way. After your analysis, ask the user if they would like more specific information about any aspect of the diagnosis.
            """
            
            # Store the initial prompt and diagnosis in memory for context
            session["memory"].chat_memory.add_user_message(f"I'm having issues with my plant. Symptoms: {symptoms}")
            
            # Process with direct LLM call - LangSmith will trace this automatically
            response = self.llm.invoke(enhanced_prompt)
            output_text = response.content
            
            # Store the diagnosis in memory and save it separately
            session["initial_diagnosis"] = output_text
            session["memory"].chat_memory.add_ai_message(output_text)
            
            # Format the response for the UI
            formatted_response = self._parse_response_for_ui(output_text)
            
            # Save the run_id if it was provided in the response metadata
            if hasattr(response, 'metadata') and response.metadata.get('run_id'):
                session["run_ids"].append(response.metadata['run_id'])
            
            return formatted_response
            
        except Exception as e:
            return f"Error analyzing plant image: {str(e)}"
    
    async def chat(self, session_id: str, message: str) -> str:
        """
        Handle follow-up questions in the chat session
        
        Args:
            session_id: Unique identifier for the chat session
            message: User's follow-up question
            
        Returns:
            Assistant's response
        """
        # Validate session
        if session_id not in self.sessions:
            return "Error: Session not found. Please start a new session by uploading a plant image."
            
        session = self._get_or_create_session(session_id)
        
        # Check if we have an image for this session
        if not session["image_path"]:
            return "Please upload a plant image first for diagnosis."
            
        # Validate that the image file still exists
        if not os.path.exists(session["image_path"]):
            return "Error: The previously uploaded image is no longer available. Please upload a new image."
        
        try:
            # Add the user's message to memory
            session["memory"].chat_memory.add_user_message(message)
            
            # Create a context-aware follow-up prompt
            initial_diagnosis = session.get("initial_diagnosis", "No initial diagnosis available.")
            
            # Use the agent for follow-up instead of direct LLM calls
            # This will properly maintain conversation context
            response = session["agent"].run(
                input=f"""The user's latest question is: {message}
                
                Remember the initial plant diagnosis was: {initial_diagnosis}
                """
            )
            
            # Add the response to memory
            session["memory"].chat_memory.add_ai_message(response)
            
            # Save the run_id if available from agent
            if hasattr(response, 'metadata') and response.metadata and response.metadata.get('run_id'):
                session["run_ids"].append(response.metadata['run_id'])
            
            return response
            
        except Exception as e:
            return f"Error processing your question: {str(e)}"
    
    def log_feedback(self, session_id: str, message_id: str, feedback: Dict[str, Any]) -> bool:
        """
        Log user feedback to LangSmith
        
        Args:
            session_id: Unique identifier for the chat session
            message_id: Identifier for the specific message being rated
            feedback: Dictionary containing feedback data (rating, comments, etc.)
            
        Returns:
            Boolean indicating success
        """
        if not self.langsmith_client:
            return False
            
        try:
            session = self._get_or_create_session(session_id)
            run_ids = session.get("run_ids", [])
            
            if not run_ids:
                return False
            
            # For simplicity, we're logging feedback to the most recent run
            # In a production system, you'd want to correlate message_id with the specific run
            run_id = run_ids[-1]
                
            # Log feedback to LangSmith
            self.langsmith_client.create_feedback(
                run_id=run_id,
                key=feedback.get("key", "user_rating"),
                score=feedback.get("score"),
                comment=feedback.get("comment", ""),
                value=feedback.get("value", None)
            )
            
            return True
        except Exception as e:
            print(f"Error logging feedback: {str(e)}")
            return False

# Singleton instance for use in the FastAPI app
plant_chat = PlantDiseaseChat()

# Function to use in FastAPI app
async def handle_image_upload(file_path: str, symptoms: Optional[str] = None) -> Dict[str, Any]:
    """
    Process an uploaded image and start a new chat session
    
    Args:
        file_path: Path to the uploaded image file
        symptoms: Optional description of symptoms
        
    Returns:
        Dictionary with session_id and initial response
    """
    try:
        # Validate the file path
        if not os.path.exists(file_path):
            return {
                "success": False,
                "error": f"Error: Image file not found at path: {file_path}"
            }
            
        # Ensure the file is a valid image
        try:
            Image.open(file_path).convert("RGB")
        except Exception as e:
            return {
                "success": False,
                "error": f"Error loading image: {str(e)}. Please ensure the file is a valid image."
            }
            
        # Generate a unique session ID
        session_id = str(uuid.uuid4())
        
        # Process the image
        response = await plant_chat.process_image(
            session_id=session_id,
            image_path=file_path,
            symptoms=symptoms
        )
        
        return {
            "success": True,
            "session_id": session_id,
            "response": response
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# Function to handle chat messages
async def handle_chat_message(session_id: str, message: str) -> Dict[str, Any]:
    """
    Handle a chat message in an existing session
    
    Args:
        session_id: Unique identifier for the chat session
        message: User's message
        
    Returns:
        Dictionary with the assistant's response
    """
    try:
        # Validate session_id
        if not session_id or session_id not in plant_chat.sessions:
            return {
                "success": False,
                "error": "Invalid session ID. Please start a new session by uploading a plant image."
            }
            
        response = await plant_chat.chat(session_id, message)
        
        return {
            "success": True,
            "response": response
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# Function to handle user feedback
async def handle_feedback(session_id: str, message_id: str, feedback: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handle user feedback for a specific message
    
    Args:
        session_id: Unique identifier for the chat session
        message_id: Identifier for the specific message being rated
        feedback: Dictionary containing feedback data
        
    Returns:
        Dictionary indicating success
    """
    try:
        # Log feedback to LangSmith
        success = plant_chat.log_feedback(session_id, message_id, feedback)
        
        return {
            "success": success
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }