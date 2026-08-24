<div align="center">

# ⚡ budwin

**A lightweight, native menu-bar and system tray companion for Windows 11 & 10.**

[![Release](https://img.shields.io/github/v/release/crynn/budwin?color=blue&style=flat-square)](https://github.com/crynn/budwin/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%2010%20%7C%2011-blue?style=flat-square)]()
[![.NET](https://img.shields.io/badge/.NET-8.0-purple?style=flat-square)]()

*Monitor CPU, GPU, Memory, Network, and background processes at a glance — with a footprint under 20MB of RAM.*

</div>

---

## ✨ Features

- 📌 **System Tray At-a-Glance**: Sits quietly in your Windows taskbar. Hover for instant stats or click for a rich Fluent UI flyout.
- ⚡ **CPU Telemetry**: Real-time total CPU load %, per-core telemetry, and a smooth 60-second antialiased sparkline.
- 🎮 **NVIDIA GPU Monitoring**: Direct P/Invoke integration with NVIDIA Management Library (NVML) to read RTX/GTX GPU utilization, VRAM used, temperature (°C), and power usage.
- 🧠 **Memory Diagnostics**: Live RAM load %, used vs. available memory (GB), and memory pressure gauge.
- 🌐 **Network Speeds**: Instant Upload/Download throughput rates (MB/s / KB/s).
- 🛑 **Quick Process Killer**: Live leaderboard of top memory-consuming applications with a 1-click **End Process** button.
- 🪶 **Ultra Lightweight**: Built natively in C# (.NET 8 WPF) with zero-allocation ring buffers. Uses `<20 MB RAM` and `<0.1% CPU` when running.
- 📦 **Single Portable `.exe`**: No installer needed. Download `budwin.exe` and double-click to run.

---

## 🚀 Download & Installation

### Option 1: Pre-built Executable (Recommended)
1. Download the latest **`budwin.exe`** from [GitHub Releases](https://github.com/crynn/budwin/releases).
2. Double-click `budwin.exe` to run.
3. Check the **"Run on Startup"** box inside the flyout if you want it to start automatically with Windows.

### Option 2: Build from Source
Requirements: [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)

```powershell
# Clone the repository
git clone https://github.com/crynn/budwin.git
cd budwin

# Build release executable
dotnet build Budwin.sln -c Release

# Publish as a single portable .exe
dotnet publish src/Budwin/Budwin.csproj -c Release -r win-x64 --self-contained false -p:PublishSingleFile=true -o publish
```

---

## 🛠️ Architecture

```
budwin/
├── src/
│   └── Budwin/
│       ├── Core/
│       │   ├── HardwareSampler.cs    # 1Hz telemetry engine (CPU, RAM, Disk, Net)
│       │   ├── NvmlInterop.cs        # NVIDIA GPU & RTX temperature P/Invoke
│       │   ├── RingBuffer.cs         # Fixed 60-slot zero-allocation history buffer
│       │   ├── ProcessManager.cs     # Top apps leaderboard & safe termination
│       │   └── StartupManager.cs     # Windows startup registry integration
│       └── UI/
│           ├── FlyoutWindow.xaml     # Windows 11 Fluent Dark Mode flyout
│           ├── TrayIconManager.cs    # Taskbar notification icon & context menu
│           └── Controls/
│               └── SparklineControl.cs # High-performance antialiased QPainter-style chart
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
