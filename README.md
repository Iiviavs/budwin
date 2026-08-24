<div align="center">

# ⚡ budwin

**A modern, lightweight Windows 11/10 system monitor, process manager & optimizer companion.**

[![Release](https://img.shields.io/github/v/release/crynn/budwin?color=blue&style=flat-square)](https://github.com/crynn/budwin/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%2010%20%7C%2011-blue?style=flat-square)]()
[![Go](https://img.shields.io/badge/Go-1.22+-00ADD8?style=flat-square&logo=go&logoColor=white)]()
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)]()

*Monitor CPU, GPU, Memory, Network, Storage, and background processes with smart safety shields — bundled as a single ~4MB executable.*

</div>

---

## ✨ Features

- 📊 **Real-time Overview Dashboard**: Live telemetry and 60-second animated history sparklines for CPU, NVIDIA RTX GPU, Memory, Network throughput, and Disk I/O.
- 🛡️ **Smart Process Manager & Safety Shield**:
  - Searchable process table with live memory usage and readable descriptions.
  - **Category Badges:** 🟢 User Applications (Safe to End), 🟡 Background Helpers, 🔴 Critical Windows System Processes.
  - **Accidental Kill Protection:** Protects core Windows components (`explorer`, `svchost`, `dwm`, `csrss`) from accidental termination.
- 💾 **Storage Explorer**: Visual progress cards and free space indicators for all mounted SSD/HDD partitions (C:, D:, etc.).
- 🧹 **Quick System Optimizer**:
  - **1-Click Temp Cache Cleaner**: Removes `%TEMP%` junk files to free disk space and reduce disk thrashing.
  - **1-Click DNS Cache Flush**: Instantly fixes DNS resolution issues (`ipconfig /flushdns`).
  - **1-Click Power Plan Switcher**: Toggle between **Balanced** (silent fans & cool CPU) and **High Performance** directly from the UI.
- 🪶 **Ultra Lightweight**: Standalone ~4.2 MB binary consuming only ~25–35 MB of RAM (using native WebView2 with zero Electron bloat).

---

## 🚀 Download & Quick Start

### 1. Download Pre-built Executable
Download the latest **`budwin.exe`** directly from [GitHub Releases](https://github.com/crynn/budwin/releases) and double-click to run. No installer or runtime setup needed!

### 2. Build from Source

**Prerequisites:** [Go 1.22+](https://go.dev/dl/) & [Node.js](https://nodejs.org/)

```powershell
# 1. Clone repository
git clone https://github.com/crynn/budwin.git
cd budwin

# 2. Build Frontend
cd frontend
npm install
npm run build
cd ..

# 3. Build Standalone Binary
go build -ldflags "-H windowsgui -s -w" -o ./build/bin/budwin.exe .
```

---

## 🛠️ Architecture

```
budwin/
├── frontend/               # React 18 + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/     # Navbar, MetricCard, Sparkline, EndProcessModal
│   │   ├── views/          # Overview, Processes, Storage, Optimizer
│   │   ├── App.tsx         # Main UI Coordinator
│   │   └── types.ts        # TypeScript models
├── pkg/
│   ├── hardware/           # Go telemetry engine (CPU, RAM, Disk, Net, NVIDIA GPU)
│   ├── process/            # Process leaderboard, safety rules & termination
│   └── optimizer/          # 1-Click Temp cleanup, Flush DNS, Power Plan
├── app.go                  # Go-to-TypeScript bridge API
├── main.go                 # Native Windows window configuration
├── build.ps1               # 1-Click build script
└── README.md
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
