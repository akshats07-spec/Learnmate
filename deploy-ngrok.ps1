param(
    [string]$AuthToken = ""
)

$toolsDir = "$PSScriptRoot\tools"
$ngrokPath = "$toolsDir\ngrok.exe"

if (-not (Test-Path $ngrokPath)) {
    Write-Host "[!] ngrok.exe not found at $ngrokPath. Downloading..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $toolsDir -Force | Out-Null
    $zipPath = "$toolsDir\ngrok.zip"
    curl.exe -L -o $zipPath "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
    tar.exe -xf $zipPath -C $toolsDir
    Remove-Item $zipPath -Force
}

# Add authtoken if provided
if ($AuthToken) {
    Write-Host "[+] Saving ngrok authtoken..." -ForegroundColor Cyan
    & $ngrokPath config add-authtoken $AuthToken
} elseif ($env:NGROK_AUTHTOKEN) {
    Write-Host "[+] Saving ngrok authtoken from environment variable..." -ForegroundColor Cyan
    & $ngrokPath config add-authtoken $env:NGROK_AUTHTOKEN
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Magenta
Write-Host " LearnMate - Fullstack Live Deployment via ngrok" -ForegroundColor Magenta
Write-Host "==========================================================" -ForegroundColor Magenta
Write-Host " [✓] Next.js Frontend    : http://localhost:3000" -ForegroundColor Green
Write-Host " [✓] FastAPI Backend     : http://localhost:8000" -ForegroundColor Green
Write-Host " [✓] Unified Proxy       : /api/py/* -> Port 8000" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Starting ngrok tunnel for Port 3000 (Frontend + Proxied Backend)..." -ForegroundColor Cyan
Write-Host "Your public HTTPS URL will appear below:" -ForegroundColor Yellow
Write-Host ""

& $ngrokPath http 3000
