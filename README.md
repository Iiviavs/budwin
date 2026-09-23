<div align="center">
  <img src="frontend/public/logo.png" width="96" height="96" alt="budwin" />
  <h1>budwin</h1>
  <p>A minimalist Windows tray companion for hardware monitoring, latency tuning, and quick system tweaks.</p>

  <p>
    <a href="https://github.com/Iiviavs/budwin/releases"><img src="https://img.shields.io/github/v/release/Iiviavs/budwin?color=crimson&style=flat-square" alt="Release" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="License" /></a>
    <img src="https://img.shields.io/badge/platform-Windows%2010%20%2F%2011-23272e?style=flat-square" alt="Windows" />
    <img src="https://img.shields.io/badge/stack-Go%20%2B%20React-23272e?style=flat-square" alt="Stack" />
  </p>
</div>

---

**budwin** runs as a lightweight (~12MB) standalone app in your system tray. It's built for people who want quick system stats, snappy latency optimizations, and hassle-free cache cleaning without running heavy background bloatware.

<br/>

## Highlights

### ⚡ Low Latency & Gaming
- **1.0ms High-Resolution Timer**: Enforces a 1000 Hz kernel clock (`timeBeginPeriod`) to keep mouse and keyboard polling tight.
- **CPU Core Unparking**: Stops Windows from putting logical cores to sleep mid-game to prevent micro-stuttering.
- **Audio Buffer Tuning (MMCSS)**: Sets WASAPI scheduling to high realtime priority for lower sound latency.
- **1:1 Raw Input**: Removes Windows mouse acceleration curves directly.

### 🤫 Quiet Fan / Screen Share Mode
- **No loud vents during screen share**: Downclocks aggressive turbo boost spikes when capturing or streaming desktop, dropping CPU temps by ~10–15°C so fans stay quiet.

### 🧹 Disk & Cache Cleaner
- **Shader Caches**: Clears bloated DirectX, NVIDIA, and Vulkan shader cache files.
- **System Junk**: Wipes `%TEMP%`, crash dumps, and Windows Update download leftovers.
- **Game Duplicate Hunter**: Finds and purges redundant DirectX/VC++ redistributable packages and leftover game download chunks.

### 📊 Telemetry & HUD
- **Real-time Sparklines**: 60-second rolling charts for CPU, GPU (with VRAM & temps), RAM, Network, and Disk.
- **Floating Mini HUD**: Transparent overlay pill you can keep pinned over games or double-click to expand.
- **Tray-Docked Mini Companion**: Left-click the tray icon to quickly glance at stats right above the taskbar.

### 🛡️ Process Manager
- Searchable list sorted by RAM usage with safety shields (🟢 Safe user apps, 🟡 Background helpers, 🔴 Protected system processes like `dwm.exe` and `explorer.exe`).

---

## Download

Grab the latest standalone **`budwin.exe`** from the [**Releases**](https://github.com/Iiviavs/budwin/releases) page.

No installation required — just download and run.

> **Tip:** You can enable **Start with Windows** inside *Preferences* to keep it docked to your tray on boot.

---

## Build from Source

Requirements: [Go 1.22+](https://go.dev/dl/) and [Node.js 18+](https://nodejs.org/).

```powershell
# Clone
git clone https://github.com/Iiviavs/budwin.git
cd budwin

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Compile standalone executable
go build -tags desktop,production -ldflags "-w -s -H windowsgui" -o build/bin/budwin.exe .
```

Or just run `./build.ps1`.

---

## License

MIT © [Iiviavs](https://github.com/Iiviavs)
