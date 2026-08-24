<div align="center">

# ⚡ budwin

**A modern, lightweight Windows 11/10 system monitor, process safety manager & input latency optimizer.**

[![Release](https://img.shields.io/github/v/release/Iiviavs/budwin?color=lime&style=flat-square)](https://github.com/Iiviavs/budwin/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%2010%20%7C%2011-blue?style=flat-square)]()
[![Go](https://img.shields.io/badge/Go-1.22+-00ADD8?style=flat-square&logo=go&logoColor=white)]()
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)]()

<br/>

<img src="frontend/public/logo.png" width="130" height="130" style="border-radius: 50%;" alt="budwin mascot" />

<br/>
<br/>

*Monitor CPU, NVIDIA RTX GPU, RAM, Network, Disks, kill lagging apps safely, and eliminate Windows input lag — all in a single ~4MB Discord-style frameless app with Windows System Tray integration.*

</div>

---

## ✨ Features

- 🎮 **⚡ Ultra-Low Input Lag Reducer**:
  - **1.0ms High-Resolution Timer (`winmm.dll timeBeginPeriod(1)`)**: Drops Windows scheduling tick from 15.6ms to 1.0ms (1000 Hz) for snappy mouse & keyboard polling.
  - **1:1 Raw Mouse Input**: Strips Windows acceleration curves ("Enhanced Pointer Precision") for pure linear sensor mapping.
  - **GameDVR Buffer Bypass**: Bypasses background capture queues to minimize Desktop Window Manager (DWM) frame buffer latency.
- 📊 **Real-time Telemetry Dashboard**: Live metrics and smooth 60-second animated SVG sparklines for CPU, NVIDIA RTX GPU, Memory, Network throughput, and Disk I/O.
- 🛡️ **Smart Process Manager & Safety Shield**:
  - Searchable process list sorted by RAM usage with friendly descriptions.
  - **Category Shields:** 🟢 User Apps (Safe to Kill), 🟡 Background Helpers (Warning), 🔴 Critical System (`explorer`, `dwm`, `svchost`, `csrss` — blocked from accidental termination).
- 💾 **Storage Explorer**: Visual partition health and free space indicators for all fixed drives (C:, D:).
- 🧹 **Quick System Optimizer**: 1-Click `%TEMP%` junk cleaner, DNS cache flusher (`ipconfig /flushdns`), and Power Plan switcher.
- 🪟 **Discord-Style Frameless Design**: Custom titlebar (`—`, `□`, `✕`), luxury obsidian dark theme with neon lime highlights, and a compact **Mini Tray Companion View**.
- 🔔 **Native Windows System Tray Icon**: Sits in the Windows taskbar notification area with right-click quick controls.

---

## 🚀 Quick Start

### 1. Download Pre-built Executable
Download the latest **`budwin.exe`** directly from [GitHub Releases](https://github.com/Iiviavs/budwin/releases) and double-click to run. No installer or runtime setup needed!

### 2. Build from Source

**Prerequisites:** [Go 1.22+](https://go.dev/dl/) & [Node.js](https://nodejs.org/)

```powershell
# 1. Clone repository
git clone https://github.com/Iiviavs/budwin.git
cd budwin

# 2. Build with 1-Click Script
./build.ps1
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
