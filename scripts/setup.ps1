# MediaGram — first-time setup (Windows PowerShell)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location -LiteralPath $Root

Write-Host "==> Installing dependencies..." -ForegroundColor Cyan
npm install --prefix backend
npm install --prefix frontend

Write-Host "==> Starting Docker (PostgreSQL + pgAdmin)..." -ForegroundColor Cyan
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Host "Docker not found. Install Docker Desktop first." -ForegroundColor Red
  exit 1
}
docker info 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Docker Desktop is not running. Start it, then run this script again." -ForegroundColor Red
  exit 1
}
docker compose up -d

Write-Host "==> Waiting for database..." -ForegroundColor Cyan
Start-Sleep -Seconds 8

Write-Host "==> Running migrations & seed..." -ForegroundColor Cyan
npm run prisma:deploy --prefix backend
npm run prisma:seed --prefix backend

Write-Host ""
Write-Host "Done! Next steps:" -ForegroundColor Green
Write-Host "  1. Copy .env.example to backend/.env and set CLOUDINARY_* (optional for images)"
Write-Host "  2. Terminal 1: npm run dev:api"
Write-Host "  3. Terminal 2: npm run dev:web"
Write-Host "  4. Open http://localhost:5173  (demo: alice@example.com / password123)"
