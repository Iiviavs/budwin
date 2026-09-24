package optimizer

import (
	"math"
	"sync"
	"syscall"
	"unsafe"

	"github.com/shirou/gopsutil/v3/process"
)

var (
	kernel32DLL        = syscall.NewLazyDLL("kernel32.dll")
	psapiDLL           = syscall.NewLazyDLL("psapi.dll")
	emptyWorkingSet    = psapiDLL.NewProc("EmptyWorkingSet")
	openProcess        = kernel32DLL.NewProc("OpenProcess")
	closeHandle        = kernel32DLL.NewProc("CloseHandle")
	setPriorityClass   = kernel32DLL.NewProc("SetPriorityClass")
	getForegroundWnd   = user32DLL.NewProc("GetForegroundWindow")
	getWndThreadProcId = user32DLL.NewProc("GetWindowThreadProcessId")
)

const (
	PROCESS_SET_QUOTA         = 0x0100
	PROCESS_QUERY_INFORMATION = 0x0400
	PROCESS_SET_INFORMATION   = 0x0200
	HIGH_PRIORITY_CLASS       = 0x00000080
	NORMAL_PRIORITY_CLASS     = 0x00000020
)

type GameBoostResult struct {
	Active      bool    `json:"active"`
	FreedRamMb  float64 `json:"freedRamMb"`
	TimerActive bool    `json:"timerActive"`
	PowerPlan   string  `json:"powerPlan"`
}

var isGameBoostActive = false
var gameBoostMu sync.RWMutex
func PurgeStandbyRAM() float64 {
	procs, err := process.Processes()
	if err != nil {
		return 0
	}

	var totalFreedBytes int64

	for _, p := range procs {
		memBefore, err := p.MemoryInfo()
		if err != nil || memBefore == nil {
			continue
		}
		hProcess, _, _ := openProcess.Call(
			uintptr(PROCESS_SET_QUOTA|PROCESS_QUERY_INFORMATION),
			0,
			uintptr(p.Pid),
		)

		if hProcess != 0 {
			r, _, _ := emptyWorkingSet.Call(hProcess)
			closeHandle.Call(hProcess)

			if r != 0 {
				memAfter, err := p.MemoryInfo()
				if err == nil && memAfter != nil && memBefore.RSS > memAfter.RSS {
					totalFreedBytes += int64(memBefore.RSS - memAfter.RSS)
				}
			}
		}
	}

	freedMb := float64(totalFreedBytes) / (1024 * 1024)

	return math.Round(freedMb*10) / 10
}
func BoostForegroundGame() bool {
	hWnd, _, _ := getForegroundWnd.Call()
	if hWnd == 0 {
		return false
	}

	var pid uint32
	getWndThreadProcId.Call(hWnd, uintptr(unsafe.Pointer(&pid)))
	if pid == 0 {
		return false
	}

	hProcess, _, _ := openProcess.Call(
		uintptr(PROCESS_SET_INFORMATION),
		0,
		uintptr(pid),
	)
	if hProcess != 0 {
		setPriorityClass.Call(hProcess, uintptr(HIGH_PRIORITY_CLASS))
		closeHandle.Call(hProcess)
		return true
	}
	return false
}
func SetProcessHighPriority(pid int32) bool {
	if pid == 0 {
		return false
	}
	hProcess, _, _ := openProcess.Call(
		uintptr(PROCESS_SET_INFORMATION),
		0,
		uintptr(pid),
	)
	if hProcess != 0 {
		setPriorityClass.Call(hProcess, uintptr(HIGH_PRIORITY_CLASS))
		closeHandle.Call(hProcess)
		return true
	}
	return false
}
func EnableGameBoost() GameBoostResult {
	gameBoostMu.Lock()
	defer gameBoostMu.Unlock()
	isGameBoostActive = true
	EnableHighPrecisionTimer()
	OptimizeMouseRawInput()
	DisableGameDVR()
	SetPowerPlan("High Performance")
	freedRam := PurgeStandbyRAM()
	BoostForegroundGame()

	return GameBoostResult{
		Active:      true,
		FreedRamMb:  freedRam,
		TimerActive: true,
		PowerPlan:   "High Performance",
	}
}
func DisableGameBoost() GameBoostResult {
	gameBoostMu.Lock()
	defer gameBoostMu.Unlock()
	isGameBoostActive = false
	SetPowerPlan("Balanced")

	return GameBoostResult{
		Active:      false,
		FreedRamMb:  0,
		TimerActive: IsTimerActive(),
		PowerPlan:   "Balanced",
	}
}

func IsGameBoostActive() bool {
	gameBoostMu.RLock()
	defer gameBoostMu.RUnlock()
	return isGameBoostActive
}
