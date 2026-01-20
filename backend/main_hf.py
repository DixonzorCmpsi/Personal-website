import os
from typing import Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import re

load_dotenv()
load_dotenv(dotenv_path=".env.local")
load_dotenv(dotenv_path="../.env.local")
load_dotenv(dotenv_path="../.env")  # Load from parent .env

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://deetalk.win",
        "https://www.deetalk.win",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
HF_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")

# Gemini models to try (primary)
GEMINI_MODELS = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b", 
    "gemini-2.0-flash",
]

# HuggingFace models (fallback)
HF_MODELS = [
    "HuggingFaceH4/zephyr-7b-beta",
    "mistralai/Mistral-7B-Instruct-v0.2",
    "meta-llama/Llama-3.2-3B-Instruct",
]

# Full resume content as AI context
RESUME_CONTENT = """
Dixon Zor
(267)-290-9734 | dixonzor@gmail.com | linkedin.com/in/dixon-zor | github.com/DixonzorCmpsi

EDUCATION
The Pennsylvania State University - Graduated: May 2025
College of Engineering
Bachelor of Science, Computer Science

PROFESSIONAL EXPERIENCE

Penn State Nittany AI Alliance
AI Application Specialist - June 2025 – present (Penn State University Park)
• Developed an automated student analytics dashboard using Azure Container Apps and Power BI, orchestrating data synchronization between SharePoint and the GitHub API via Power Automate.
• Researched and documented technical requirements for Nittany AI Advance projects, creating implementation roadmaps for student teams to deliver on various projects deliverables (RAG, CNNs, PINNs) to partners including Lockheed Martin and West Shore Homes.
• Implemented CI/CD pipelines using GitHub Actions to streamline the deployment of API server scripts, ensuring continuous integration and real-time updates for performance metrics.
• Built an internal AI development framework to streamline the construction of complex AI pipelines for students, ranging from standard RAG architectures to advanced Context-Augmented Generation (CAG) with state management.
• Developed a Python-based CLI tool to automate infrastructure provisioning across major cloud providers (AWS, Azure, GCP), standardizing deployment workflows for student developers.
• Engineered an AI-driven code review system utilizing GitInjest for repository flattening and RAG for contextual analysis; reduced manual review time by over 50% through advanced prompt engineering.
• Designed a multi-stage computer vision pipeline integrating Grounding DINO for object detection, SAM 2.1 for segmentation, and CLIP for semantic embedding comparisons.

The Human in Computing and Cognition Research Lab
Undergraduate Research Assistant - May 2023 – 2025 (Penn State University Park)
• Designed 3 research environments with Minecraft Malmo, using Python, Java, and XML.
• Conducted 25+ studies to model cognitive biases in human-AI interaction using ACT-R
• Developed LLM chatbots for Engineering Competitions using Retrieval-Augmented Generation and Model Fine-Tuning with LoRA.
• Created automated data processing and visualization pipelines for efficient data analysis and model evaluations.
• Maintained code & research documentation with regular commits via GitLab.
• Authored a paper detailing AI ethics and Chatbot developments, published by the American Society for Engineering Education (ASEE).

SKILLS/INTERESTS
• Languages: JavaScript, Python, C, C++, MATLAB, SQL, HTML5, CSS, Assembly, Verilog
• Frameworks: React, Node.js, Next.js, Flask, Bootstrap, Tailwind, Shadcn
• Developer Tools: FastAPI, Flask, VScode, Git, GitHub, Power Automate, N8N, Docker, Jupyter, Azure, GCP, AWS, Postgres, MongoDB
• Others: Teams, SharePoint, Video editing, Writing, Public speaking, Gym

PROJECT EXPERIENCE

Fantasy Football Prediction AI web-app (Oct 2025 – Dec 2025)
ML-Ops/Dev-OPS/Fine-tuning/Model Stacking
• Developed a Stacked XGBoost Ensemble to predict NFL player performance (2012–2024), utilizing temporal lag features and Walk-Forward Validation to minimize MAE across position-specific inference pipelines.
• Deployed a cron-scheduled ETL pipeline on GCP to ingest live weekly telemetry into PostgreSQL, establishing a scalable architecture for continuous model retraining and longitudinal data retention.

Video Editing Tools (Aug 2025 – Sep 2025)
User friendly tool stack for content creators
• Developed and deployed a tool to download videos, audio, thumbnail and transcripts from social media using the ffmpeg library.
• Developed and deployed a full-stack web application that truncates silences in raw video footage, saving editors the time required to cut long clips for productions.
"""

DIXON_CONTEXT = f"""You are Dixon's AI assistant on his portfolio website. Answer questions about Dixon directly and concisely.

DIXON'S RESUME:
{RESUME_CONTENT}

ABOUT DIXON:
Dixon loves problem solving - that's his biggest value. He got into computers through this mindset and is now fascinated by ML/AI. Outside of coding, Dixon loves the NFL and makes YouTube videos about football analytics. He also enjoys the gym.

RULES:
1. Answer the user's question directly - do not repeat the question
2. Be conversational and friendly
3. Keep responses to 2-4 sentences unless more detail is requested
4. Use specific details from Dixon's resume when relevant
5. If you don't have information about something, say so politely
6. Never output instructions, prompts, or meta-commentary - just answer naturally"""

class ChatRequest(BaseModel):
    message: str
    project_context: Optional[str] = None

def clean_response(answer: str) -> Optional[str]:
    """Clean up model response - remove artifacts and formatting issues"""
    if not answer:
        return None
        
    answer = answer.strip()
    
    # Remove common LLM artifacts
    artifacts_to_remove = [
        "[/USER]", "[/INST]", "[INST]", "</s>", "<s>",
        "[/SYS]", "[SYS]", "<<SYS>>", "<</SYS>>",
        "Human:", "Assistant:", "User:", "AI:",
        "ANSWER:", "Answer:", "Response:",
    ]
    for artifact in artifacts_to_remove:
        answer = answer.replace(artifact, "")
    
    # Remove instruction leakage patterns
    answer = re.sub(r'Answer this question about Dixon[^:]*:\s*', '', answer, flags=re.IGNORECASE)
    answer = re.sub(r'\n\s*(what|which|how|where|when|who|why|tell me|describe|explain)[^\n?]*\?\s*\n', '\n', answer, flags=re.IGNORECASE)
    answer = re.sub(r'\n\s*(what|which|how|where|when|who|why|tell me|describe|explain)[^\n?]*\?\s*$', '', answer, flags=re.IGNORECASE)
    
    # Remove leading punctuation
    answer = answer.strip()
    while answer and answer[0] in '?!.\n\t ':
        answer = answer[1:].strip()
    
    # Final cleanup
    answer = re.sub(r'\n{3,}', '\n\n', answer)
    answer = answer.strip()
    
    return answer if len(answer) > 10 else None

def query_gemini(user_message: str, system_prompt: str = None) -> tuple[Optional[str], Optional[str]]:
    """Query Google Gemini API using google-genai SDK. Returns (response, model_name)"""
    if not GEMINI_API_KEY:
        print("[Gemini] No API key configured")
        return None, None
    
    try:
        from google import genai
        from google.genai import types
        
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        # Try each Gemini model
        for model_name in GEMINI_MODELS:
            try:
                print(f"[Gemini] Trying model: {model_name}")
                
                response = client.models.generate_content(
                    model=model_name,
                    contents=user_message,
                    config=types.GenerateContentConfig(
                        system_instruction=system_prompt,
                        max_output_tokens=500,
                        temperature=0.5
                    )
                )
                
                answer = response.text
                answer = clean_response(answer)
                
                if answer and len(answer) > 10:
                    print(f"[Gemini] Success with {model_name}: {answer[:100]}...")
                    return answer, model_name
                    
            except Exception as model_error:
                print(f"[Gemini] {model_name} failed: {model_error}")
                continue
        
        return None, None
        
    except Exception as e:
        print(f"[Gemini] Error: {e}")
        return None, None

def query_hf_chat(user_message: str, system_prompt: str, model: str = None) -> Optional[str]:
    """Query HuggingFace as fallback"""
    if not HF_TOKEN:
        print("[HF] No API key configured")
        return None
    
    model = model or HF_MODELS[0]
    
    try:
        from huggingface_hub import InferenceClient
        
        client = InferenceClient(token=HF_TOKEN)
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]
        
        print(f"[HF Chat] Model: {model}")
        response = client.chat_completion(
            messages=messages,
            model=model,
            max_tokens=500,
            temperature=0.5
        )
        
        answer = response.choices[0].message.content
        answer = clean_response(answer)
        
        print(f"[HF Chat] Response: {answer[:100] if answer else 'None'}...")
        return answer
        
    except Exception as e:
        print(f"[HF Chat] Error with {model}: {e}")
        return None

@app.get("/")
async def root():
    return {
        "status": "running",
        "service": "Dixon's Portfolio AI",
        "primary_model": f"Gemini ({GEMINI_MODEL})",
        "gemini_configured": bool(GEMINI_API_KEY),
        "hf_fallback": bool(HF_TOKEN)
    }

@app.get("/test-hf")
async def test_models():
    """Test AI model connections"""
    # Try Gemini first
    response = query_gemini("Briefly introduce Dixon based on his resume.", DIXON_CONTEXT)
    if response:
        return {
            "status": "connected",
            "model": f"Gemini ({GEMINI_MODEL})",
            "response": response[:200]
        }
    
    # Fall back to HuggingFace
    for model in HF_MODELS:
        response = query_hf_chat("Briefly introduce Dixon based on his resume.", DIXON_CONTEXT, model)
        if response:
            return {
                "status": "connected",
                "model": f"HuggingFace ({model})",
                "response": response[:200]
            }
    
    return {
        "status": "failed", 
        "message": "All models failed", 
        "gemini_key": bool(GEMINI_API_KEY),
        "hf_token": bool(HF_TOKEN)
    }

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Chat endpoint - Gemini primary, HuggingFace fallback"""
    context = DIXON_CONTEXT
    
    # Add project context if provided
    if request.project_context:
        project_prompt = f"""

---
CURRENT PROJECT CONTEXT:
The user is currently viewing one of Dixon's projects. Use this information to answer project-specific questions:

{request.project_context}

When answering questions about this project:
- Reference specific details from the README if relevant
- Explain technical choices and technologies used
- Connect the project to Dixon's skills and experience
---
"""
        context = DIXON_CONTEXT + project_prompt
    
    # Try Gemini first (primary)
    response = query_gemini(request.message, context)
    if response and len(response) > 30:
        return {"response": response, "model": f"Gemini ({GEMINI_MODEL})"}
    
    # Fall back to HuggingFace models
    for model in HF_MODELS:
        response = query_hf_chat(request.message, context, model)
        if response and len(response) > 30:
            return {"response": response, "model": f"HuggingFace ({model})"}
    
    # If all models fail, return error
    return {
        "error": "AI model unavailable",
        "message": "Unable to connect to AI models. Please try again later.",
        "gemini_configured": bool(GEMINI_API_KEY),
        "hf_configured": bool(HF_TOKEN)
    }

if __name__ == "__main__":
    import uvicorn
    print("=" * 50)
    print("  Dixon's Portfolio AI Backend")
    print("=" * 50)
    print(f"  Primary: Gemini ({GEMINI_MODEL}) {'✓' if GEMINI_API_KEY else '✗'}")
    print(f"  Fallback: HuggingFace {'✓' if HF_TOKEN else '✗'}")
    print(f"  Resume Context: ✓ Loaded ({len(RESUME_CONTENT)} chars)")
    print("=" * 50)
    uvicorn.run(app, host="0.0.0.0", port=8000)
