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
        
        # Clean up the response
        answer = answer.strip()
        # Remove any incomplete sentences at the end
        if answer and not answer[-1] in '.!?':
            last_period = max(answer.rfind('.'), answer.rfind('!'), answer.rfind('?'))
            if last_period > len(answer) // 2:
                answer = answer[:last_period + 1]
        
        print(f"[HF Chat] Response: {answer[:100]}...")
        return answer if len(answer) > 10 else None
        
    except Exception as e:
        print(f"[HF Chat] Error with {model}: {e}")
        return None

def fallback_response(msg: str) -> str:
    """Smart fallback when HF unavailable"""
    msg_lower = msg.lower()
    
    if any(w in msg_lower for w in ["experience", "work", "job", "role"]):
        return "Dixon is currently an AI Application Specialist at Penn State Nittany AI Alliance, where he develops automated analytics dashboards using Azure, builds AI frameworks for RAG/CAG, and creates CI/CD pipelines. Previously he was a Research Assistant at the Human in Computing and Cognition Lab studying human-AI interaction and cognitive biases (2023-2025)."
    
    if any(w in msg_lower for w in ["education", "school", "university", "degree", "gpa"]):
        return "Dixon graduated from The Pennsylvania State University, College of Engineering with a Bachelor of Science in Computer Science in May 2025."
    
    if any(w in msg_lower for w in ["skill", "tech", "language", "framework"]):
        return "Dixon's skills include: Languages: JavaScript, Python, C, C++, MATLAB, SQL, Verilog. Frameworks: React, Node.js, Next.js, Flask, Tailwind. Tools: FastAPI, Docker, Azure, GCP, AWS, Postgres, MongoDB. He specializes in ML/AI and RAG systems."
    
    if any(w in msg_lower for w in ["project", "football", "fantasy"]):
        return "Dixon built a Fantasy Football Prediction AI using Stacked XGBoost Ensemble to predict NFL player performance (2012-2024), plus Video Editing Tools including a silence truncator. Check out github.com/DixonzorCmpsi!"
    
    if any(w in msg_lower for w in ["hobby", "interest", "nfl", "gym", "youtube"]):
        return "Dixon loves the NFL and makes YouTube videos about football analytics! He also enjoys the gym, video editing, and public speaking."
    
    if any(w in msg_lower for w in ["hello", "hi", "hey"]):
        return "Hi there! I'm Dixon's AI assistant. I can tell you about his experience at Penn State AI Alliance, his education, skills (Python, React, Cloud, ML), projects (Football AI, Video Tools), or interests. What would you like to know?"
    
    if any(w in msg_lower for w in ["contact", "email", "phone", "linkedin"]):
        return "You can reach Dixon at: Email: dixonzor@gmail.com | Phone: (267)-290-9734 | LinkedIn: linkedin.com/in/dixon-zor | GitHub: github.com/DixonzorCmpsi"
    
    return "Dixon Zor is a CS graduate from Penn State (May 2025), now an AI Application Specialist. He builds AI frameworks, automated systems, and loves NFL analytics. Ask about his experience, skills, projects, or education!"

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
    msg_lower = request.message.lower()
    
    # If project_context is provided, use AI for dynamic summaries (skip keyword fallback)
    if request.project_context:
        context = DIXON_CONTEXT + f"\n\nAdditional context about the project being viewed: {request.project_context}"
        for model in MODELS:
            response = query_hf_chat(request.message, system_prompt=context, model=model)
            if response and len(response) > 30:
                return {"response": response, "model": model}
        # If AI fails, generate a project-specific fallback
        project_name = request.project_context.split("Project: ")[-1].split(".")[0] if "Project:" in request.project_context else "this project"
        return {"response": f"{project_name} is a professional-level project showcasing technical excellence and practical application. Check out the README and GitHub repository for more details!", "model": "project-fallback"}
    
    # For regular chat queries, check for keyword matches - use reliable fallback
    keywords = ["experience", "work", "job", "role", "education", "school", "university", 
                "degree", "skill", "tech", "language", "framework", "project", "football", 
                "fantasy", "hobby", "interest", "nfl", "gym", "youtube", "hello", "hi", 
                "hey", "contact", "email", "phone", "linkedin", "resume", "about", "who"]
    
    if any(w in msg_lower for w in keywords):
        return {"response": fallback_response(request.message), "model": "smart-fallback"}
    
    # For general queries, try HF models
    context = DIXON_CONTEXT
    
    for model in MODELS:
        response = query_hf_chat(request.message, system_prompt=context, model=model)
        if response and len(response) > 30:  # Require longer response
            return {"response": response, "model": model}
    
    # Final fallback
    return {"response": fallback_response(request.message), "model": "fallback"}

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
