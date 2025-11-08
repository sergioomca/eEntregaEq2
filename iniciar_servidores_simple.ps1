# Script para iniciar ambos servidores automáticamente

Write-Host "=== INICIANDO SERVIDORES EPU ===" -ForegroundColor Green

# Variables de rutas  
$ProjectRoot = Get-Location
$BackendPath = Join-Path $ProjectRoot "backend"
$FrontendPath = Join-Path $ProjectRoot "frontend"

Write-Host "Proyecto ubicado en: $ProjectRoot" -ForegroundColor Yellow

# Función para verificar puerto
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Verificar estado actual
Write-Host "Verificando puertos..." -ForegroundColor Cyan
$BackendRunning = Test-Port -Port 8080
$FrontendRunning = Test-Port -Port 5173

# Iniciar Backend
if ($BackendRunning) {
    Write-Host "Backend ya corriendo en puerto 8080" -ForegroundColor Green
} else {
    Write-Host "Iniciando servidor backend..." -ForegroundColor Yellow
    $BackendScript = "cd '$BackendPath'; .\mvnw.cmd spring-boot:run '-Dspring-boot.run.profiles=test'"
    Start-Process PowerShell -ArgumentList "-NoExit", "-Command", $BackendScript
    Write-Host "Esperando backend (30 segundos)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
}

# Iniciar Frontend
if ($FrontendRunning) {
    Write-Host "Frontend ya corriendo en puerto 5173" -ForegroundColor Green
} else {
    Write-Host "Iniciando servidor frontend..." -ForegroundColor Yellow
    $FrontendScript = "cd '$FrontendPath'; npm run dev"
    Start-Process PowerShell -ArgumentList "-NoExit", "-Command", $FrontendScript
    Write-Host "Esperando frontend (15 segundos)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
}

# Verificación final
Write-Host "=== VERIFICACION FINAL ===" -ForegroundColor Cyan
Start-Sleep -Seconds 5

$FinalBackend = Test-Port -Port 8080
$FinalFrontend = Test-Port -Port 5173

Write-Host "Estado de servidores:" -ForegroundColor White
if ($FinalBackend) {
    Write-Host "Backend: ACTIVO en http://localhost:8080" -ForegroundColor Green
} else {
    Write-Host "Backend: NO DISPONIBLE" -ForegroundColor Red
}

if ($FinalFrontend) {
    Write-Host "Frontend: ACTIVO en http://localhost:5173" -ForegroundColor Green
} else {
    Write-Host "Frontend: NO DISPONIBLE" -ForegroundColor Red
}

if ($FinalBackend -and $FinalFrontend) {
    Write-Host "=== EXITO: AMBOS SERVIDORES ACTIVOS ===" -ForegroundColor Green
    Write-Host "Aplicacion: http://localhost:5173" -ForegroundColor Cyan
    Write-Host "API: http://localhost:8080" -ForegroundColor Cyan
} else {
    Write-Host "=== ATENCION: Revisar ventanas de PowerShell ===" -ForegroundColor Yellow
}

Write-Host "Presiona Enter para continuar..." -ForegroundColor White
Read-Host