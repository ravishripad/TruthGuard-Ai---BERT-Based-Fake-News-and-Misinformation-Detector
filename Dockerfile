# Dockerfile for Hugging Face Spaces deployment
# HF Spaces requires the app to listen on port 7860
FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

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
        slowapi

COPY app/ ./app/
COPY enhanced_bert_liar_model/ ./enhanced_bert_liar_model/
COPY enhanced_bert_welfake_model/ ./enhanced_bert_welfake_model/
COPY run_api.py ./

RUN mkdir -p logs

# HF Spaces requires port 7860
EXPOSE 7860

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD curl -f http://localhost:7860/health || exit 1

# Run on port 7860 for HF Spaces
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
