import os
import json
import requests
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# AI Imports
from pinecone import Pinecone
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.llms import HuggingFaceEndpoint

from langchain_community.vectorstores import Pinecone as LangChainPinecone
from langchain_text_splitters import RecursiveCharacterTextSplitter
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

# --- CONFIGURATION ---
GITHUB_GRAPHQL_API = "https://api.github.com/graphql"
INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")
HF_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")

# Initialize Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# 1. Embeddings (Runs locally, free)
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# 2. LLM (Runs on Hugging Face Cloud, free tier)
llm = HuggingFaceEndpoint(
    repo_id="HuggingFaceH4/zephyr-7b-beta",
    task="text-generation",
    max_new_tokens=512,
    top_k=30,
    temperature=0.1,
    huggingfacehub_api_token=HF_TOKEN
)

# --- HELPER: GitHub Fetcher (Python Version) ---
def fetch_github_data():
    # Load roster config
    try:
        with open("../roster-portfolio/src/roster_config.json", "r", encoding='utf-8') as f:
            config = json.load(f)
    except FileNotFoundError:
        # Fallback if running from different directory
        with open("roster-portfolio/src/roster_config.json", "r", encoding='utf-8') as f:
            config = json.load(f)

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
        LangChainPinecone.from_texts(
            texts=texts, 
            embedding=embeddings, 
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
        vectorstore = LangChainPinecone.from_existing_index(
            index_name=INDEX_NAME, 
            embedding=embeddings
        )
        
        # Retrieve relevant documents
        retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
        docs = retriever.get_relevant_documents(request.message)
        
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
        response = llm.invoke(prompt)
        
        return {"response": response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)