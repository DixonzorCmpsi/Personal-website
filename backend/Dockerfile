# Backend Dockerfile for FastAPI Python service
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Ensure logs are not buffered
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install torch cpu first to save space, then other requirements
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the FastAPI server
CMD ["uvicorn", "main_hf:app", "--host", "0.0.0.0", "--port", "8000"]
