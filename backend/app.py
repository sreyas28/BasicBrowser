from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from typing import Optional
import os
import re
import random
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from torch.cuda import is_available as cuda_available

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ========== Configuration ==========
class Config:
    # FASTEST: Using Phi-1_5 (1.3B) - Microsoft's fastest model
    MODEL_NAME = os.environ.get("KIDBOT_MODEL", "microsoft/phi-1_5")
    DEVICE = 0 if cuda_available() else -1
    
    # Model optimization flags
    USE_FLASH_ATTENTION = True  # Enable if available
    USE_BETTERTRANSFORMER = True  # PyTorch optimization
    
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
        self.model = None
        self.tokenizer = None
        self.is_loaded = False

    def load(self):
        try:
            logger.info(f"Loading model: {self.config.MODEL_NAME}...")
            
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.config.MODEL_NAME, 
                trust_remote_code=True
            )
            
            # Set pad token if not present
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            # OPTIMIZED: Load with half precision for GPU, float32 for CPU
            dtype = torch.float16 if self.config.DEVICE >= 0 else torch.float32
            
            self.model = AutoModelForCausalLM.from_pretrained(
                self.config.MODEL_NAME,
                trust_remote_code=True,
                torch_dtype=dtype
            )
            
            # OPTIMIZED: Move to GPU if available
            if self.config.DEVICE >= 0:
                self.model = self.model.to(f"cuda:{self.config.DEVICE}")
            
            # OPTIMIZED: Enable BetterTransformer for faster inference
            if self.config.USE_BETTERTRANSFORMER:
                try:
                    self.model = self.model.to_bettertransformer()
                    logger.info("BetterTransformer enabled")
                except Exception as e:
                    logger.warning(f"Could not enable BetterTransformer: {e}")
            
            # OPTIMIZED: Set to eval mode and disable gradient computation
            self.model.eval()
            
            self.is_loaded = True
            logger.info("Model loaded and optimized successfully!")
            
        except Exception as e:
            logger.error(f"Failed to load model: {e}")

    @torch.inference_mode()  # OPTIMIZED: Faster than torch.no_grad()
    def generate(self, prompt: str, max_tokens: int = 150) -> str:
        if not self.is_loaded:
            return "Model not ready."
        
        try:
            # FASTEST: Tokenize with minimal processing
            inputs = self.tokenizer(
                prompt,
                return_tensors="pt",
                truncation=True,
                max_length=256  # Even shorter for speed
            )
            
            if self.config.DEVICE >= 0:
                inputs = {k: v.to(f"cuda:{self.config.DEVICE}") for k, v in inputs.items()}
            
            # FASTEST: Speed-optimized generation parameters
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                do_sample=True,
                temperature=0.6,  # Lower for more focused output
                top_p=0.85,  # Slightly lower for speed
                top_k=40,  # Reduced for faster sampling
                repetition_penalty=1.15,  # Slightly higher to end faster
                pad_token_id=self.tokenizer.pad_token_id,
                eos_token_id=self.tokenizer.eos_token_id,
                use_cache=True  # Cache for speed
            )
            
            # Decode only the new tokens
            generated_text = self.tokenizer.decode(
                outputs[0][inputs['input_ids'].shape[1]:],
                skip_special_tokens=True
            )
            
            return generated_text.strip()
            
        except Exception as e:
            logger.error(f"Generation error: {e}")
            return ""

# ========== Helper Logic ==========
def create_prompt(message: str, age: int) -> str:
    # FASTEST: Ultra-short prompt for speed
    return f"Answer for a 5-year-old in exactly 3 sentences:\n{message}\nAnswer:"

def clean_response(response: str, user_input: str) -> str:
    # Remove common artifacts
    response = response.strip()
    
    # Stop at newlines or common end markers
    if '\n' in response:
        response = response.split('\n')[0]
    
    # Remove any remaining prompt artifacts
    response = re.sub(r'(Question:|Answer:|Instruct:|Output:).*', '', response, flags=re.IGNORECASE)
    response = response.strip()
    
    # Quality check
    if not response or len(response) < 5:
        fallbacks = [
            "That's an interesting question! What do you think?",
            "I'm not sure, but let's think about it together!",
            "That's a fun thought! Can you ask me something else?"
        ]
        return random.choice(fallbacks)
    
    # Truncate if too long (should be rare with our settings)
    if len(response) > 300:
        response = response[:297] + "..."
    
    return response

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
    # Safety check
    if not app.state.safety.is_input_safe(req.message):
        return ChatResponse(
            reply="I can't talk about that. Let's talk about something happy!",
            is_safe=False
        )

    # Create prompt
    prompt = create_prompt(req.message, req.estimated_age)
    
    # FASTEST: Adjusted for 3-sentence responses
    raw_response = app.state.model.generate(prompt, max_tokens=120)
    
    # Clean and validate response
    final_reply = clean_response(raw_response, req.message)
    
    # Output safety check
    if not app.state.safety.is_input_safe(final_reply):
        return ChatResponse(
            reply="I tried to answer, but got confused. Can we talk about something else?",
            is_safe=True
        )

    return ChatResponse(reply=final_reply)

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "model_loaded": app.state.model.is_loaded,
        "model_name": app.state.config.MODEL_NAME
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)