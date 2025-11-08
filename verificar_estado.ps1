# Script para verificar estado de servidores
# Archivo: verificar_estado.ps1

Write-Host "=== ESTADO SERVIDORES EPU ===" -ForegroundColor Cyan

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

$Backend = Test-Port -Port 8080
$Frontend = Test-Port -Port 5173

Write-Host "Backend (8080):" -NoNewline -ForegroundColor Yellow
if ($Backend) {
    Write-Host " ACTIVO" -ForegroundColor Green
} else {
    Write-Host " INACTIVO" -ForegroundColor Red
}

Write-Host "Frontend (5173):" -NoNewline -ForegroundColor Yellow  
if ($Frontend) {
    Write-Host " ACTIVO" -ForegroundColor Green
} else {
    Write-Host " INACTIVO" -ForegroundColor Red
}

if ($Backend -and $Frontend) {
    Write-Host "Estado: LISTO PARA PRUEBAS" -ForegroundColor Green
    Write-Host "URL: http://localhost:5173" -ForegroundColor Cyan
} else {
    Write-Host "Estado: REQUIERE ATENCION" -ForegroundColor Yellow
    if (-not $Backend) { Write-Host "- Iniciar Backend" -ForegroundColor Red }
    if (-not $Frontend) { Write-Host "- Iniciar Frontend" -ForegroundColor Red }
}