package main

import (
	"context"

	"budwin/pkg/hardware"
	"budwin/pkg/optimizer"
	"budwin/pkg/process"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

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
		runtime.WindowSetSize(a.ctx, 360, 68)
	} else {
		runtime.WindowSetAlwaysOnTop(a.ctx, false)
		runtime.WindowSetSize(a.ctx, 1060, 700)
	}
}

func (a *App) HideWindow() {
	runtime.WindowHide(a.ctx)
}

func (a *App) ShowWindow() {
	runtime.WindowShow(a.ctx)
}
