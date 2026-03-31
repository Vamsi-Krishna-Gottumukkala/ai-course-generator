from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from duckduckgo_search import DDGS
from youtube_search import YoutubeSearch
import wikipedia
import requests
from bs4 import BeautifulSoup
import asyncio
from google import genai
from google.genai import types
from sklearn.tree import DecisionTreeClassifier
import numpy as np
import numpy as np
import json
import urllib.parse

load_dotenv()

# Download NLTK data required for tokenization
nltk.download('punkt', quiet=True)
nltk.download('punkt_tab', quiet=True)
nltk.download('stopwords', quiet=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# ML ENGINE (Decision Tree for Adaptive Learning)
# ---------------------------------------------------------
# Features: [score_percentage, previous_attempts]
# Labels: 0 (Remedial), 1 (Advance)
X_train = np.array([
    [40, 1], [30, 2], [45, 1], [50, 3], # Fail scenarios
    [85, 1], [90, 1], [75, 2], [95, 1], # Pass scenarios
    [65, 1], [70, 2] # Borderline pass
])
y_train = np.array([0, 0, 0, 0, 1, 1, 1, 1, 1, 1])

clf = DecisionTreeClassifier(random_state=42)
clf.fit(X_train, y_train)

# ---------------------------------------------------------
# API MODELS
# ---------------------------------------------------------
class CourseRequest(BaseModel):
    topic: str
    level: str
    goals: Optional[str] = None
    duration: Optional[str] = "1 Week"
    mode: Optional[str] = "Text Only"

class QuizEvalRequest(BaseModel):
    score_percentage: float
    previous_attempts: int

class KeywordRequest(BaseModel):
    text: str

class VideoSearchRequest(BaseModel):
    query: str

# ---------------------------------------------------------
# UTILS
# ---------------------------------------------------------
def extract_keywords(text: str) -> List[str]:
    stop_words = set(stopwords.words('english'))
    word_tokens = word_tokenize(text)
    keywords = [w.lower() for w in word_tokens if not w.lower() in stop_words and w.isalnum()]
    return list(set(keywords))

def scrape_text_from_url(url: str) -> str:
    try:
        response = requests.get(url, timeout=5)
        soup = BeautifulSoup(response.content, 'html.parser')
        paragraphs = soup.find_all('p')
        text = ' '.join([p.get_text() for p in paragraphs])
        return text[:3000] # Limit chunk size to avoid massive prompts token explosion
    except:
        return ""

def web_rag_search(query: str) -> str:
    print(f"Executing RAG Search for: {query}")
    context_text = ""
    # 1. Try Wikipedia first for educational topics (it's fast and reliable)
    try:
        wiki_results = wikipedia.search(query, results=1)
        if wiki_results:
            page = wikipedia.page(wiki_results[0], auto_suggest=False)
            context_text += f"\nWikipedia Source ({page.title}):\n{page.summary}\n"
            # Get a bit more content to make the RAG useful
            if len(page.content) > len(page.summary):
                context_text += page.content[len(page.summary):2000] + "...\n"
    except Exception as e:
        print(f"Wikipedia search failed: {e}")

    # 2. Try DuckDuckGo
    if not context_text:
        try:
            with DDGS(timeout=5) as ddgs:
                results = list(ddgs.text(query, max_results=2))
            
            for res in results:
                url = res.get('href')
                scraped = scrape_text_from_url(url)
                if scraped:
                    context_text += f"\nSource ({url}):\n{scraped}\n"
        except Exception as e:
            print(f"DDG Search failed or timed out: {e}")
            
    return context_text

# ---------------------------------------------------------
# ROUTES
# ---------------------------------------------------------

@app.post("/extract-keywords")
async def get_keywords(req: KeywordRequest):
    return {"keywords": extract_keywords(req.text)}

@app.post("/evaluate-quiz")
async def evaluate_quiz(req: QuizEvalRequest):
    # Use Decision Tree to predict (0 = Remedial, 1 = Advance)
    prediction = clf.predict([[req.score_percentage, req.previous_attempts]])[0]
    result = "Advance" if prediction == 1 else "Remedial"
    
    return {
        "score": req.score_percentage,
        "recommendation": result,
        "message": "Focus on Weak Areas. Take a simplified remedial lesson." if result == "Remedial" else "Great work! You are ready for the advanced module."
    }

@app.post("/get-rag-context")
async def get_rag_context(req: CourseRequest):
    # 1. NLP Keyword extraction
    keywords = extract_keywords(req.topic)
    search_query = " ".join(keywords) + " educational tutorial"
    
    # 2. Web RAG Search (with strict fallback timeout)
    try:
        loop = asyncio.get_event_loop()
        rag_context = await asyncio.wait_for(
            loop.run_in_executor(None, web_rag_search, search_query),
            timeout=5.0
        )
    except asyncio.TimeoutError:
        print("Web RAG Search timed out. Proceeding without web context.")
        rag_context = ""
    except Exception as e:
        print(f"Web RAG Search exception: {e}")
        rag_context = ""

    return {"context": rag_context}

@app.get("/search-video")
async def search_video(query: str):
    try:
        print(f"Executing YoutubeSearch fallback for: {query}")
        # Run synchronous web scraper asynchronously so it doesn't block FastAPI
        import asyncio
        loop = asyncio.get_event_loop()
        def perform_search():
            return YoutubeSearch(query, max_results=1).to_dict()
            
        results = await loop.run_in_executor(None, perform_search)
        
        if results and len(results) > 0:
            video_id = results[0].get("id")
            if video_id:
                return {"videos": [{"videoId": video_id, "url": f"https://youtube.com/watch?v={video_id}"}]}
                
    except Exception as e:
        print(f"Video Search exception: {e}")
        
    return {"videos": []}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
