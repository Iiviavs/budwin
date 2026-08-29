package storage

import (
	"math"
	"os"
	"path/filepath"
	"strings"
	"syscall"
)

var (
	shell32DLL         = syscall.NewLazyDLL("shell32.dll")
	shEmptyRecycleBinW = shell32DLL.NewProc("SHEmptyRecycleBinW")
)

const (
	SHERB_NOCONFIRMATION = 0x00000001
	SHERB_NOPROGRESSUI   = 0x00000002
	SHERB_NOSOUND        = 0x00000004
)

type StorageCategoryItem struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	SizeMb      float64 `json:"sizeMb"`
	Cleanable   bool    `json:"cleanable"`
	IconType    string  `json:"iconType"`
}

type StorageScanResult struct {
	TotalCleanableMb float64               `json:"totalCleanableMb"`
	Categories       []StorageCategoryItem `json:"categories"`
}

// isFileCleanable checks if a file is safe to clean and NOT locked by an active process or virtual disk
func isFileCleanable(path string, info os.FileInfo) bool {
	if info == nil || info.IsDir() {
		return false
	}
	name := strings.ToLower(info.Name())
	// Ignore WSL/Docker virtual disk images and active system drivers
	if strings.HasSuffix(name, ".vhdx") || strings.HasSuffix(name, ".vhd") || strings.HasSuffix(name, ".sys") || strings.HasPrefix(name, "swap") {
		return false
	}
	// Try opening in read-write mode to verify the file is not currently locked by an active application
	f, err := os.OpenFile(path, os.O_RDWR, 0666)
	if err != nil {
		return false
	}
	f.Close()
	return true
}

func getDirSizeMb(dirPath string) float64 {
	if _, err := os.Stat(dirPath); os.IsNotExist(err) {
		return 0
	}
	var totalSize int64
	_ = filepath.Walk(dirPath, func(path string, info os.FileInfo, err error) error {
		if err == nil && isFileCleanable(path, info) {
			totalSize += info.Size()
		}
		return nil
	})
	return math.Round((float64(totalSize)/(1024*1024))*10) / 10
}

func cleanDirContents(dirPath string) float64 {
	if _, err := os.Stat(dirPath); os.IsNotExist(err) {
		return 0
	}
	initialSize := getDirSizeMb(dirPath)

	entries, err := os.ReadDir(dirPath)
	if err != nil {
		return 0
	}

	for _, entry := range entries {
		fullPath := filepath.Join(dirPath, entry.Name())
		// Walk and strip read-only attributes on subfiles before removal
		_ = filepath.Walk(fullPath, func(path string, info os.FileInfo, err error) error {
			if err == nil && info != nil {
				_ = os.Chmod(path, 0666)
			}
			return nil
		})
		_ = os.RemoveAll(fullPath)
	}

	remainingSize := getDirSizeMb(dirPath)
	freed := initialSize - remainingSize
	if freed < 0 {
		freed = 0
	}
	return math.Round(freed*10) / 10
}

// ScanCleanableStorage calculates genuine real-time cleanable disk sizes
func ScanCleanableStorage() StorageScanResult {
	userProfile := os.Getenv("USERPROFILE")
	localAppData := os.Getenv("LOCALAPPDATA")
	windir := os.Getenv("WINDIR")
	if windir == "" {
		windir = "C:\\Windows"
	}

	// 1. DirectX & GPU Shader Cache
	d3dCache := filepath.Join(localAppData, "D3DSCache")
	nvCache := filepath.Join(localAppData, "NVIDIA", "DXCache")
	nvGlCache := filepath.Join(localAppData, "NVIDIA", "GLCache")
	amdCache := filepath.Join(localAppData, "AMD", "DxCache")
	shaderSize := getDirSizeMb(d3dCache) + getDirSizeMb(nvCache) + getDirSizeMb(nvGlCache) + getDirSizeMb(amdCache)

	// 2. Windows Temp, Logs & Crash Dumps (cleanable files only)
	userTemp := os.TempDir()
	winTemp := filepath.Join(windir, "Temp")
	crashDumps := filepath.Join(localAppData, "CrashDumps")
	werReports := filepath.Join(localAppData, "Microsoft", "Windows", "WER")
	tempSize := getDirSizeMb(userTemp) + getDirSizeMb(winTemp) + getDirSizeMb(crashDumps) + getDirSizeMb(werReports)

	// 3. Windows Update Download Cache
	swDist := filepath.Join(windir, "SoftwareDistribution", "Download")
	winUpdateSize := getDirSizeMb(swDist)

	// 4. Browser & Web Caches (Chrome, Edge, Discord, Steam)
	chromeCache := filepath.Join(localAppData, "Google", "Chrome", "User Data", "Default", "Cache")
	edgeCache := filepath.Join(localAppData, "Microsoft", "Edge", "User Data", "Default", "Cache")
	discordCache := filepath.Join(userProfile, "AppData", "Roaming", "discord", "Cache")
	steamCache := filepath.Join(localAppData, "Steam", "htmlcache")
	browserCacheSize := getDirSizeMb(chromeCache) + getDirSizeMb(edgeCache) + getDirSizeMb(discordCache) + getDirSizeMb(steamCache)

	// 5. Windows Recycle Bin
	recycleBinSize := 0.0

	total := math.Round((shaderSize+tempSize+winUpdateSize+browserCacheSize+recycleBinSize)*10) / 10

	categories := []StorageCategoryItem{
		{
			ID:          "shaders",
			Name:        "DirectX & GPU Shader Cache",
			Description: "Compiled game shaders (NVIDIA/AMD/D3D). Cleans texture stutter.",
			SizeMb:      shaderSize,
			Cleanable:   shaderSize > 0.1,
			IconType:    "zap",
		},
		{
			ID:          "browsercache",
			Name:        "Browser & Client Web Caches",
			Description: "Chrome, Edge, Steam & Discord HTTP cache assets.",
			SizeMb:      browserCacheSize,
			Cleanable:   browserCacheSize > 0.1,
			IconType:    "layers",
		},
		{
			ID:          "temp",
			Name:        "System & User Temp / Crash Dumps",
			Description: "%TEMP% application logs, crash dumps, and installer traces.",
			SizeMb:      tempSize,
			Cleanable:   tempSize > 0.1,
			IconType:    "trash",
		},
		{
			ID:          "winupdate",
			Name:        "Windows Update Download Cache",
			Description: "Leftover installers from completed Windows updates.",
			SizeMb:      winUpdateSize,
			Cleanable:   winUpdateSize > 0.1,
			IconType:    "refresh",
		},
		{
			ID:          "recyclebin",
			Name:        "Windows Recycle Bin",
			Description: "Permanently empty deleted trash items from all drives.",
			SizeMb:      recycleBinSize,
			Cleanable:   false,
			IconType:    "archive",
		},
	}

	return StorageScanResult{
		TotalCleanableMb: total,
		Categories:       categories,
	}
}

// CleanStorageCategory clears specific or all storage categories and returns actual freed MB
func CleanStorageCategory(categoryID string) float64 {
	userProfile := os.Getenv("USERPROFILE")
	localAppData := os.Getenv("LOCALAPPDATA")
	windir := os.Getenv("WINDIR")
	if windir == "" {
		windir = "C:\\Windows"
	}

	var totalFreed float64

	switch categoryID {
	case "shaders":
		totalFreed += cleanDirContents(filepath.Join(localAppData, "D3DSCache"))
		totalFreed += cleanDirContents(filepath.Join(localAppData, "NVIDIA", "DXCache"))
		totalFreed += cleanDirContents(filepath.Join(localAppData, "NVIDIA", "GLCache"))
		totalFreed += cleanDirContents(filepath.Join(localAppData, "AMD", "DxCache"))

	case "browsercache":
		totalFreed += cleanDirContents(filepath.Join(localAppData, "Google", "Chrome", "User Data", "Default", "Cache"))
		totalFreed += cleanDirContents(filepath.Join(localAppData, "Microsoft", "Edge", "User Data", "Default", "Cache"))
		totalFreed += cleanDirContents(filepath.Join(userProfile, "AppData", "Roaming", "discord", "Cache"))
		totalFreed += cleanDirContents(filepath.Join(localAppData, "Steam", "htmlcache"))

	case "temp":
		totalFreed += cleanDirContents(os.TempDir())
		totalFreed += cleanDirContents(filepath.Join(windir, "Temp"))
		totalFreed += cleanDirContents(filepath.Join(localAppData, "CrashDumps"))
		totalFreed += cleanDirContents(filepath.Join(localAppData, "Microsoft", "Windows", "WER"))

	case "winupdate":
		totalFreed += cleanDirContents(filepath.Join(windir, "SoftwareDistribution", "Download"))

	case "recyclebin":
		shEmptyRecycleBinW.Call(0, 0, uintptr(SHERB_NOCONFIRMATION|SHERB_NOPROGRESSUI|SHERB_NOSOUND))
		totalFreed += 0.0

	case "all":
		// Clean all
		totalFreed += cleanDirContents(filepath.Join(localAppData, "D3DSCache"))
		totalFreed += cleanDirContents(filepath.Join(localAppData, "NVIDIA", "DXCache"))
		totalFreed += cleanDirContents(filepath.Join(localAppData, "NVIDIA", "GLCache"))
		totalFreed += cleanDirContents(filepath.Join(localAppData, "AMD", "DxCache"))

		totalFreed += cleanDirContents(filepath.Join(localAppData, "Google", "Chrome", "User Data", "Default", "Cache"))
		totalFreed += cleanDirContents(filepath.Join(localAppData, "Microsoft", "Edge", "User Data", "Default", "Cache"))
		totalFreed += cleanDirContents(filepath.Join(userProfile, "AppData", "Roaming", "discord", "Cache"))
		totalFreed += cleanDirContents(filepath.Join(localAppData, "Steam", "htmlcache"))

		totalFreed += cleanDirContents(os.TempDir())
		totalFreed += cleanDirContents(filepath.Join(windir, "Temp"))
		totalFreed += cleanDirContents(filepath.Join(localAppData, "CrashDumps"))
		totalFreed += cleanDirContents(filepath.Join(localAppData, "Microsoft", "Windows", "WER"))

		totalFreed += cleanDirContents(filepath.Join(windir, "SoftwareDistribution", "Download"))

		shEmptyRecycleBinW.Call(0, 0, uintptr(SHERB_NOCONFIRMATION|SHERB_NOPROGRESSUI|SHERB_NOSOUND))
	}

	return math.Round(totalFreed*10) / 10
}
