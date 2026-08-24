# budwin Build Script (Go + React / TypeScript)
$ErrorActionPreference = "Stop"

Write-Host "📦 1. Building React Frontend..." -ForegroundColor Cyan
Set-Location ./frontend
npm run build
Set-Location ..

$go = "$env:LOCALAPPDATA\go\bin\go.exe"
if (!(Test-Path $go)) {
    $go = "go"
}

Write-Host "🔨 2. Compiling Standalone budwin.exe..." -ForegroundColor Cyan
& $go build -ldflags "-H windowsgui -s -w" -o ./build/bin/budwin.exe .

Write-Host "✅ Build Finished! Single-file executable ready at:" -ForegroundColor Green
Get-Item ./build/bin/budwin.exe | Select-Object FullName, @{Name="Size_MB";Expression={[math]::Round($_.Length/1MB,2)}}, LastWriteTime | Format-List
