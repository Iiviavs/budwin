package optimizer

import (
	"syscall"
	"unsafe"
	"golang.org/x/sys/windows/registry"
)

var (
	winmmDLL        = syscall.NewLazyDLL("winmm.dll")
	timeBeginPeriod = winmmDLL.NewProc("timeBeginPeriod")
	timeEndPeriod   = winmmDLL.NewProc("timeEndPeriod")

	user32DLL          = syscall.NewLazyDLL("user32.dll")
	systemParametersInfo = user32DLL.NewProc("SystemParametersInfoW")
)

const (
	SPI_SETMOUSE           = 0x001D
	SPI_SETMOUSESPEED      = 0x0071
	SPIF_UPDATEINIFILE     = 0x01
	SPIF_SENDCHANGE        = 0x02
)

var timerActive = false

// Enable 1.0ms high-resolution timer resolution
func EnableHighPrecisionTimer() bool {
	r, _, _ := timeBeginPeriod.Call(uintptr(1))
	if r == 0 {
		timerActive = true
		return true
	}
	return false
}

func DisableHighPrecisionTimer() bool {
	if timerActive {
		timeEndPeriod.Call(uintptr(1))
		timerActive = false
		return true
	}
	return true
}

func IsTimerActive() bool {
	return timerActive
}

// Optimizes mouse for 1:1 raw linear response (disables acceleration)
func OptimizeMouseRawInput() bool {
	// 1. Set mouse speed to standard 10 (out of 20 = 1:1 baseline)
	systemParametersInfo.Call(
		uintptr(SPI_SETMOUSESPEED),
		0,
		uintptr(10),
		uintptr(SPIF_UPDATEINIFILE|SPIF_SENDCHANGE),
	)

	// 2. Disable mouse acceleration thresholds: [Threshold1, Threshold2, Acceleration] -> [0, 0, 0]
	mouseParams := [3]int32{0, 0, 0}
	r, _, _ := systemParametersInfo.Call(
		uintptr(SPI_SETMOUSE),
		0,
		uintptr(unsafe.Pointer(&mouseParams[0])),
		uintptr(SPIF_UPDATEINIFILE|SPIF_SENDCHANGE),
	)

	return r != 0
}

// Disables Windows GameDVR background recording buffer for lower DWM input latency
func DisableGameDVR() bool {
	// HKCU\System\GameConfigStore -> GameDVR_Enabled = 0
	k, err := registry.OpenKey(registry.CURRENT_USER, `System\GameConfigStore`, registry.SET_VALUE)
	if err == nil {
		k.SetDWordValue("GameDVR_Enabled", 0)
		k.SetDWordValue("GameDVR_FSEBehaviorMode", 2)
		k.Close()
	}

	// HKLM\SOFTWARE\Policies\Microsoft\Windows\GameDVR -> AllowGameDVR = 0 (optional if user has rights)
	k2, err := registry.OpenKey(registry.CURRENT_USER, `Software\Microsoft\Windows\CurrentVersion\GameDVR`, registry.SET_VALUE)
	if err == nil {
		k2.SetDWordValue("AppCaptureEnabled", 0)
		k2.Close()
	}

	return true
}

// Run full latency optimizer
func OptimizeInputLatency() bool {
	EnableHighPrecisionTimer()
	OptimizeMouseRawInput()
	DisableGameDVR()
	return true
}
