# Funciones helper para comandos con directorio correcto
# Archivo: helper_functions.ps1

# Función para ejecutar comandos en el backend
function Invoke-BackendCommand {
    param(
        [string]$Command,
        [string]$Description = "Ejecutando comando en backend"
    )
    
    $BackendPath = Join-Path (Get-Location) "backend"
    Write-Host "🔧 $Description" -ForegroundColor Cyan
    Write-Host "📁 Directorio: $BackendPath" -ForegroundColor Yellow
    Write-Host "💻 Comando: $Command" -ForegroundColor Gray
    
    Push-Location $BackendPath
    try {
        Invoke-Expression $Command
    } finally {
        Pop-Location
    }
}

# Función para ejecutar comandos en el frontend
function Invoke-FrontendCommand {
    param(
        [string]$Command,
        [string]$Description = "Ejecutando comando en frontend"
    )
    
    $FrontendPath = Join-Path (Get-Location) "frontend"
    Write-Host "🔧 $Description" -ForegroundColor Cyan
    Write-Host "📁 Directorio: $FrontendPath" -ForegroundColor Yellow
    Write-Host "💻 Comando: $Command" -ForegroundColor Gray
    
    Push-Location $FrontendPath
    try {
        Invoke-Expression $Command
    } finally {
        Pop-Location
    }
}

# Función para verificar estado de servidores
function Get-ServersStatus {
    Write-Host "🔍 Verificando estado de servidores..." -ForegroundColor Cyan
    
    # Backend (puerto 8080)
    try {
        $backend = New-Object System.Net.Sockets.TcpClient("localhost", 8080)
        $backend.Close()
        Write-Host "✅ Backend: ACTIVO en puerto 8080" -ForegroundColor Green
        $backendStatus = $true
    } catch {
        Write-Host "❌ Backend: INACTIVO en puerto 8080" -ForegroundColor Red
        $backendStatus = $false
    }
    
    # Frontend (puerto 5173)
    try {
        $frontend = New-Object System.Net.Sockets.TcpClient("localhost", 5173)
        $frontend.Close()
        Write-Host "✅ Frontend: ACTIVO en puerto 5173" -ForegroundColor Green
        $frontendStatus = $true
    } catch {
        Write-Host "❌ Frontend: INACTIVO en puerto 5173" -ForegroundColor Red
        $frontendStatus = $false
    }
    
    return @{
        Backend = $backendStatus
        Frontend = $frontendStatus
        Both = ($backendStatus -and $frontendStatus)
    }
}

Write-Host "✅ Funciones helper cargadas:" -ForegroundColor Green
Write-Host "   - Invoke-BackendCommand" -ForegroundColor Cyan
Write-Host "   - Invoke-FrontendCommand" -ForegroundColor Cyan  
Write-Host "   - Get-ServersStatus" -ForegroundColor Cyan