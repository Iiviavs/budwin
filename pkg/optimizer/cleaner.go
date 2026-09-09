package optimizer

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"syscall"
)

const (
	GuidBalanced        = "381b4222-f694-41f0-9685-ff5bb260df2e"
	GuidHighPerformance = "8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c"
)

func CleanTempFiles() (float64, error) {
	tempDir := os.Getenv("TEMP")
	if tempDir == "" {
		tempDir = os.Getenv("TMP")
	}
	if tempDir == "" {
		return 0, nil
	}

	var totalBytesFreed int64
	var cleanableFiles []string

	err := filepath.Walk(tempDir, func(path string, info os.FileInfo, walkErr error) error {
		if walkErr != nil {
			return nil // Locked/inaccessible entries should not abort the cleanup.
		}
		if info == nil || info.IsDir() || info.Mode()&os.ModeSymlink != 0 {
			return nil
		}
		file, openErr := os.OpenFile(path, os.O_RDWR, 0666)
		if openErr == nil {
			_ = file.Close()
			cleanableFiles = append(cleanableFiles, path)
		}
		return nil
	})
	if err != nil {
		return 0, err
	}

	for _, path := range cleanableFiles {
		info, statErr := os.Stat(path)
		if statErr != nil {
			continue
		}
		_ = os.Chmod(path, 0666)
		if removeErr := os.Remove(path); removeErr == nil {
			totalBytesFreed += info.Size()
		}
	}

	freedMb := float64(totalBytesFreed) / (1024 * 1024)
	return freedMb, nil
}

func FlushDNS() error {
	cmd := exec.Command("ipconfig", "/flushdns")
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	return cmd.Run()
}

func SetPowerPlan(plan string) error {
	guid := GuidBalanced
	if strings.Contains(strings.ToLower(plan), "high") || strings.Contains(strings.ToLower(plan), "desempenho") {
		guid = GuidHighPerformance
	}

	cmd := exec.Command("powercfg", "/s", guid)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	return cmd.Run()
}

func GetActivePowerPlan() string {
	cmd := exec.Command("powercfg", "/getactivescheme")
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	out, err := cmd.Output()
	if err != nil {
		return "Balanced"
	}
	s := strings.ToLower(string(out))
	if strings.Contains(s, "desempenho m") || strings.Contains(s, "ultimate") {
		return "Ultimate Performance (Desempenho Máximo)"
	}
	if strings.Contains(s, "high") || strings.Contains(s, "alto desempenho") {
		return "High Performance"
	}
	if strings.Contains(s, "econom") || strings.Contains(s, "saver") {
		return "Power Saver"
	}
	return "Balanced"
}
