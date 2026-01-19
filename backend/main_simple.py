import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env.local")

app = FastAPI()

# Allow Next.js (port 3000) to talk to Python (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dixon's profile context
DIXON_CONTEXT = """Dixon Zor is a Computer Science graduate from Pennsylvania State University.

Experience:
- AI Application Specialist at Penn State Nittany AI Alliance (June 2025 – Present)
  * Architected automated student analytics dashboards using Azure Container Apps and Power BI
  * Engineered internal AI development frameworks for RAG and Context-Augmented Generation (CAG)
  * Automated cross-cloud infrastructure (AWS, Azure, GCP) using custom Python CLI
  * Developed AI-driven code review system, reducing manual overhead by 50%

- Research Assistant at Human in Computing and Cognition Lab (2023 – 2025)
  * Modeled cognitive biases in human-AI interaction using ACT-R and Minecraft Malmo
  * Developed RAG-based chatbots with LoRA fine-tuning for engineering competitions
  * Authored peer-reviewed research on AI Ethics for ASEE

Education:
- Bachelor of Science in Computer Science from Pennsylvania State University (2021-2025)
- GPA: 3.5
- Dean's List (Multiple Semesters)

Skills:
- Languages: JavaScript, Python, C, C++, MATLAB, SQL, HTML5, CSS
- Frameworks: React, Node.js, Next.js, Flask, Bootstrap, Tailwind, Shadcn
- Tools: FastAPI, VSCode, Git, GitHub, Docker, Azure, GCP, AWS
- Interests: Machine Learning, AI Ethics, NFL Analytics, Gym, YouTube

About Dixon:
Dixon loves problem solving and is fascinated by machine learning and AI. He enjoys the gym and makes YouTube videos about the NFL."""

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Simple rule-based chatbot for Dixon's portfolio"""
    message = request.message.lower()
    
    # Simple keyword-based responses
    if "experience" in message or "work" in message or "job" in message:
        return {"response": "Dixon has great experience! He's currently an AI Application Specialist at Penn State Nittany AI Alliance where he architects automated dashboards and develops AI frameworks. Previously, he was a Research Assistant working on cognitive biases in human-AI interaction and RAG-based chatbots."}
    
    elif "education" in message or "school" in message or "university" in message:
        return {"response": "Dixon graduated from Pennsylvania State University with a Bachelor of Science in Computer Science (2021-2025) with a 3.5 GPA. He made the Dean's List multiple semesters and took courses in Machine Learning, AI Ethics, Data Structures, and Algorithms."}
    
    elif "skill" in message or "technology" in message or "language" in message:
        return {"response": "Dixon is proficient in JavaScript, Python, C, C++, MATLAB, SQL, HTML5, and CSS. He works with frameworks like React, Next.js, Flask, and Tailwind. He's experienced with cloud platforms (Azure, GCP, AWS) and tools like Docker, Git, and FastAPI."}
    
    elif "project" in message:
        return {"response": "Dixon has built several impressive projects including this VS Code-themed portfolio website, Football AI analytics tools, and LLM chatbots. Check out his GitHub to see more!"}
    
    elif "hobby" in message or "interest" in message or "nfl" in message or "gym" in message:
        return {"response": "Beyond coding, Dixon is passionate about the NFL and even makes YouTube videos about football analytics! He also loves hitting the gym and staying active. His interests include Machine Learning, AI Ethics, and NFL Analytics."}
    
    elif "hello" in message or "hi" in message or "hey" in message:
        return {"response": "Hi! I'm Dixon's AI assistant. I can tell you about his experience, education, skills, projects, and interests. What would you like to know?"}
    
    else:
        return {"response": f"Great question! Dixon is a Computer Science graduate from Penn State with experience in AI development and cloud infrastructure. He's passionate about machine learning, AI ethics, and NFL analytics. Would you like to know more about his experience, education, skills, or projects?"}

@app.get("/")
async def root():
    return {"message": "Dixon's Portfolio API is running!", "status": "online"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
