package main

import (
	"context"
	"syscall"

	"budwin/pkg/hardware"
	"budwin/pkg/optimizer"
	"budwin/pkg/process"
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
}

func (a *App) GetTelemetry() hardware.TelemetrySnapshot {
	return a.sampler.GetTelemetry()
}

func (a *App) GetProcesses() []process.ProcessItem {
	return process.GetProcesses()
}

func (a *App) GetDrives() []hardware.DriveItem {
	return hardware.GetDrives()
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

// Startup Apps Manager API
func (a *App) GetStartupItems() []optimizer.StartupItem {
	return optimizer.GetStartupItems()
}

func (a *App) ToggleStartupItem(name string, location string, enable bool) bool {
	return optimizer.ToggleStartupItem(name, location, enable)
}

// Window & HUD Controls
func (a *App) SetAlwaysOnTop(onTop bool) {
	runtime.WindowSetAlwaysOnTop(a.ctx, onTop)
}

func (a *App) SetHudMode(isHud bool) {
	if isHud {
		runtime.WindowSetAlwaysOnTop(a.ctx, true)
		runtime.WindowSetMinSize(a.ctx, 240, 32)
		runtime.WindowSetSize(a.ctx, 320, 38)
	} else {
		runtime.WindowSetAlwaysOnTop(a.ctx, false)
		runtime.WindowSetMinSize(a.ctx, 380, 520)
		runtime.WindowSetSize(a.ctx, 1060, 700)
	}
}

func (a *App) SnapHudPosition(corner string) {
	screenWidth, screenHeight := getScreenSize()
	if screenWidth == 0 {
		screenWidth = 1920
		screenHeight = 1080
	}
	w, h := runtime.WindowGetSize(a.ctx)

	switch corner {
	case "top-left":
		runtime.WindowSetPosition(a.ctx, 16, 16)
	case "top-right":
		runtime.WindowSetPosition(a.ctx, screenWidth-w-16, 16)
	case "bottom-right":
		runtime.WindowSetPosition(a.ctx, screenWidth-w-16, screenHeight-h-50)
	case "bottom-left":
		runtime.WindowSetPosition(a.ctx, 16, screenHeight-h-50)
	}
}

func (a *App) HideWindow() {
	runtime.WindowHide(a.ctx)
}

func (a *App) ShowWindow() {
	runtime.WindowShow(a.ctx)
}
