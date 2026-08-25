package main

import (
	"context"
	"syscall"

	"github.com/Iiviavs/budwin/pkg/hardware"
	"github.com/Iiviavs/budwin/pkg/optimizer"
	"github.com/Iiviavs/budwin/pkg/process"
	"github.com/Iiviavs/budwin/pkg/storage"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

var (
	user32               = syscall.NewLazyDLL("user32.dll")
	procGetSystemMetrics = user32.NewProc("GetSystemMetrics")
)

func getScreenSize() (int, int) {
	w, _, _ := procGetSystemMetrics.Call(0) // SM_CXSCREEN
	h, _, _ := procGetSystemMetrics.Call(1) // SM_CYSCREEN
	return int(w), int(h)
}

// App struct
type App struct {
	ctx     context.Context
	sampler *hardware.Sampler
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		sampler: hardware.NewSampler(),
	}
}

// startup is called when the app starts.
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	// Start Auto-Boost Game Watchdog
	_ = optimizer.GetAutoBoostManager()
}

func (a *App) GetTelemetry() hardware.TelemetrySnapshot {
	telemetry := a.sampler.GetTelemetry()
	// Pipe GPU data to benchmark engine if active
	if telemetry.Gpu.IsAvailable {
		optimizer.GetBenchmarkEngine().RecordGpuTelemetry(telemetry.Gpu.CoreUtilization, telemetry.Gpu.TemperatureC)
	}
	return telemetry
}

func (a *App) GetProcesses() []process.ProcessItem {
	return process.GetProcesses()
}

func (a *App) GetDrives() []hardware.DriveItem {
	return hardware.GetDrives()
}

// Storage Space Reclaimer & Game Duplicate Hunter API
func (a *App) ScanCleanableStorage() storage.StorageScanResult {
	return storage.ScanCleanableStorage()
}

func (a *App) CleanStorageCategory(categoryID string) float64 {
	return storage.CleanStorageCategory(categoryID)
}

func (a *App) ScanGameDuplicates() storage.GameHunterScanResult {
	return storage.ScanGameDuplicates()
}

func (a *App) PurgeGameDuplicates(itemID string) float64 {
	return storage.PurgeGameDuplicates(itemID)
}

// Audio Latency & Exclusive Buffer API
func (a *App) GetAudioLatencyStatus() optimizer.AudioLatencyStatus {
	return optimizer.GetAudioLatencyStatus()
}

func (a *App) OptimizeAudioLatency() optimizer.AudioLatencyStatus {
	return optimizer.OptimizeAudioLatency()
}

// Competitive FPS Maxer & Core Unparker API
func (a *App) ApplyUltimateFpsBoost() optimizer.FpsTweakStatus {
	return optimizer.ApplyUltimateFpsBoost()
}

func (a *App) GetFpsOptimizationStatus() optimizer.FpsTweakStatus {
	return optimizer.GetFpsOptimizationStatus()
}

// Screen Share & Stealth Silent Fan Profile API
func (a *App) ToggleScreenShareSilentMode(enable bool) optimizer.SilentModeStatus {
	return optimizer.ToggleScreenShareSilentMode(enable)
}

func (a *App) GetSilentModeStatus() optimizer.SilentModeStatus {
	return optimizer.GetSilentModeStatus()
}

func (a *App) KillProcess(pid int32) bool {
	err := process.KillProcess(pid)
	return err == nil
}

func (a *App) CleanTempFiles() float64 {
	freed, err := optimizer.CleanTempFiles()
	if err != nil {
		return 0
	}
	return freed
}

func (a *App) FlushDNS() bool {
	err := optimizer.FlushDNS()
	return err == nil
}

func (a *App) SetPowerPlan(plan string) bool {
	err := optimizer.SetPowerPlan(plan)
	return err == nil
}

func (a *App) GetActivePowerPlan() string {
	return optimizer.GetActivePowerPlan()
}

// Input Lag Reducer API
func (a *App) ToggleHighPrecisionTimer(enable bool) bool {
	if enable {
		return optimizer.EnableHighPrecisionTimer()
	}
	return optimizer.DisableHighPrecisionTimer()
}

func (a *App) IsTimerActive() bool {
	return optimizer.IsTimerActive()
}

func (a *App) OptimizeInputLatency() bool {
	return optimizer.OptimizeInputLatency()
}

// Game Boost & Memory Cleaner API
func (a *App) ToggleGameBoost(enable bool) optimizer.GameBoostResult {
	if enable {
		return optimizer.EnableGameBoost()
	}
	return optimizer.DisableGameBoost()
}

func (a *App) IsGameBoostActive() bool {
	return optimizer.IsGameBoostActive()
}

func (a *App) PurgeStandbyRAM() float64 {
	return optimizer.PurgeStandbyRAM()
}

// Auto-Boost Game Watchdog API
func (a *App) GetAutoBoostStatus() optimizer.AutoBoostStatus {
	return optimizer.GetAutoBoostManager().GetStatus()
}

func (a *App) SetAutoBoostEnabled(enable bool) bool {
	return optimizer.GetAutoBoostManager().SetAutoBoostEnabled(enable)
}

// Benchmark & Gaming Session Logger API
func (a *App) StartBenchmark() optimizer.BenchmarkSummary {
	return optimizer.GetBenchmarkEngine().StartBenchmark()
}

func (a *App) StopBenchmark() optimizer.BenchmarkSummary {
	return optimizer.GetBenchmarkEngine().StopBenchmark()
}

func (a *App) GetBenchmarkStatus() optimizer.BenchmarkSummary {
	return optimizer.GetBenchmarkEngine().GetStatus()
}

// Startup Apps Manager API
func (a *App) GetStartupItems() []optimizer.StartupItem {
	return optimizer.GetStartupItems()
}

func (a *App) ToggleStartupItem(name string, location string, enable bool) bool {
	return optimizer.ToggleStartupItem(name, location, enable)
}

// Multi-Monitor Gaming Mode API
func (a *App) GetMonitors() []optimizer.MonitorInfo {
	return optimizer.GetMonitors()
}

func (a *App) GetMultiMonitorSettings() optimizer.MultiMonitorSettings {
	return optimizer.GetMultiMonitorSettings()
}

func (a *App) SetMultiMonitorSettings(settings optimizer.MultiMonitorSettings) optimizer.MultiMonitorSettings {
	return optimizer.SetMultiMonitorSettings(settings)
}

// Smart Thermal & Rogue Process Alerts API
func (a *App) GetActiveAlerts() []hardware.AlertItem {
	return hardware.GetAlertEngine().GetAlerts()
}

func (a *App) DismissAlert(id string) {
	hardware.GetAlertEngine().DismissAlert(id)
}

func (a *App) ResolveAlert(id string, alertType string, targetPid int32) bool {
	if alertType == "thermal" {
		optimizer.SetPowerPlan("Balanced")
	} else if alertType == "rogue_cpu" && targetPid > 0 {
		process.KillProcess(targetPid)
	}
	hardware.GetAlertEngine().DismissAlert(id)
	return true
}

// Window & Discord Game Overlay Controls
func (a *App) SetAlwaysOnTop(onTop bool) {
	runtime.WindowSetAlwaysOnTop(a.ctx, onTop)
}

func (a *App) SetHudMode(isHud bool) {
	if isHud {
		runtime.WindowSetAlwaysOnTop(a.ctx, true)
		hudW, hudH := 345, 36
		runtime.WindowSetMinSize(a.ctx, hudW, hudH)
		runtime.WindowSetMaxSize(a.ctx, hudW, hudH)
		runtime.WindowSetSize(a.ctx, hudW, hudH)

		screenWidth, _ := getScreenSize()
		if screenWidth == 0 {
			screenWidth = 1920
		}
		runtime.WindowSetPosition(a.ctx, screenWidth-hudW-20, 20)
	} else {
		runtime.WindowSetAlwaysOnTop(a.ctx, false)
		runtime.WindowSetMinSize(a.ctx, 380, 520)
		runtime.WindowSetMaxSize(a.ctx, 3840, 2160)
		runtime.WindowSetSize(a.ctx, 1060, 700)
		runtime.WindowCenter(a.ctx)
	}
}

func (a *App) SetMiniMode(isMini bool) {
	if isMini {
		runtime.WindowSetAlwaysOnTop(a.ctx, false)
		miniW, miniH := 380, 580
		runtime.WindowSetMinSize(a.ctx, miniW, miniH)
		runtime.WindowSetMaxSize(a.ctx, miniW, miniH)
		runtime.WindowSetSize(a.ctx, miniW, miniH)

		screenWidth, screenHeight := getScreenSize()
		if screenWidth == 0 {
			screenWidth = 1920
			screenHeight = 1080
		}
		// Position at bottom-right right above the Windows taskbar
		runtime.WindowSetPosition(a.ctx, screenWidth-miniW-16, screenHeight-miniH-56)
	} else {
		runtime.WindowSetAlwaysOnTop(a.ctx, false)
		runtime.WindowSetMinSize(a.ctx, 380, 520)
		runtime.WindowSetMaxSize(a.ctx, 3840, 2160)
		runtime.WindowSetSize(a.ctx, 1060, 700)
		runtime.WindowCenter(a.ctx)
	}
}

func (a *App) HideWindow() {
	runtime.WindowHide(a.ctx)
}

func (a *App) ShowWindow() {
	runtime.WindowShow(a.ctx)
}
