package hardware

type GpuTelemetry struct {
	IsAvailable       bool    `json:"isAvailable"`
	Name              string  `json:"name"`
	CoreUtilization   uint32  `json:"coreUtilization"`
	MemoryUtilization uint32  `json:"memoryUtilization"`
	VramTotalMb       uint64  `json:"vramTotalMb"`
	VramUsedMb        uint64  `json:"vramUsedMb"`
	TemperatureC      uint32  `json:"temperatureC"`
	FanSpeedPercent   uint32  `json:"fanSpeedPercent"`
	PowerWatts        uint32  `json:"powerWatts"`
}

type TelemetrySnapshot struct {
	CpuPercent  float64      `json:"cpuPercent"`
	CpuCores    int          `json:"cpuCores"`
	CpuModel    string       `json:"cpuModel"`
	RamPercent  float64      `json:"ramPercent"`
	RamUsedGb   float64      `json:"ramUsedGb"`
	RamTotalGb  float64      `json:"ramTotalGb"`
	NetInKb     float64      `json:"netInKb"`
	NetOutKb    float64      `json:"netOutKb"`
	DiskReadMb  float64      `json:"diskReadMb"`
	DiskWriteMb float64      `json:"diskWriteMb"`
	Gpu         GpuTelemetry `json:"gpu"`
}

type DriveItem struct {
	Letter      string  `json:"letter"`
	Name        string  `json:"name"`
	TotalGb     float64 `json:"totalGb"`
	FreeGb      float64 `json:"freeGb"`
	UsedGb      float64 `json:"usedGb"`
	PercentUsed float64 `json:"percentUsed"`
}
