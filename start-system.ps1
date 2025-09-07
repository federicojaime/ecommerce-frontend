# Script mejorado para iniciar el sistema completo
Write-Host "🚀 Iniciando Sistema E-commerce Deco Home" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""

# Verificar dependencias
if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
    Write-Host "❌ PHP no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "Instala PHP desde: https://windows.php.net/download/" -ForegroundColor Yellow
    exit 1
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    Write-Host "Instala Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar estructura
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Ejecuta este script desde la carpeta del frontend" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencias verificadas" -ForegroundColor Green

# Función para iniciar backend
function Start-BackendServer {
    $backendPath = "../ecommerce-backend"
    
    if (-not (Test-Path "$backendPath/public/index.php")) {
        Write-Host "⚠️ Backend no encontrado, usando datos simulados..." -ForegroundColor Yellow
        return
    }
    
    Write-Host "🔧 Iniciando servidor API PHP..." -ForegroundColor Blue
    
    # Iniciar en nueva ventana
    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = "powershell"
    $startInfo.Arguments = "-NoExit -Command `"cd '$backendPath'; Write-Host 'API Server iniciado en http://localhost:8000'; php -S localhost:8000 -t public`""
    $startInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Normal
    
    try {
        [System.Diagnostics.Process]::Start($startInfo) | Out-Null
        Write-Host "✅ Servidor API iniciado en http://localhost:8000" -ForegroundColor Green
        Start-Sleep 2
    } catch {
        Write-Host "⚠️ No se pudo iniciar el servidor API" -ForegroundColor Yellow
    }
}

# Mostrar información del sistema
Write-Host "📋 Información del sistema:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:  http://localhost:8000" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Credenciales:" -ForegroundColor Yellow
Write-Host "   Email:    admin@ecommerce.com" -ForegroundColor White
Write-Host "   Password: password" -ForegroundColor White
Write-Host ""

# Preguntar sobre el backend
$response = Read-Host "¿Iniciar servidor API? (s/n)"
if ($response -match "^[sS]") {
    Start-BackendServer
}

Write-Host "🌐 Iniciando servidor frontend..." -ForegroundColor Blue
Write-Host "Presiona Ctrl+C para detener los servidores" -ForegroundColor Gray
Write-Host ""

# Iniciar frontend
try {
    npm run dev
} catch {
    Write-Host "❌ Error al iniciar el frontend" -ForegroundColor Red
    Write-Host "Verifica que las dependencias estén instaladas: npm install" -ForegroundColor Yellow
}
