# Budwin Build Script
$ErrorActionPreference = "Stop"

Write-Host "🔨 Building Budwin (Release)..." -ForegroundColor Cyan
dotnet build Budwin.sln -c Release

Write-Host "📦 Publishing single-file budwin.exe..." -ForegroundColor Cyan
dotnet publish src/Budwin/Budwin.csproj -c Release -r win-x64 --self-contained false -p:PublishSingleFile=true -o ./publish

Write-Host "✅ Done! Output executable:" -ForegroundColor Green
Get-Item ./publish/budwin.exe | Select-Object FullName, Length, LastWriteTime | Format-List
