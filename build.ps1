# budwin Build Script (Wails + React / TypeScript)
$ErrorActionPreference = "Stop"

$env:PATH = "$env:LOCALAPPDATA\go\bin;$env:USERPROFILE\go\bin;$env:PATH"

$wails = "$env:USERPROFILE\go\bin\wails.exe"
if (!(Test-Path $wails)) {
    $wails = "wails"
}

Write-Host "📦 Compiling budwin with Wails (React + Go)..." -ForegroundColor Cyan
& $wails build -clean -platform windows/amd64 -o budwin.exe

Write-Host "✅ Standalone executable built successfully at:" -ForegroundColor Green
Get-Item ./build/bin/budwin.exe | Select-Object FullName, @{Name="Size_MB";Expression={[math]::Round($_.Length/1MB,2)}}, LastWriteTime | Format-List
