package hardware

import (
	"fmt"
	"sync"
	"time"

	"github.com/shirou/gopsutil/v3/process"
)

type AlertItem struct {
	ID          string    `json:"id"`
	Type        string    `json:"type"`        // "thermal" | "rogue_cpu" | "memory_spike"
	Severity    string    `json:"severity"`    // "warning" | "critical"
	Title       string    `json:"title"`
	Description string    `json:"description"`
	ActionLabel string    `json:"actionLabel"`
	TargetPid   int32     `json:"targetPid,omitempty"`
	Timestamp   time.Time `json:"timestamp"`
}

type AlertEngine struct {
	mu           sync.RWMutex
	alerts       []AlertItem
	lastThermal  time.Time
	lastRogue    time.Time
}

var (
	engineInstance *AlertEngine
	engineOnce     sync.Once
)

func GetAlertEngine() *AlertEngine {
	engineOnce.Do(func() {
		engineInstance = &AlertEngine{
			alerts: make([]AlertItem, 0),
		}
	})
	return engineInstance
}

func (ae *AlertEngine) CheckTelemetry(telemetry TelemetrySnapshot) {
	ae.mu.Lock()
	defer ae.mu.Unlock()

	now := time.Now()

	// 1. GPU Thermal Check (Critical >83°C)
	if telemetry.Gpu.IsAvailable && telemetry.Gpu.TemperatureC >= 83 {
		if now.Sub(ae.lastThermal) > 60*time.Second {
			ae.lastThermal = now
			ae.addAlert(AlertItem{
				ID:          fmt.Sprintf("thermal-%d", now.Unix()),
				Type:        "thermal",
				Severity:    "critical",
				Title:       fmt.Sprintf("High GPU Thermal: %d°C", telemetry.Gpu.TemperatureC),
				Description: fmt.Sprintf("%s is running hot (%d°C). Consider engaging Balanced Power Plan to reduce GPU heat.", telemetry.Gpu.Name, telemetry.Gpu.TemperatureC),
				ActionLabel: "Cool Down GPU",
				Timestamp:   now,
			})
		}
	}

	// 2. Rogue CPU Process Check (>45% CPU on single non-protected app)
	if now.Sub(ae.lastRogue) > 45*time.Second {
		procs, err := process.Processes()
		if err == nil {
			for _, p := range procs {
				cpuP, err := p.CPUPercent()
				if err == nil && cpuP > 45.0 {
					name, err := p.Name()
					if err == nil && name != "budwin.exe" && name != "explorer.exe" && name != "dwm.exe" && name != "System" {
						ae.lastRogue = now
						ae.addAlert(AlertItem{
							ID:          fmt.Sprintf("rogue-%d", p.Pid),
							Type:        "rogue_cpu",
							Severity:    "warning",
							Title:       fmt.Sprintf("Rogue CPU Process: %s", name),
							Description: fmt.Sprintf("%s (PID: %d) is consuming %.1f%% CPU in the background.", name, p.Pid, cpuP),
							ActionLabel: "Terminate Process",
							TargetPid:   p.Pid,
							Timestamp:   now,
						})
						break
					}
				}
			}
		}
	}
}

func (ae *AlertEngine) addAlert(item AlertItem) {
	var filtered []AlertItem
	for _, a := range ae.alerts {
		if a.Type != item.Type {
			filtered = append(filtered, a)
		}
	}
	ae.alerts = append([]AlertItem{item}, filtered...)
	if len(ae.alerts) > 5 {
		ae.alerts = ae.alerts[:5]
	}
}

func (ae *AlertEngine) GetAlerts() []AlertItem {
	ae.mu.RLock()
	defer ae.mu.RUnlock()
	return ae.alerts
}

func (ae *AlertEngine) DismissAlert(id string) {
	ae.mu.Lock()
	defer ae.mu.Unlock()
	var next []AlertItem
	for _, a := range ae.alerts {
		if a.ID != id {
			next = append(next, a)
		}
	}
	ae.alerts = next
}
