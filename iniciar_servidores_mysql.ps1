# Script para iniciar backend y frontend usando MySQL
# Archivo: iniciar_servidores_mysql.ps1

Write-Host "Iniciando servidores del proyecto EPU en modo MySQL..." -ForegroundColor Green

# Variables de rutas
$ProjectRoot = Get-Location
$BackendPath = Join-Path $ProjectRoot "backend"
$FrontendPath = Join-Path $ProjectRoot "frontend"

Write-Host "Proyecto ubicado en: $ProjectRoot" -ForegroundColor Yellow

# Función para verificar si un puerto está en uso
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

# Verificar puertos
Write-Host "Verificando puertos..." -ForegroundColor Cyan
$MysqlRunning = Test-Port -Port 3306
$BackendRunning = Test-Port -Port 8080
$FrontendRunning = Test-Port -Port 5173

if (-not $MysqlRunning) {
    Write-Host "MySQL no esta disponible en localhost:3306" -ForegroundColor Red
    Write-Host "Inicia MySQL y vuelve a ejecutar este script." -ForegroundColor Yellow
    Write-Host "Presiona Enter para continuar..." -ForegroundColor White
    Read-Host
    exit 1
}

Write-Host "MySQL detectado en localhost:3306" -ForegroundColor Green

if ($BackendRunning) {
    Write-Host "Backend ya esta corriendo en puerto 8080" -ForegroundColor Green
} else {
    Write-Host "Iniciando servidor backend con perfil prod (MySQL)..." -ForegroundColor Yellow
    # Iniciar backend en nueva ventana de PowerShell
    $BackendScript = "cd '$BackendPath'; .\mvnw.cmd spring-boot:run '-Dspring-boot.run.profiles=prod'"
    Start-Process PowerShell -ArgumentList "-NoExit", "-Command", $BackendScript
    
    # Esperar a que se inicie
    Write-Host "Esperando que el backend se inicie (30 segundos)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
}

if ($FrontendRunning) {
    Write-Host "Frontend ya esta corriendo en puerto 5173" -ForegroundColor Green
} else {
    Write-Host "Iniciando servidor frontend..." -ForegroundColor Yellow
    # Iniciar frontend en nueva ventana de PowerShell  
    $FrontendScript = "cd '$FrontendPath'; npm run dev"
    Start-Process PowerShell -ArgumentList "-NoExit", "-Command", $FrontendScript
    
    # Esperar a que se inicie
    Write-Host "Esperando que el frontend se inicie (15 segundos)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
}

# Verificacion final
Write-Host "`nVerificacion final de servidores..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

$FinalBackend = Test-Port -Port 8080
$FinalFrontend = Test-Port -Port 5173

Write-Host "`nEstado de los servidores:" -ForegroundColor White
if ($FinalBackend) {
    Write-Host "Backend: http://localhost:8080 - ACTIVO" -ForegroundColor Green
} else {
    Write-Host "Backend: Puerto 8080 - NO DISPONIBLE" -ForegroundColor Red
}

if ($FinalFrontend) {
    Write-Host "Frontend: http://localhost:5173 - ACTIVO" -ForegroundColor Green
} else {
    Write-Host "Frontend: Puerto 5173 - NO DISPONIBLE" -ForegroundColor Red
}

if ($FinalBackend -and $FinalFrontend) {
    Write-Host "`nAmbos servidores iniciados correctamente." -ForegroundColor Green
    Write-Host "Aplicacion disponible en: http://localhost:5173" -ForegroundColor Cyan
    Write-Host "API Backend disponible en: http://localhost:8080" -ForegroundColor Cyan
    Write-Host "Backend conectado usando perfil prod (MySQL)" -ForegroundColor Cyan
} else {
    Write-Host "`nAlgunos servidores no se iniciaron correctamente. Revisa las ventanas de PowerShell." -ForegroundColor Yellow
}

Write-Host "Script completado. Presiona Enter para continuar..." -ForegroundColor White
Read-Host
