from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from typing import Optional
import os
import re
import random
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
import torch
from torch.cuda import is_available as cuda_available

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ========== Configuration ==========
class Config:
    # CHANGED: 'flan-t5-base' is much smarter than 'small' and stops the gibberish.
    MODEL_NAME = os.environ.get("KIDBOT_MODEL", "google/flan-t5-base")
    DEVICE = 0 if cuda_available() else -1
    
    BANNED_WORDS = {
        "sexual": ["sex", "porn", "nude", "naked", "penis", "vagina", "boobs"],
        "violence": ["kill", "murder", "suicide", "stab", "shoot", "blood"],
        "drugs": ["cocaine", "heroin", "meth", "weed", "drugs"],
        "bad_words": ["fuck", "bitch", "shit"] 
    }
    
    ALLOWED_ORIGINS = ["*"]

# ========== Data Models ==========
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    estimated_age: Optional[int] = 7

class ChatResponse(BaseModel):
    reply: str
    is_safe: bool = True

# ========== Managers ==========
class SafetyManager:
    def __init__(self, config: Config):
        self.banned_patterns = []
        for cat, words in config.BANNED_WORDS.items():
            for w in words:
                self.banned_patterns.append(re.compile(rf'\b{re.escape(w)}\b', re.IGNORECASE))

    def is_input_safe(self, text: str) -> bool:
        for p in self.banned_patterns:
            if p.search(text):
                return False
        return True

class ModelManager:
    def __init__(self, config: Config):
        self.config = config
        self.pipeline = None
        self.is_loaded = False

    def load(self):
        try:
            logger.info(f"Loading model: {self.config.MODEL_NAME}...")
            self.tokenizer = AutoTokenizer.from_pretrained(self.config.MODEL_NAME)
            self.model = AutoModelForSeq2SeqLM.from_pretrained(self.config.MODEL_NAME)
            
            if self.config.DEVICE >= 0:
                self.model = self.model.to(f"cuda:{self.config.DEVICE}")
            
            self.pipeline = pipeline(
                "text2text-generation",
                model=self.model,
                tokenizer=self.tokenizer,
                device=self.config.DEVICE
            )
            self.is_loaded = True
            logger.info("Model loaded successfully!")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")

    def generate(self, prompt: str, **kwargs) -> str:
        if not self.is_loaded: return "Model not ready."
        try:
            # We strictly limit max_new_tokens to prevent rambling
            res = self.pipeline(prompt, **kwargs)
            return res[0]['generated_text']
        except Exception as e:
            logger.error(f"Generation error: {e}")
            return ""

# ========== Helper Logic ==========
def create_prompt(message: str, age: int) -> str:
    # CHANGED: T5 models prefer this "Question: ... Answer:" format
    return (
        f"Answer the following question nicely for a {age} year old child. "
        f"Question: {message} "
        f"Answer:"
    )

def quality_check(response: str, user_input: str) -> str:
    clean_response = response.strip()
    
    # Filter out common bad outputs or empty ones
    if not clean_response or len(clean_response) < 5 or "rtc" in clean_response:
        fallbacks = [
            "That is a really interesting question! What do you think?",
            "I am not sure, but I would love to find out with you.",
            "That's a fun thought! Can you ask me something else?"
        ]
        return random.choice(fallbacks)
        
    return clean_response

# ========== App Lifecycle ==========
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.config = Config()
    app.state.safety = SafetyManager(app.state.config)
    app.state.model = ModelManager(app.state.config)
    app.state.model.load()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not app.state.safety.is_input_safe(req.message):
        return ChatResponse(reply="I can't talk about that. Let's talk about something happy!", is_safe=False)

    prompt = create_prompt(req.message, req.estimated_age)
    
    # CHANGED: Tighter settings to stop hallucination
    raw_reply = app.state.model.generate(
        prompt, 
        max_length=200, 
        do_sample=True, 
        temperature=0.3,       # Low temperature = Focused, Logic-based answers
        top_p=0.9,
        repetition_penalty=1.2 # Stops "rtc rtc" repetition
    )
    
    final_reply = quality_check(raw_reply, req.message)
    return ChatResponse(reply=final_reply)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)