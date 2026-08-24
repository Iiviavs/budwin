package optimizer

import (
	"math"
	"sync"
	"time"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/mem"
)

type BenchmarkSummary struct {
	IsRunning       bool      `json:"isRunning"`
	DurationSeconds int       `json:"durationSeconds"`
	AvgCpuPercent   float64   `json:"avgCpuPercent"`
	MaxCpuPercent   float64   `json:"maxCpuPercent"`
	AvgRamPercent   float64   `json:"avgRamPercent"`
	MaxRamPercent   float64   `json:"maxRamPercent"`
	MaxGpuTemp      uint32    `json:"maxGpuTemp"`
	AvgGpuLoad      uint32    `json:"avgGpuLoad"`
	StabilityScore  int       `json:"stabilityScore"` // 0-100%
	Verdict         string    `json:"verdict"`        // "Excellent Stability", "Optimal Gaming Load", etc.
	StartTime       time.Time `json:"startTime"`
	SamplesCount    int       `json:"samplesCount"`
}

type BenchmarkEngine struct {
	mu           sync.RWMutex
	isRunning    bool
	startTime    time.Time
	cpuSamples   []float64
	ramSamples   []float64
	gpuSamples   []uint32
	gpuTemps     []uint32
	lastSummary  BenchmarkSummary
	stopChan     chan struct{}
}

var (
	benchInstance *BenchmarkEngine
	benchOnce     sync.Once
)

func GetBenchmarkEngine() *BenchmarkEngine {
	benchOnce.Do(func() {
		benchInstance = &BenchmarkEngine{
			cpuSamples:  make([]float64, 0),
			ramSamples:  make([]float64, 0),
			gpuSamples:  make([]uint32, 0),
			gpuTemps:    make([]uint32, 0),
		}
	})
	return benchInstance
}

func (b *BenchmarkEngine) StartBenchmark() BenchmarkSummary {
	b.mu.Lock()
	defer b.mu.Unlock()

	if b.isRunning {
		return b.getSummaryLocked()
	}

	b.isRunning = true
	b.startTime = time.Now()
	b.cpuSamples = make([]float64, 0)
	b.ramSamples = make([]float64, 0)
	b.gpuSamples = make([]uint32, 0)
	b.gpuTemps = make([]uint32, 0)
	b.stopChan = make(chan struct{})

	go b.samplingLoop()

	return b.getSummaryLocked()
}

func (b *BenchmarkEngine) StopBenchmark() BenchmarkSummary {
	b.mu.Lock()
	defer b.mu.Unlock()

	if !b.isRunning {
		return b.lastSummary
	}

	b.isRunning = false
	close(b.stopChan)
	b.lastSummary = b.getSummaryLocked()
	return b.lastSummary
}

func (b *BenchmarkEngine) samplingLoop() {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			b.recordSample()
		case <-b.stopChan:
			return
		}
	}
}

func (b *BenchmarkEngine) recordSample() {
	b.mu.Lock()
	defer b.mu.Unlock()

	if !b.isRunning {
		return
	}

	cPercent, err := cpu.Percent(0, false)
	if err == nil && len(cPercent) > 0 {
		b.cpuSamples = append(b.cpuSamples, cPercent[0])
	}

	m, err := mem.VirtualMemory()
	if err == nil {
		b.ramSamples = append(b.ramSamples, m.UsedPercent)
	}
}

func (b *BenchmarkEngine) RecordGpuTelemetry(utilization uint32, tempC uint32) {
	b.mu.Lock()
	defer b.mu.Unlock()

	if !b.isRunning {
		return
	}

	b.gpuSamples = append(b.gpuSamples, utilization)
	b.gpuTemps = append(b.gpuTemps, tempC)
}

func (b *BenchmarkEngine) GetStatus() BenchmarkSummary {
	b.mu.RLock()
	defer b.mu.RUnlock()
	return b.getSummaryLocked()
}

func (b *BenchmarkEngine) getSummaryLocked() BenchmarkSummary {
	var summary BenchmarkSummary
	summary.IsRunning = b.isRunning
	summary.StartTime = b.startTime

	if b.startTime.IsZero() {
		return b.lastSummary
	}

	duration := int(time.Since(b.startTime).Seconds())
	if !b.isRunning && !b.lastSummary.StartTime.IsZero() {
		duration = b.lastSummary.DurationSeconds
	}
	summary.DurationSeconds = duration

	count := len(b.cpuSamples)
	summary.SamplesCount = count

	if count == 0 {
		summary.Verdict = "Session Starting..."
		summary.StabilityScore = 100
		return summary
	}

	var sumCpu, maxCpu float64
	for _, c := range b.cpuSamples {
		sumCpu += c
		if c > maxCpu {
			maxCpu = c
		}
	}
	summary.AvgCpuPercent = math.Round((sumCpu/float64(count))*10) / 10
	summary.MaxCpuPercent = math.Round(maxCpu*10) / 10

	var sumRam, maxRam float64
	for _, r := range b.ramSamples {
		sumRam += r
		if r > maxRam {
			maxRam = r
		}
	}
	summary.AvgRamPercent = math.Round((sumRam/float64(count))*10) / 10
	summary.MaxRamPercent = math.Round(maxRam*10) / 10

	var maxTemp uint32
	for _, t := range b.gpuTemps {
		if t > maxTemp {
			maxTemp = t
		}
	}
	summary.MaxGpuTemp = maxTemp

	// Compute stability verdict
	if maxTemp > 85 {
		summary.Verdict = "⚠️ High Thermal Spike (Check Cooling)"
		summary.StabilityScore = 78
	} else if summary.MaxCpuPercent > 95 {
		summary.Verdict = "⚡ Heavy CPU Load (High Responsiveness)"
		summary.StabilityScore = 92
	} else {
		summary.Verdict = "🟢 Flawless Stability & Optimal Thermals"
		summary.StabilityScore = 99
	}

	return summary
}
