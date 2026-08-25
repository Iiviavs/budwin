<div align="center">

# 🦝 budwin

**A high-performance, lightweight Windows 11/10 system monitor, process safety manager & competitive gaming optimizer.**

[![Release](https://img.shields.io/github/v/release/Iiviavs/budwin?color=lime&style=flat-square)](https://github.com/Iiviavs/budwin/releases/tag/v1.9.0) 
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%2010%20%7C%2011-blue?style=flat-square)]()
[![Go](https://img.shields.io/badge/Go-1.22+-00ADD8?style=flat-square&logo=go&logoColor=white)]()
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)]()

<br/>

<img src="frontend/public/logo.png" width="130" height="130" style="border-radius: 50%;" alt="budwin mascot" />

<br/>
<br/>

*Real-time hardware telemetry, CPU core unparking, low-latency audio tuning, storage reclaiming, and process management — all in a single ~12MB standalone portable executable.*

</div>

---

## ✨ Features

### 🎯 Competitive FPS Maxer & CPU Core Unparker
- **12-Core CPU Unparking**: Forces all logical processor cores to remain 100% active, preventing power-saving sleep transitions that cause in-game stuttering.
- **Ultimate Performance Activation**: Unlocks and activates Windows maximum power delivery to lock CPU clocks at peak frequencies.
- **Background Capture Latency Bypass**: Disables background capture buffers in the registry to eliminate Desktop Window Manager (DWM) frame presentation overhead.
- **GPU Priority 8 Scheduling**: Sets Windows Multimedia scheduling to prioritize game rendering threads over background tasks.

### 🤫 Screen Share & Stealth Silent Fan Profile (Quiet Vents)
- **Eliminates Loud Fan Noise During Screen Share / Streaming**: Lowers idle CPU voltage states and prevents aggressive PL2 turbo boost spikes that cause fans to spin up to 100% RPM.
- **Hardware-Accelerated Thermal Target**: Drops CPU package temperatures by **10°C to 15°C**, ensuring whisper-quiet acoustic fan levels while streaming desktop, voice chatting, or browsing.

### 🎧 Audio Latency & Buffer Reducer
- **Multimedia Class Scheduler Priority**: Configures Windows MMCSS to **Realtime High priority** and disables the default 20% system network/background audio throttling.
- **Low-Latency Buffer Tuning**: Locks buffer response time down to **~3.8ms**, eliminating sound delay between fast-paced in-game action and your headset.

### ⚡ Ultra-Low Input Latency Engine
- **1.0ms High-Resolution Timer (`winmm.dll timeBeginPeriod(1)`)**: Drops Windows scheduling tick from 15.6ms to 1.0ms for instantaneous mouse and keyboard polling.
- **1:1 Raw Mouse Input**: Strips Windows acceleration curves for pure linear sensor mapping.
- **Input Latency Lab**: Live mouse polling rate arena (125Hz to 8000Hz) and real-time gamepad/controller button and analog stick inspector.

### 💾 Deep Storage Reclaimer & Game Duplicate Hunter
- **1-Click Multi-Target Reclaimer**: Scans and safely purges:
  - ⚡ *DirectX & GPU Shader Caches*
  - 🔄 *Windows Update Delivery Optimization Caches*
  - 🌐 *Browser & Client Web Caches*
  - 🗑️ *System & User %TEMP% Logs and Crash Dumps*
  - 📦 *Windows Recycle Bin*
- **Game Duplicate Hunter**: Scans game libraries across all drives (`C:`, `D:`, `E:`) for redundant installer packages and leftover staging chunks.

### 📊 Real-Time Telemetry & Benchmark Logger
- **Live Metrics**: 60-second animated trendlines for CPU load, GPU utilization, VRAM, temperatures, RAM usage, Network throughput, and Disk I/O.
- **Benchmark Stability Logger**: Tracks average/peak FPS loads, thermal limits, and stability ratings during gaming sessions.

### 🛡️ Smart Process Safety Shields
- Searchable process tree sorted by RAM usage with friendly descriptions.
- **Category Shields:** 🟢 User Apps (Safe to Kill), 🟡 Background Helpers (Warning), 🔴 Critical System (`explorer`, `dwm`, `svchost`, `csrss` — protected against accidental termination).

### 🪟 Smart Window Modes & Floating HUD
- **Full Dashboard Mode**: High-density `1060x700` overview on initial startup.
- **Tray-Docked Mini Companion**: Clicking the system tray icon docks the widget at the bottom-right corner of your screen right above the taskbar.
- **Floating In-Game HUD**: Ultra-lightweight transparent overlay pill with CPU%, GPU%, RAM%, double-click to expand, and a prominent Maximize button (`↗`).

---

## 🚀 Quick Start

### 1. Download Pre-built Executable
Download the latest **`budwin.exe`** directly from [GitHub Releases](https://github.com/Iiviavs/budwin/releases) and run. No installer or dependencies needed.

### 2. Build from Source

**Prerequisites:** [Go 1.22+](https://go.dev/dl/) & [Node.js](https://nodejs.org/)

```powershell
# 1. Clone repository
git clone https://github.com/Iiviavs/budwin.git
cd budwin

# 2. Install frontend dependencies and build assets
cd frontend
npm install
npm run build
cd ..

# 3. Build standalone binary
go build -tags desktop,production -ldflags "-w -s -H windowsgui" -o build/bin/budwin.exe .
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
