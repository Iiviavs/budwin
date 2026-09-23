package process

import (
	"errors"
	"math"
	"sort"

	"github.com/shirou/gopsutil/v3/process"
)

type ProcessItem struct {
	Pid           int32   `json:"pid"`
	Name          string  `json:"name"`
	Description   string  `json:"description"`
	MemoryMb      float64 `json:"memoryMb"`
	CpuPercent    float64 `json:"cpuPercent"`
	Category      string  `json:"category"`
	CategoryLabel string  `json:"categoryLabel"`
}

func GetProcesses() []ProcessItem {
	var items []ProcessItem
	procs, err := process.Processes()
	if err != nil {
		return items
	}

	for _, p := range procs {
		name, err := p.Name()
		if err != nil || name == "" {
			continue
		}

		memInfo, err := p.MemoryInfo()
		if err != nil || memInfo == nil {
			continue
		}

		memMb := float64(memInfo.RSS) / (1024 * 1024)
		if memMb < 2.0 {
			continue // Filter out tiny kernel subthreads to keep UI snappy
		}

		meta := ClassifyProcess(name)

		items = append(items, ProcessItem{
			Pid:           p.Pid,
			Name:          name,
			Description:   meta.Description,
			MemoryMb:      math.Round(memMb*10) / 10,
			CpuPercent:    0,
			Category:      string(meta.Category),
			CategoryLabel: meta.Label,
		})
	}

	// Sort descending by RAM usage
	sort.Slice(items, func(i, j int) bool {
		return items[i].MemoryMb > items[j].MemoryMb
	})

	return items
}

func KillProcess(pid int32) error {
	p, err := process.NewProcess(pid)
	if err != nil {
		return err
	}

	name, _ := p.Name()
	meta := ClassifyProcess(name)

	// Block terminating protected system processes for user safety
	if meta.Category == CategoryProtected {
		return errors.New("cannot terminate protected Windows system process")
	}

	return p.Kill()
}
