import os
import json
import re
from typing import Dict, Any, Optional, List, Union
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import AIMessage, HumanMessage
from langchain.tools import BaseTool
from transformers import BlipProcessor, BlipForConditionalGeneration, DetrImageProcessor, DetrForObjectDetection
from PIL import Image
import torch
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_core.tools import Tool
from langchain.memory import ConversationBufferMemory


class ImageCaptionTool(BaseTool):
    name: str = "image_captioner"
    description: str = (
        "Use this tool when given the path to an image that you would like to be described."
    )

    def _run(self, img_path: str) -> str:
        image = Image.open(img_path).convert("RGB")

        model_name = "Salesforce/blip-image-captioning-large"
        device = "cpu"  # Change to "cuda" if GPU is available

        processor = BlipProcessor.from_pretrained(model_name)
        model = BlipForConditionalGeneration.from_pretrained(model_name).to(device)

        inputs = processor(image, return_tensors="pt").to(device)
        output = model.generate(**inputs, max_new_tokens=20)

        caption = processor.decode(output[0], skip_special_tokens=True)

        return caption

    def _arun(self, query: str):
        raise NotImplementedError("This tool does not support async")


class ObjectDetectionTool(BaseTool):
    name: str = "object_detector"
    description: str = (
        "Use this tool when given the path to an image that you would like to detect objects. "
        "It will return a list of all detected objects. Each element in the list is in the format: "
        "[x1, y1, x2, y2] class_name confidence_score."
    )

    def _run(self, img_path: str) -> str:
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

    def _arun(self, query: str):
        raise NotImplementedError("This tool does not support async")


def extract_json_from_text(text: str) -> Dict[str, Any]:
    """
    Extract JSON object from text, handling various formats including code blocks.
    
    Args:
        text (str): Text that may contain JSON
        
    Returns:
        Dict[str, Any]: Extracted JSON as dictionary, or empty dict if extraction fails
    """
    # Try to extract JSON from markdown code blocks first
    code_block_pattern = r"```(?:json)?\s*([\s\S]*?)```"
    code_matches = re.findall(code_block_pattern, text)
    
    for match in code_matches:
        try:
            # Clean up potential markdown artifacts
            cleaned = match.strip()
            json_obj = json.loads(cleaned)
            return json_obj
        except:
            continue
    
    # Try to find JSON object by matching braces
    try:
        start_idx = text.find('{')
        end_idx = text.rfind('}') + 1
        
        if start_idx >= 0 and end_idx > 0:
            json_str = text[start_idx:end_idx]
            return json.loads(json_str)
    except:
        pass
    
    # Try to find JSON-like structure in the regular text
    diagnosis = []
    causes = []
    remedies = []
    
    if "diagnosis" in text.lower():
        diagnosis_start = text.lower().find("diagnosis")
        next_section = min(x for x in [
            text.lower().find("causes", diagnosis_start),
            text.lower().find("remedies", diagnosis_start),
            text.lower().find("cure", diagnosis_start),
            len(text)
        ] if x > 0)
        
        diagnosis_text = text[diagnosis_start:next_section]
        diagnosis = [line.strip() for line in diagnosis_text.split('\n') if line.strip() and not line.lower().startswith("diagnosis")]
    
    if "causes" in text.lower():
        causes_start = text.lower().find("causes")
        next_section = min(x for x in [
            text.lower().find("remedies", causes_start),
            text.lower().find("cure", causes_start),
            len(text)
        ] if x > 0)
        
        causes_text = text[causes_start:next_section]
        causes = [line.strip() for line in causes_text.split('\n') if line.strip() and not line.lower().startswith("causes")]
    
    if "remedies" in text.lower() or "cure" in text.lower():
        remedies_start = max(text.lower().find("remedies"), text.lower().find("cure"))
        if remedies_start >= 0:
            remedies_text = text[remedies_start:]
            remedies = [line.strip() for line in remedies_text.split('\n') if line.strip() 
                        and not line.lower().startswith("remedies") and not line.lower().startswith("cure")]
    
    # Return structured data if we found anything
    if diagnosis or causes or remedies:
        return {
            "possible_diagnosis": diagnosis,
            "causes": causes,
            "remedies_or_cure": remedies
        }
    
    # If all else fails, return default structure
    return {
        "possible_diagnosis": ["Unable to determine diagnosis"],
        "causes": ["Unable to determine causes"],
        "remedies_or_cure": ["Unable to determine remedies"],
        "raw_response": text
    }


def process_plant_disease_image(
    image_path: str, 
    disease_symptoms: Optional[str] = None,
    image_dir: str = "images/"
) -> Dict[str, Any]:
    """
    Process an image for plant disease detection and return a structured JSON response.
    
    Args:
        image_path (str): Name of the image file (will be joined with image_dir)
        disease_symptoms (str, optional): Description of disease symptoms
        image_dir (str, optional): Directory where images are stored. Defaults to "images/".
    
    Returns:
        Dict[str, Any]: A JSON-formatted dictionary with diagnosis, causes, and remedies
    """
    # Load environment variables and API key
    load_dotenv()
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key is None:
        raise ValueError("API Key not set. Please set the OPENAI_API_KEY environment variable.")

    # Full path to the image
    full_image_path = os.path.join(image_dir, image_path)
    
    # Validate image exists
    if not os.path.exists(full_image_path):
        return {
            "success": False,
            "error": f"Image not found at path: {full_image_path}",
            "image_path": image_path,
            "possible_diagnosis": [],
            "causes": [],
            "remedies_or_cure": []
        }

    # Default symptoms if not provided
    if disease_symptoms is None:
        disease_symptoms = """Disease Symptoms
1. Wet-looking, dark patches appear on leaves, usually starting from the edges.
2. A white, cotton-like layer may grow on the underside of leaves when it's humid."""

    # Create tools
    tools = [
        Tool(
            name="image_captioner",
            func=lambda img_path: ImageCaptionTool()._run(img_path),
            description="Use this tool when given the path to an image that you would like to be described."
        ),
        Tool(
            name="object_detector",
            func=lambda img_path: ObjectDetectionTool()._run(img_path),
            description="Use this tool when given the path to an image that you would like to detect objects."
        )
    ]

    # Initialize the ChatOpenAI model with more strict temperature
    llm = ChatOpenAI(
        model="gpt-4o",
        temperature=0.2,  # Lower temperature for more consistent output
        api_key=api_key
    )

    # Create a simpler approach without complicated chat templates
    try:
        # First, get the image description
        image_caption = ImageCaptionTool()._run(full_image_path)
        object_detection = ObjectDetectionTool()._run(full_image_path)
        
        # Create a simple prompt that directly asks for the required JSON format
        prompt = f"""You are a plant disease diagnosis expert. Analyze the following information about a plant image:

IMAGE CAPTION: {image_caption}

OBJECT DETECTION: {object_detection}

DISEASE SYMPTOMS:
{disease_symptoms}

Based on this information, provide your diagnosis in this exact JSON format:
{{
    "possible_diagnosis": ["Diagnosis 1", "Diagnosis 2"],
    "causes": ["Cause 1", "Cause 2"],
    "remedies_or_cure": ["Remedy 1", "Remedy 2"]
}}

Return only the valid JSON with no additional text or formatting."""

        # Get response from the model directly without using an agent
        response = llm.invoke(prompt)
        
        # Extract the content from the response
        content = response.content
        
        # Parse the JSON from the response
        result = extract_json_from_text(content)
        
        # Add metadata
        result["image_path"] = image_path
        result["success"] = True
        
        return result
        
    except Exception as e:
        error_message = str(e)
        return {
            "success": False,
            "error": error_message,
            "image_path": image_path,
            "possible_diagnosis": [],
            "causes": [],
            "remedies_or_cure": []
        }


async def process_uploaded_image(file_path: str, symptoms: Optional[str] = None) -> Dict[str, Any]:
    """
    Process an uploaded image for disease detection. This function is designed to be used in a FastAPI app.
    
    Args:
        file_path (str): Path to the uploaded image file
        symptoms (str, optional): Description of disease symptoms
        
    Returns:
        Dict[str, Any]: JSON response with diagnosis information
    """
    try:
        # Use the processing function with the file path directly
        # Note: we're not using image_dir here since we have the full path
        result = process_plant_disease_image(
            image_path=file_path,
            disease_symptoms=symptoms,
            image_dir=""  # Empty string because file_path is already the full path
        )
        return result
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "image_path": file_path,
            "possible_diagnosis": [],
            "causes": [],
            "remedies_or_cure": []
        }