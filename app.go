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

// Window visibility controls
func (a *App) HideWindow() {
	runtime.WindowHide(a.ctx)
}

func (a *App) ShowWindow() {
	runtime.WindowShow(a.ctx)
}
