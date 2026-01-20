import os
from typing import Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()
load_dotenv(dotenv_path=".env.local")
load_dotenv(dotenv_path="../.env.local")

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

HF_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")

# Models to try (chat-compatible)
MODELS = [
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

DIXON_CONTEXT = f"""You are a helpful AI assistant for Dixon Zor's portfolio website. Your job is to answer questions about Dixon clearly and concisely.

DIXON'S INFORMATION:
{RESUME_CONTENT}

PERSONALITY & INTERESTS:
Dixon loves problem solving - that's his biggest value. He got into computers through this mindset and is now fascinated by ML/AI. Outside of coding, Dixon loves the NFL and makes YouTube videos about football analytics! He also enjoys the gym.

INSTRUCTIONS:
- Answer questions directly about Dixon based on the information above
- Be conversational and friendly
- Keep responses concise but informative (2-4 sentences unless asked for more detail)
- If asked about something not in Dixon's info, politely say you don't have that information
- Always provide specific details from his resume when relevant"""

class ChatRequest(BaseModel):
    message: str
    project_context: Optional[str] = None

def query_hf_chat(user_message: str, system_prompt: str = DIXON_CONTEXT, model: str = MODELS[0]) -> Optional[str]:
    """Query HF using chat_completion API"""
    try:
        from huggingface_hub import InferenceClient
        
        client = InferenceClient(token=HF_TOKEN)
        
        # Add explicit instruction to the user message
        enhanced_message = f"Answer this question about Dixon: {user_message}"
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": enhanced_message}
        ]
        
        print(f"[HF Chat] Model: {model}")
        response = client.chat_completion(
            messages=messages,
            model=model,
            max_tokens=500,
            temperature=0.5  # Lower for more focused responses
        )
        
        answer = response.choices[0].message.content
        
        # Clean up the response - remove common model artifacts
        answer = answer.strip()
        
        # Remove common LLM artifacts
        artifacts_to_remove = [
            "[/USER]", "[/INST]", "[INST]", "</s>", "<s>",
            "[/SYS]", "[SYS]", "<<SYS>>", "<</SYS>>",
            "Human:", "Assistant:", "User:", "AI:",
            "Answer:", "Response:"
        ]
        for artifact in artifacts_to_remove:
            answer = answer.replace(artifact, "")
        
        # Remove leading/trailing punctuation artifacts
        answer = answer.strip()
        while answer and answer[0] in '?!.\n\t ':
            answer = answer[1:].strip()
        
        # Remove any incomplete sentences at the end
        if answer and not answer[-1] in '.!?':
            last_period = max(answer.rfind('.'), answer.rfind('!'), answer.rfind('?'))
            if last_period > len(answer) // 2:
                answer = answer[:last_period + 1]
        
        # Final cleanup
        answer = answer.strip()
        
        print(f"[HF Chat] Response: {answer[:100]}...")
        return answer if len(answer) > 10 else None
        
    except Exception as e:
        print(f"[HF Chat] Error with {model}: {e}")
        return None

@app.get("/")
async def root():
    return {
        "status": "running",
        "service": "Dixon's Portfolio AI",
        "hf_token": bool(HF_TOKEN),
        "primary_model": MODELS[0]
    }

@app.get("/test-hf")
async def test_hf():
    """Test Hugging Face connection"""
    for model in MODELS:
        response = query_hf_chat("Briefly introduce Dixon based on his resume.", model=model)
        if response:
            return {
                "status": "connected",
                "model": model,
                "response": response[:200]
            }
    
    return {"status": "failed", "message": "All models failed", "hf_token": bool(HF_TOKEN)}

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Chat endpoint - returns error if model fails"""
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
    
    # Try all available models
    for model in MODELS:
        response = query_hf_chat(request.message, system_prompt=context, model=model)
        if response and len(response) > 30:
            return {"response": response, "model": model}
    
    # If all models fail, return error
    return {
        "error": "AI model unavailable",
        "message": "Unable to connect to AI models. Please check HF_TOKEN or try again later.",
        "hf_token_configured": bool(HF_TOKEN)
    }

if __name__ == "__main__":
    import uvicorn
    print("=" * 50)
    print("  Dixon's Portfolio AI Backend")
    print("=" * 50)
    print(f"  HF Token: {'✓ Configured' if HF_TOKEN else '✗ Missing'}")
    print(f"  Primary Model: {MODELS[0]}")
    print(f"  Resume Context: ✓ Loaded ({len(RESUME_CONTENT)} chars)")
    print("=" * 50)
    uvicorn.run(app, host="0.0.0.0", port=8000)
