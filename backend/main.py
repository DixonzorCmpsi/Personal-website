import os
print("🚀 BACKEND STARTING...")
import json
import requests
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Try to load env from various potential locations
load_dotenv()
load_dotenv(dotenv_path=".env.local")
load_dotenv(dotenv_path="../.env.local")

app = FastAPI()

# Allow Next.js to talk to Python backend
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

# --- CONFIGURATION ---
GITHUB_GRAPHQL_API = "https://api.github.com/graphql"
INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")
HF_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")

# Global variables for models (lazy loaded)
_embeddings = None
_llm = None

def get_embeddings():
    global _embeddings
    if _embeddings is None:
        print("📥 Importing Embeddings dependencies...")
        from langchain_huggingface import HuggingFaceEmbeddings
        print("📥 Initializing Embeddings...")
        _embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    return _embeddings

def get_llm():
    global _llm
    if _llm is None:
        print("📥 Importing LLM dependencies...")
        from langchain_huggingface import HuggingFaceEndpoint, ChatHuggingFace
        print("📥 Initializing LLM...")
        llm = HuggingFaceEndpoint(
            repo_id="mistralai/Mistral-7B-Instruct-v0.2",
            task="conversational",
            max_new_tokens=512,
            huggingfacehub_api_token=HF_TOKEN
        )
        _llm = ChatHuggingFace(llm=llm)
    return _llm

def get_pinecone_store(index_name, embedding):
    from langchain_pinecone import PineconeVectorStore
    return PineconeVectorStore(index_name=index_name, embedding=embedding)

@app.get("/")
async def root():
    return {"status": "online", "message": "Scout API is active"}

# --- HELPER: GitHub Fetcher (Python Version) ---
def fetch_github_data():
    # Load roster config - try current dir and parent dir
    config_paths = [
        "roster-portfolio/src/roster_config.json",
        "../roster-portfolio/src/roster_config.json",
        "src/roster_config.json"
    ]
    
    config = None
    for path in config_paths:
        try:
            with open(path, "r", encoding='utf-8') as f:
                config = json.load(f)
                break
        except FileNotFoundError:
            continue
            
    if not config:
        raise Exception(f"Could not find roster_config.json in any of {config_paths}")

    username = config['github_username']
    
    # Construct Query
    repo_queries = ""
    for player in config['roster']:
        repo_queries += f"""
        {player['position']}: repository(owner: "{username}", name: "{player['repo_name']}") {{
            name
            description
            url
            object(expression: "main:README.md") {{ ... on Blob {{ text }} }}
        }}
        """

    query = f"""
    query {{
        user(login: "{username}") {{ bio name login }}
        {repo_queries}
    }}
    """

    resp = requests.post(
        GITHUB_GRAPHQL_API,
        json={"query": query},
        headers={"Authorization": f"Bearer {os.getenv('GITHUB_TOKEN')}"}
    )
    
    if resp.status_code != 200:
        raise Exception(f"GitHub API Failed: {resp.text}")
        
    return resp.json()['data'], config['roster']

# --- ENDPOINT 1: INGESTION ---
@app.get("/api/ingest")
async def ingest_data():
    try:
        print("🏈 Scout is retrieving data...")
        data, roster = fetch_github_data()
        
        texts = []
        metadatas = []

        # 1. Process QB (Bio)
        qb = data['user']
        texts.append(f"Candidate: {qb['name']}. Bio: {qb['bio']}")
        metadatas.append({"source": "profile", "type": "bio"})

        # 2. Process Roster (Projects)
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        
        for player in roster:
            repo_data = data.get(player['position'])
            if not repo_data: continue
            
            # Combine description + readme
            readme = repo_data.get('object', {}).get('text', "")
            full_text = f"Project: {player['display_name']}\nDesc: {repo_data['description']}\nReadme: {readme}"
            
            chunks = splitter.split_text(full_text)
            for chunk in chunks:
                texts.append(chunk)
                metadatas.append({
                    "source": player['repo_name'], 
                    "type": "project"
                })

        print(f"🏈 Embedding {len(texts)} plays into the playbook...")
        
        # Upsert to Pinecone via LangChain
        from langchain_pinecone import PineconeVectorStore
        PineconeVectorStore.from_texts(
            texts=texts, 
            embedding=get_embeddings(), 
            index_name=INDEX_NAME,
            metadatas=metadatas
        )
        
        return {"status": "success", "message": f"Ingested {len(texts)} chunks."}

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

# --- ENDPOINT 2: CHAT ---
class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        # Connect to existing index
        vectorstore = get_pinecone_store(INDEX_NAME, get_embeddings())
        
        # Retrieve relevant documents
        retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
        docs = retriever.invoke(request.message)
        
        # Format context from retrieved documents
        context = "\n\n".join([doc.page_content for doc in docs])
        
        # Create prompt with NFL Persona
        prompt = f"""
        You are a savvy NFL Head Coach and Technical Lead. 
        Answer the following question based ONLY on the provided context.
        
        Context: {context}
        
        Question: {request.message}
        
        Answer:
        """
        
        # Get response from LLM
        response = get_llm().invoke(prompt)
        
        # chat model returns a message object, so we need .content
        res_text = response.content if hasattr(response, 'content') else str(response)
        
        return {"response": res_text}

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)