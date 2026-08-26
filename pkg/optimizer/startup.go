package optimizer

import (
	"strings"

	"golang.org/x/sys/windows/registry"
)

type StartupItem struct {
	Name        string `json:"name"`
	Command     string `json:"command"`
	Location    string `json:"location"`
	Enabled     bool   `json:"enabled"`
	Impact      string `json:"impact"`
	Description string `json:"description"`
}

func calculateImpact(name, command string) string {
	lower := strings.ToLower(name + " " + command)
	if strings.Contains(lower, "discord") || strings.Contains(lower, "steam") || strings.Contains(lower, "spotify") || strings.Contains(lower, "epic") || strings.Contains(lower, "chrome") || strings.Contains(lower, "browser") {
		return "High"
	}
	if strings.Contains(lower, "helper") || strings.Contains(lower, "update") || strings.Contains(lower, "tray") || strings.Contains(lower, "service") {
		return "Medium"
	}
	return "Low"
}

func getAppDescription(name string) string {
	lower := strings.ToLower(name)
	if strings.Contains(lower, "discord") {
		return "Discord Voice & Chat"
	}
	if strings.Contains(lower, "steam") {
		return "Steam Gaming Client"
	}
	if strings.Contains(lower, "spotify") {
		return "Spotify Music Streaming"
	}
	if strings.Contains(lower, "epic") {
		return "Epic Games Launcher"
	}
	if strings.Contains(lower, "nv") || strings.Contains(lower, "nvidia") {
		return "NVIDIA Display & Driver Helper"
	}
	if strings.Contains(lower, "razer") {
		return "Razer Peripheral Software"
	}
	if strings.Contains(lower, "rog") || strings.Contains(lower, "armoury") {
		return "ASUS ROG Hardware Service"
	}
	return "Startup Application"
}

func GetStartupItems() []StartupItem {
	var items []StartupItem

	// 1. HKCU Run
	kHKCU, err := registry.OpenKey(registry.CURRENT_USER, `Software\Microsoft\Windows\CurrentVersion\Run`, registry.QUERY_VALUE)
	if err == nil {
		valNames, err := kHKCU.ReadValueNames(0)
		if err == nil {
			for _, name := range valNames {
				val, _, err := kHKCU.GetStringValue(name)
				if err == nil && val != "" {
					items = append(items, StartupItem{
						Name:        name,
						Command:     val,
						Location:    "HKCU",
						Enabled:     true,
						Impact:      calculateImpact(name, val),
						Description: getAppDescription(name),
					})
				}
			}
		}
		kHKCU.Close()
	}

	// 2. HKLM Run
	kHKLM, err := registry.OpenKey(registry.LOCAL_MACHINE, `Software\Microsoft\Windows\CurrentVersion\Run`, registry.QUERY_VALUE)
	if err == nil {
		valNames, err := kHKLM.ReadValueNames(0)
		if err == nil {
			for _, name := range valNames {
				val, _, err := kHKLM.GetStringValue(name)
				if err == nil && val != "" {
					items = append(items, StartupItem{
						Name:        name,
						Command:     val,
						Location:    "HKLM",
						Enabled:     true,
						Impact:      calculateImpact(name, val),
						Description: getAppDescription(name),
					})
				}
			}
		}
		kHKLM.Close()
	}

	// 3. Check Disabled/Approved entries (StartupApproved\Run)
	kApproved, err := registry.OpenKey(registry.CURRENT_USER, `Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run`, registry.QUERY_VALUE)
	if err == nil {
		for i := range items {
			b, _, err := kApproved.GetBinaryValue(items[i].Name)
			if err == nil && len(b) > 0 {
				// If first byte is not 0x02, it is disabled in Windows Task Manager
				if b[0] != 0x02 && b[0] != 0x00 {
					items[i].Enabled = false
				}
			}
		}
		kApproved.Close()
	}

	return items
}

func ToggleStartupItem(name string, location string, enable bool) bool {
	// Update StartupApproved\Run entry
	kApproved, err := registry.OpenKey(registry.CURRENT_USER, `Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run`, registry.SET_VALUE)
	if err == nil {
		var val []byte
		if enable {
			val = []byte{0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00}
		} else {
			val = []byte{0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00}
		}
		kApproved.SetBinaryValue(name, val)
		kApproved.Close()
		return true
	}

	return false
}

// GetAutoStartEnabled checks if budwin is configured in Windows Startup Run registry key
func GetAutoStartEnabled() bool {
	k, err := registry.OpenKey(registry.CURRENT_USER, `Software\Microsoft\Windows\CurrentVersion\Run`, registry.QUERY_VALUE)
	if err != nil {
		return false
	}
	defer k.Close()

	val, _, err := k.GetStringValue("budwin")
	return err == nil && len(val) > 0
}

// SetAutoStartEnabled registers or removes budwin from Windows Startup Run registry key
func SetAutoStartEnabled(enable bool) bool {
	k, err := registry.OpenKey(registry.CURRENT_USER, `Software\Microsoft\Windows\CurrentVersion\Run`, registry.SET_VALUE|registry.QUERY_VALUE)
	if err != nil {
		return false
	}
	defer k.Close()

	if enable {
		exePath := `C:\Users\crynn\.gemini\antigravity\scratch\budwin\build\bin\budwin.exe`
		_ = k.SetStringValue("budwin", `"`+exePath+`"`)

		// Also ensure enabled in StartupApproved\Run
		kApp, err := registry.OpenKey(registry.CURRENT_USER, `Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run`, registry.SET_VALUE)
		if err == nil {
			_ = kApp.SetBinaryValue("budwin", []byte{0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00})
			kApp.Close()
		}
	} else {
		_ = k.DeleteValue("budwin")
	}

	return true
}
