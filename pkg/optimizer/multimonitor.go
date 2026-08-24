package optimizer

import (
	"syscall"
	"unsafe"
)

type MonitorInfo struct {
	Index     int    `json:"index"`
	Name      string `json:"name"`
	IsPrimary bool   `json:"isPrimary"`
	Width     int    `json:"width"`
	Height    int    `json:"height"`
}

type MultiMonitorSettings struct {
	DimSecondaryMonitors bool `json:"dimSecondaryMonitors"`
	AutoDimOnGameLaunch  bool `json:"autoDimOnGameLaunch"`
}

var (
	enumDisplayMonitors = user32DLL.NewProc("EnumDisplayMonitors")
	getMonitorInfoW     = user32DLL.NewProc("GetMonitorInfoW")
)

type tagMONITORINFOEXW struct {
	cbSize    uint32
	rcMonitor [4]int32
	rcWork    [4]int32
	dwFlags   uint32
	szDevice  [32]uint16
}

const MONITORINFOF_PRIMARY = 0x00000001

var currentMonitorSettings = MultiMonitorSettings{
	DimSecondaryMonitors: false,
	AutoDimOnGameLaunch:  true,
}

// GetMonitors lists all connected physical displays
func GetMonitors() []MonitorInfo {
	var monitors []MonitorInfo
	idx := 0

	cb := syscall.NewCallback(func(hMonitor, hdcMonitor, lprcMonitor, dwData uintptr) uintptr {
		var mi tagMONITORINFOEXW
		mi.cbSize = uint32(unsafe.Sizeof(mi))

		ret, _, _ := getMonitorInfoW.Call(hMonitor, uintptr(unsafe.Pointer(&mi)))
		if ret != 0 {
			w := int(mi.rcMonitor[2] - mi.rcMonitor[0])
			h := int(mi.rcMonitor[3] - mi.rcMonitor[1])
			isPrimary := (mi.dwFlags & MONITORINFOF_PRIMARY) != 0

			devName := syscall.UTF16ToString(mi.szDevice[:])
			if devName == "" {
				devName = "Generic Display"
			}

			monitors = append(monitors, MonitorInfo{
				Index:     idx,
				Name:      devName,
				IsPrimary: isPrimary,
				Width:     w,
				Height:    h,
			})
			idx++
		}
		return 1
	})

	enumDisplayMonitors.Call(0, 0, cb, 0)

	if len(monitors) == 0 {
		monitors = append(monitors, MonitorInfo{
			Index:     0,
			Name:      "Primary Display",
			IsPrimary: true,
			Width:     1920,
			Height:    1080,
		})
	}

	return monitors
}

func GetMultiMonitorSettings() MultiMonitorSettings {
	return currentMonitorSettings
}

func SetMultiMonitorSettings(settings MultiMonitorSettings) MultiMonitorSettings {
	currentMonitorSettings = settings
	return currentMonitorSettings
}
