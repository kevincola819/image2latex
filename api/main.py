from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
from pix2tex.cli import LatexOCR
import logging

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize model lazily
model = None

def get_model():
    global model
    if model is None:
        logger.info("Loading LatexOCR model...")
        model = LatexOCR()
        logger.info("Model loaded successfully")
    return model

@app.on_event("startup")
async def startup_event():
    # Preload the model on startup to avoid delay on first request
    get_model()

@app.post("/api/recognize")
async def recognize(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        
        # Perform OCR
        model = get_model()
        latex = model(image)
        
        return {
            "status": "success",
            "latex": latex,
            "confidence": 1.0 # pix2tex doesn't return confidence directly by default
        }
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/health")
async def health():
    return {"status": "ok"}
