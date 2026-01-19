# Start Backend Server
# This script starts the FastAPI backend server for Dixon's Portfolio

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "  Dixon's Portfolio - Backend    " -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "WARNING: .env.local not found!" -ForegroundColor Yellow
    Write-Host "Please create .env.local with your HUGGINGFACEHUB_API_TOKEN" -ForegroundColor Yellow
    Write-Host "See backend/.env.example for reference" -ForegroundColor Yellow
    Write-Host ""
}

# Navigate to backend directory
Set-Location -Path "backend"

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "✓ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Install dependencies if needed
Write-Host "Checking dependencies..." -ForegroundColor Cyan
python -m pip install -r requirements.txt --quiet

Write-Host ""
Write-Host "Starting backend server on http://localhost:8000" -ForegroundColor Green
Write-Host "Press CTRL+C to stop" -ForegroundColor Yellow
Write-Host ""

# Start the server
python main_hf.py
