package storage

import (
	"math"
	"os"
	"path/filepath"
	"strings"
)

type GameDuplicateItem struct {
	ID          string  `json:"id"`
	GameName    string  `json:"gameName"`
	Category    string  `json:"category"`
	Path        string  `json:"path"`
	SizeMb      float64 `json:"sizeMb"`
	Description string  `json:"description"`
}

type GameHunterScanResult struct {
	TotalDuplicateMb float64             `json:"totalDuplicateMb"`
	Items            []GameDuplicateItem `json:"items"`
}

// ScanGameDuplicates inspects Steam, Epic, and game folders for duplicate redistributables and leftover downloading files
func ScanGameDuplicates() GameHunterScanResult {
	var items []GameDuplicateItem
	var totalMb float64

	steamPossiblePaths := []string{
		`C:\Program Files (x86)\Steam\steamapps`,
		`C:\Steam\steamapps`,
		`D:\Steam\steamapps`,
		`D:\SteamLibrary\steamapps`,
		`E:\SteamLibrary\steamapps`,
		`E:\Steam\steamapps`,
		`F:\SteamLibrary\steamapps`,
	}

	for _, steamDir := range steamPossiblePaths {
		if _, err := os.Stat(steamDir); err == nil {
			// 1. Check steamapps/downloading (interrupted chunks)
			downloadingDir := filepath.Join(steamDir, "downloading")
			if sz := getDirSizeMb(downloadingDir); sz > 1.0 {
				items = append(items, GameDuplicateItem{
					ID:          "steam_downloading_" + strings.ReplaceAll(downloadingDir, `\`, "_"),
					GameName:    "Steam Incomplete Downloads",
					Category:    "Leftover Download Chunks",
					Path:        downloadingDir,
					SizeMb:      sz,
					Description: "Unfinished or orphaned download staging chunks in " + downloadingDir,
				})
				totalMb += sz
			}

			// 2. Check steamapps/temp
			tempSteamDir := filepath.Join(steamDir, "temp")
			if sz := getDirSizeMb(tempSteamDir); sz > 1.0 {
				items = append(items, GameDuplicateItem{
					ID:          "steam_temp_" + strings.ReplaceAll(tempSteamDir, `\`, "_"),
					GameName:    "Steam Temp Cache",
					Category:    "Temporary Installers",
					Path:        tempSteamDir,
					SizeMb:      sz,
					Description: "Temporary game extraction files in " + tempSteamDir,
				})
				totalMb += sz
			}

			// 3. Scan common games for _CommonRedist / installers
			commonDir := filepath.Join(steamDir, "common")
			if gameFolders, err := os.ReadDir(commonDir); err == nil {
				for _, gf := range gameFolders {
					if gf.IsDir() {
						gamePath := filepath.Join(commonDir, gf.Name())

						redistSubdirs := []string{"_CommonRedist", "directx", "redist", "Installers", "Support", "_redist"}
						for _, rSub := range redistSubdirs {
							targetRedist := filepath.Join(gamePath, rSub)
							if sz := getDirSizeMb(targetRedist); sz > 5.0 {
								items = append(items, GameDuplicateItem{
									ID:          "redist_" + gf.Name() + "_" + rSub,
									GameName:    gf.Name(),
									Category:    "Duplicate DirectX / VC++",
									Path:        targetRedist,
									SizeMb:      sz,
									Description: "Redundant installer packages in " + targetRedist,
								})
								totalMb += sz
							}
						}
					}
				}
			}
		}
	}

	if items == nil {
		items = make([]GameDuplicateItem, 0)
	}

	return GameHunterScanResult{
		TotalDuplicateMb: math.Round(totalMb*10) / 10,
		Items:            items,
	}
}

// PurgeGameDuplicates deletes redundant redistributables and orphaned staging files
func PurgeGameDuplicates(itemID string) float64 {
	scan := ScanGameDuplicates()
	var totalFreed float64

	for _, item := range scan.Items {
		if itemID == "all" || item.ID == itemID {
			freed := cleanDirContents(item.Path)
			totalFreed += freed
		}
	}

	return math.Round(totalFreed*10) / 10
}
