package hardware

import (
	"bytes"
	"math"
	"os/exec"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/net"
)

type Sampler struct {
	mu           sync.Mutex
	prevNetIn    uint64
	prevNetOut   uint64
	prevNetTime  time.Time
	prevDiskR    uint64
	prevDiskW    uint64
	prevDiskTime time.Time
	cpuModel     string
	cpuCores     int
}

func NewSampler() *Sampler {
	s := &Sampler{
		prevNetTime:  time.Now(),
		prevDiskTime: time.Now(),
		cpuModel:     "11th Gen Intel(R) Core(TM) i5-11400F",
		cpuCores:     12,
	}

	info, err := cpu.Info()
	if err == nil && len(info) > 0 {
		s.cpuModel = info[0].ModelName
		s.cpuCores = int(info[0].Cores)
		if s.cpuCores <= 0 {
			s.cpuCores = 12
		}
	}

	return s
}

func (s *Sampler) GetTelemetry() TelemetrySnapshot {
	s.mu.Lock()
	defer s.mu.Unlock()

	var snapshot TelemetrySnapshot
	snapshot.CpuModel = s.cpuModel
	snapshot.CpuCores = s.cpuCores

	// 1. CPU
	percentages, err := cpu.Percent(0, false)
	if err == nil && len(percentages) > 0 {
		snapshot.CpuPercent = percentages[0]
	}

	// 2. RAM
	vMem, err := mem.VirtualMemory()
	if err == nil {
		snapshot.RamPercent = vMem.UsedPercent
		snapshot.RamUsedGb = float64(vMem.Used) / (1024 * 1024 * 1024)
		snapshot.RamTotalGb = float64(vMem.Total) / (1024 * 1024 * 1024)
	}

	// 3. Network
	now := time.Now()
	netIOCounters, err := net.IOCounters(false)
	if err == nil && len(netIOCounters) > 0 {
		totalIn := netIOCounters[0].BytesRecv
		totalOut := netIOCounters[0].BytesSent
		elapsedSec := now.Sub(s.prevNetTime).Seconds()

		if elapsedSec > 0 && s.prevNetIn > 0 {
			snapshot.NetInKb = float64(totalIn-s.prevNetIn) / (elapsedSec * 1024)
			snapshot.NetOutKb = float64(totalOut-s.prevNetOut) / (elapsedSec * 1024)
		}

		s.prevNetIn = totalIn
		s.prevNetOut = totalOut
		s.prevNetTime = now
	}

	// 4. Disk IO
	diskCounters, err := disk.IOCounters()
	if err == nil {
		var totalRead, totalWrite uint64
		for _, d := range diskCounters {
			totalRead += d.ReadBytes
			totalWrite += d.WriteBytes
		}
		elapsedDiskSec := now.Sub(s.prevDiskTime).Seconds()

		if elapsedDiskSec > 0 && s.prevDiskR > 0 {
			snapshot.DiskReadMb = float64(totalRead-s.prevDiskR) / (elapsedDiskSec * 1024 * 1024)
			snapshot.DiskWriteMb = float64(totalWrite-s.prevDiskW) / (elapsedDiskSec * 1024 * 1024)
		}

		s.prevDiskR = totalRead
		s.prevDiskW = totalWrite
		s.prevDiskTime = now
	}

	// 5. NVIDIA GPU Telemetry (Hidden Process)
	snapshot.Gpu = sampleNvidiaGpu()

	// 6. Check for Smart Thermal & Rogue Alerts
	GetAlertEngine().CheckTelemetry(snapshot)

	return snapshot
}

func sampleNvidiaGpu() GpuTelemetry {
	var gpu GpuTelemetry
	gpu.IsAvailable = false

	cmd := exec.Command("nvidia-smi", "--query-gpu=name,utilization.gpu,utilization.memory,memory.total,memory.used,temperature.gpu,fan.speed,power.draw", "--format=csv,noheader,nounits")
	// Hide console window popup
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}

	var out bytes.Buffer
	cmd.Stdout = &out
	err := cmd.Run()
	if err != nil {
		return gpu
	}

	parts := strings.Split(strings.TrimSpace(out.String()), ",")
	if len(parts) >= 8 {
		gpu.IsAvailable = true
		gpu.Name = strings.TrimSpace(parts[0])

		if v, err := strconv.ParseUint(strings.TrimSpace(parts[1]), 10, 32); err == nil {
			gpu.CoreUtilization = uint32(v)
		}
		if v, err := strconv.ParseUint(strings.TrimSpace(parts[2]), 10, 32); err == nil {
			gpu.MemoryUtilization = uint32(v)
		}
		if v, err := strconv.ParseUint(strings.TrimSpace(parts[3]), 10, 64); err == nil {
			gpu.VramTotalMb = v
		}
		if v, err := strconv.ParseUint(strings.TrimSpace(parts[4]), 10, 64); err == nil {
			gpu.VramUsedMb = v
		}
		if v, err := strconv.ParseUint(strings.TrimSpace(parts[5]), 10, 32); err == nil {
			gpu.TemperatureC = uint32(v)
		}
		if v, err := strconv.ParseUint(strings.TrimSpace(parts[6]), 10, 32); err == nil {
			gpu.FanSpeedPercent = uint32(v)
		}
		if v, err := strconv.ParseFloat(strings.TrimSpace(parts[7]), 64); err == nil {
			gpu.PowerWatts = uint32(math.Round(v))
		}
	}

	return gpu
}

func GetDrives() []DriveItem {
	var items []DriveItem
	partitions, err := disk.Partitions(true)
	if err != nil {
		return items
	}

	for _, p := range partitions {
		if p.Fstype == "" {
			continue
		}

		usage, err := disk.Usage(p.Mountpoint)
		if err == nil && usage.Total > 0 {
			letter := strings.TrimSuffix(p.Mountpoint, ":\\")
			letter = strings.TrimSuffix(letter, ":")

			totalGb := float64(usage.Total) / (1024 * 1024 * 1024)
			freeGb := float64(usage.Free) / (1024 * 1024 * 1024)
			usedGb := float64(usage.Used) / (1024 * 1024 * 1024)

			name := "Local Disk"
			if letter == "C" {
				name = "System Volume"
			} else if letter == "D" {
				name = "Games & Data"
			}

			items = append(items, DriveItem{
				Letter:      letter,
				Name:        name,
				TotalGb:     math.Round(totalGb*10) / 10,
				FreeGb:      math.Round(freeGb*10) / 10,
				UsedGb:      math.Round(usedGb*10) / 10,
				PercentUsed: math.Round(usage.UsedPercent*10) / 10,
			})
		}
	}

	return items
}
