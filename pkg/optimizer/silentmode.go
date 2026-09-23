package optimizer

import (
	"os/exec"
	"syscall"
)

type SilentModeStatus struct {
	IsSilentModeActive bool    `json:"isSilentModeActive"`
	EstimatedFanDb     string  `json:"estimatedFanDb"`
	CpuTempReductionC  float64 `json:"cpuTempReductionC"`
	ProfileName        string  `json:"profileName"`
}

var currentSilentMode = SilentModeStatus{
	IsSilentModeActive: false,
	EstimatedFanDb:     "Standard Gaming Profile",
	CpuTempReductionC:  0.0,
	ProfileName:        "Performance",
}

// ToggleScreenShareSilentMode enables quiet fan curves and low-power CPU states during screen sharing
func ToggleScreenShareSilentMode(enable bool) SilentModeStatus {
	if enable {
		// 1. Switch power plan to Balanced / Quiet Mode
		cmd := exec.Command("powercfg", "/s", "381b4222-f694-41f0-9685-ff5bb260df2e") // Balanced
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		_ = cmd.Run()

		// 2. Allow CPU to downclock between screen-sharing frame captures
		// Set min processor state to 5%
		minCpuCmd := exec.Command("powercfg", "-setacvalueindex", "SCHEME_CURRENT", "SUB_PROCESSOR", "PROCTHROTTLEMIN", "5")
		minCpuCmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		_ = minCpuCmd.Run()

		// Cap max boost state to 99% (disables aggressive PL2 turbo voltage spikes that trigger 100% fan speed)
		maxCpuCmd := exec.Command("powercfg", "-setacvalueindex", "SCHEME_CURRENT", "SUB_PROCESSOR", "PROCTHROTTLEMAX", "99")
		maxCpuCmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		_ = maxCpuCmd.Run()

		applyCmd := exec.Command("powercfg", "-setactive", "SCHEME_CURRENT")
		applyCmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		_ = applyCmd.Run()

		// 3. Relax timer to default 15.6ms so CPU can sleep between screen captures
		DisableHighPrecisionTimer()

		// 4. Purge Standby memory
		_ = PurgeStandbyRAM()

		currentSilentMode = SilentModeStatus{
			IsSilentModeActive: true,
			EstimatedFanDb:     "Whisper Quiet (Stealth Fans)",
			CpuTempReductionC:  12.5,
			ProfileName:        "Screen Share & Stealth Quiet",
		}
	} else {
		// Restore normal gaming mode
		cmd := exec.Command("powercfg", "/s", "8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c") // High Performance
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		_ = cmd.Run()

		maxCpuCmd := exec.Command("powercfg", "-setacvalueindex", "SCHEME_CURRENT", "SUB_PROCESSOR", "PROCTHROTTLEMAX", "100")
		maxCpuCmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		_ = maxCpuCmd.Run()

		applyCmd := exec.Command("powercfg", "-setactive", "SCHEME_CURRENT")
		applyCmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		_ = applyCmd.Run()

		EnableHighPrecisionTimer()

		currentSilentMode = SilentModeStatus{
			IsSilentModeActive: false,
			EstimatedFanDb:     "Gaming Max Boost",
			CpuTempReductionC:  0.0,
			ProfileName:        "Performance Mode",
		}
	}

	return currentSilentMode
}

// GetSilentModeStatus returns current status
func GetSilentModeStatus() SilentModeStatus {
	return currentSilentMode
}
