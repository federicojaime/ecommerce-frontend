# Script para iniciar frontend y backend juntos
Write-Host "🚀 Iniciando servidores completos..." -ForegroundColor Green

# Verificar si estamos en la carpeta correcta
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Este script debe ejecutarse desde la carpeta del frontend" -ForegroundColor Red
    exit 1
}

# Función para iniciar el backend en una nueva ventana
function Start-Backend {
    $backendPath = "../ecommerce-backend"
    if (Test-Path $backendPath) {
        Write-Host "📂 Iniciando servidor API PHP..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; php -S localhost:8000 -t public"
        Write-Host "✅ Servidor API iniciado en http://localhost:8000" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Carpeta del backend no encontrada. Asegúrate de que esté en: $backendPath" -ForegroundColor Yellow
    }
}

# Función para iniciar el frontend
function Start-Frontend {
    Write-Host "🌐 Iniciando servidor frontend..." -ForegroundColor Cyan
    npm run dev
}

# Mostrar información
Write-Host ""
Write-Host "🎯 Sistema E-commerce - Deco Home" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "🔧 API Backend: http://localhost:8000" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Credenciales de acceso:" -ForegroundColor Yellow
Write-Host "Email: admin@ecommerce.com" -ForegroundColor White
Write-Host "Password: password" -ForegroundColor White
Write-Host ""

# Preguntar si quiere iniciar el backend
$startBackend = Read-Host "¿Iniciar servidor API PHP? (s/n)"
if ($startBackend -eq "s" -or $startBackend -eq "S" -or $startBackend -eq "yes") {
    Start-Backend
    Start-Sleep 2
}

# Iniciar frontend
Write-Host "Iniciando frontend en 3 segundos..." -ForegroundColor Green
Start-Sleep 3
Start-Frontend
