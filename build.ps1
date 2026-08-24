# Budwin Build Script (Self-Contained Single-File)
$ErrorActionPreference = "Stop"

$dotnet = "$env:LOCALAPPDATA\dotnet\dotnet.exe"
if (!(Test-Path $dotnet)) {
    $dotnet = "dotnet"
}

Write-Host "🔨 Building Budwin (Release)..." -ForegroundColor Cyan
& $dotnet build Budwin.sln -c Release

Write-Host "📦 Publishing self-contained budwin.exe..." -ForegroundColor Cyan
& $dotnet publish src/Budwin/Budwin.csproj -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -p:EnableCompressionInSingleFile=true -o ./publish

Write-Host "✅ Done! Output executable:" -ForegroundColor Green
Get-Item ./publish/budwin.exe | Select-Object FullName, Length, LastWriteTime | Format-List
