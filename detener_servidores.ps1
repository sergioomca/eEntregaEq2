# Script para detener todos los servidores
# Archivo: detener_servidores.ps1

Write-Host 'Deteniendo servidores del proyecto EPU...' -ForegroundColor Red


# Detener procesos de Node.js (Frontend)
Write-Host 'Deteniendo servidor frontend (Node.js)...' -ForegroundColor Yellow
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host 'Frontend detenido' -ForegroundColor Green
} catch {
    Write-Host 'No se encontraron procesos de Node.js' -ForegroundColor Cyan
}

# Detener todos los procesos de Java (Backend)
Write-Host 'Deteniendo servidor backend (Java)...' -ForegroundColor Yellow
try {
    Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host 'Backend detenido' -ForegroundColor Green
} catch {
    Write-Host 'No se encontraron procesos de Java' -ForegroundColor Cyan
}

# Verificación
Start-Sleep -Seconds 2
$NodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
$JavaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue

Write-Host 'Estado final:' -ForegroundColor White
Write-Host ('Node.js procesos activos: ' + $NodeProcesses.Count) -ForegroundColor Cyan
Write-Host ('Java procesos activos: ' + $JavaProcesses.Count) -ForegroundColor Cyan

Write-Host '`nServidores detenidos. Presiona Enter para continuar...' -ForegroundColor White
Read-Host
