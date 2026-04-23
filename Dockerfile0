# ──────────────────────────────────────────────
# Backend Dockerfile — FastAPI + BERT (PyTorch)
# ──────────────────────────────────────────────
FROM python:3.11-slim

# System dependencies needed by PyTorch / transformers / Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency spec and install Python packages FIRST (layer cache)
COPY pyproject.toml ./
RUN pip install --upgrade pip \
    && pip install --no-cache-dir \
        fastapi \
        "uvicorn[standard]" \
        torch \
        transformers \
        pillow \
        requests \
        pydantic \
        "python-multipart" \
        "google-genai" \
        python-dotenv \
        newsapi-python \
        beautifulsoup4 \
        serpapi \
        motor \
        pymongo \
        "python-jose[cryptography]" \
        "passlib[bcrypt]" \
        email-validator \
        mistralai \
        slowapi \
        pytesseract

# Copy application source code
COPY app/ ./app/

# Copy pre-trained BERT model directories
COPY enhanced_bert_liar_model/ ./enhanced_bert_liar_model/
COPY enhanced_bert_welfake_model/ ./enhanced_bert_welfake_model/

# Copy the server entry-point
COPY run_api.py ./

# Create logs directory
RUN mkdir -p logs

# Expose the FastAPI port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run with uvicorn
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
