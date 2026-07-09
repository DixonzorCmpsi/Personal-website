
import os
from typing import Optional
from fastapi import FastAPI, Header, HTTPException
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
CHAT_PROXY_SECRET = os.getenv("CHAT_PROXY_SECRET")

def verify_chat_proxy_secret(x_chat_proxy_secret: Optional[str]) -> None:
    if CHAT_PROXY_SECRET and x_chat_proxy_secret != CHAT_PROXY_SECRET:
        raise HTTPException(status_code=403, detail="Chat must be accessed through the portfolio proxy.")

# Ollama Cloud (primary inference provider) — OpenAI-compatible endpoint, same
# credentials RadAgents uses. gpt-oss by default.
OLLAMA_CLOUD_API_KEY = os.getenv("OLLAMA_CLOUD_API_KEY")
OLLAMA_CLOUD_URL = os.getenv("OLLAMA_CLOUD_URL", "https://ollama.com")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gpt-oss:120b")

# Gemini models to try (fallback)
GEMINI_MODELS = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-2.0-flash",
]
GEMINI_MODEL = GEMINI_MODELS[0]  # label used by the status endpoints

# HuggingFace models (fallback)
HF_MODELS = [
    "HuggingFaceH4/zephyr-7b-beta",
    "mistralai/Mistral-7B-Instruct-v0.2",
    "meta-llama/Llama-3.2-3B-Instruct",
]

# Full resume content as AI context
RESUME_CONTENT = """
Dixon Zor
State College, PA | (267) 290-9734 | dixonzor@gmail.com | linkedin.com/in/dixon-zor | github.com/DixonzorCmpsi

SUMMARY
AI Software Engineer building production ML systems from data pipelines and model development to cloud deployment. Experienced in applied ML, LLMs, computer vision, and agentic workflows that automate operations and drive measurable business outcomes.

EDUCATION
The Pennsylvania State University, University Park, PA
Master of Science in Artificial Intelligence (World Campus), Expected May 2028
Bachelor of Science in Computer Science, College of Engineering, Graduated May 2025

EXPERIENCE

Radians Per Second Squared (Applied-AI consultancy), State College, PA
AI Software Engineer (March 2026 – Present)
• Migrated a client from Excel to an AI-powered iOS platform, recovering $20K+/month in uncaptured revenue.
• Led rollout across 10+ field and office staff, replacing spreadsheets with AI-driven daily operations.
• Reduced equipment downtime ~30 hrs/month with an Isolation Forest anomaly-detection pipeline.
• Applied PCA/SVD and K-means to prioritize the highest-risk ~10% of assets for preventive maintenance.
• Delivered 3 production AI apps powering agentic workflows and daily ML automation in TypeScript, Python.
• Built an internal client operations portal for 3+ clients, reducing management overhead by 10+ hrs/week.

Penn State Nittany AI Alliance, University Park, PA
AI Application Specialist (June 2025 – March 2026)
• Launched a full-stack AI platform (BAML) that coached 150+ students through a $20K coding competition.
• Automated 90% of onboarding with a 3-step CV pipeline (Grounding DINO, CLIP, SAM, OpenCV).
• Compressed code-review time 75% with gitingest + DSPy workflows triaging 100+ codebases to 40.
• Reduced deployment setup from 2 hrs to ~20 min via an internal CLI tool for Azure/AWS.
• Hardened 5+ codebases/semester with OWASP, secrets scanning, RBAC, and prompt-injection reviews.
• Directed weekly engagements for 5+ clients including Lockheed Martin, John Deere, and Penn State OPP.

The Human in Computing and Cognition Research Lab, University Park, PA
Undergraduate Research Assistant (May 2023 – May 2025)
• Designed 3 Minecraft Malmo environments (Python, Java, XML) for controlled human-AI interaction studies.
• Conducted 25+ studies modeling cognitive biases in human-AI interaction with the ACT-R architecture.
• Fine-tuned a T5 model with LoRA, benchmarked vs RAG, and presented findings to 50+ at PSU Hackathon.
• Built 3 reproducible pandas/NumPy/scikit-learn pipelines for curation, cleaning, and model evaluation.
• Co-authored a peer-reviewed paper on AI ethics and chatbot development, published by the ASEE.

PROJECTS
Rad Agent | TypeScript, BAML, AWS EKS (2026 – Present)
• Cut feedback-to-code cycle time 75% by auto-routing email feedback into GitHub issues and code PRs.
• Engineered a multi-agent orchestration framework (TypeScript, BAML, inference APIs) on AWS EKS.

Fantasy Football Prediction AI Web-App | Python, XGBoost, GCP, PostgreSQL (Oct 2025 – Present)
• Hand-coded and trained 4 position-specific XGBoost models on curated NFL data with walk-forward splits.
• Automated a weekly GCP ETL pipeline retraining models on fresh results to match ESPN's fantasy predictions.

TECHNICAL SKILLS
Languages: Python, TypeScript, JavaScript, Swift, SQL, C/C++
ML & AI: PyTorch, Hugging Face, scikit-learn, XGBoost, LoRA fine-tuning, RAG, PCA/SVD, K-means, CLIP, SAM
LLM & Agents: LangChain/LlamaIndex, BAML, DSPy, multi-agent orchestration, MCP servers, context engineering
Cloud & DevOps: AWS, Azure, GCP, Docker, Kubernetes, OpenTofu, Ansible, Git, n8n, Okta
Data & Frameworks: data pipelines, PostgreSQL, pgvector, MongoDB, Databricks, FastAPI, Node.js, React, Next.js
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

def query_ollama(user_message: str, system_prompt: str) -> tuple[Optional[str], Optional[str]]:
    """Query Ollama Cloud via its OpenAI-compatible API. Returns (response, model_name)."""
    if not OLLAMA_CLOUD_API_KEY:
        print("[Ollama] No API key configured")
        return None, None

    try:
        import requests

        url = OLLAMA_CLOUD_URL.rstrip("/") + "/v1/chat/completions"
        print(f"[Ollama] Trying model: {OLLAMA_MODEL}")
        resp = requests.post(
            url,
            headers={
                "Authorization": f"Bearer {OLLAMA_CLOUD_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": OLLAMA_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                "max_tokens": 500,
                "temperature": 0.5,
            },
            timeout=60,
        )
        resp.raise_for_status()
        answer = resp.json()["choices"][0]["message"]["content"]
        answer = clean_response(answer)

        if answer and len(answer) > 10:
            print(f"[Ollama] Success with {OLLAMA_MODEL}: {answer[:100]}...")
            return answer, OLLAMA_MODEL
        return None, None

    except Exception as e:
        print(f"[Ollama] Error: {e}")
        return None, None

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
async def chat(request: ChatRequest, x_chat_proxy_secret: Optional[str] = Header(default=None)):
    """Chat endpoint - Gemini primary, HuggingFace fallback"""
    verify_chat_proxy_secret(x_chat_proxy_secret)

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
    
    # Try Ollama Cloud first (primary inference provider)
    response, ollama_model = query_ollama(request.message, context)
    if response and len(response) > 30:
        return {"response": response, "model": f"Ollama ({ollama_model})"}

    # Fall back to Gemini
    response, gemini_model = query_gemini(request.message, context)
    if response and len(response) > 30:
        return {"response": response, "model": f"Gemini ({gemini_model or GEMINI_MODEL})"}

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
