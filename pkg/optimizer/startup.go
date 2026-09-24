package optimizer

import (
	"os"
	"path/filepath"
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

func GetStartupItems() []StartupItem {
	var items []StartupItem

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
						Description: "",
					})
				}
			}
		}
		kHKCU.Close()
	}

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
						Description: "",
					})
				}
			}
		}
		kHKLM.Close()
	}

	for i := range items {
		hive := registry.CURRENT_USER
		if items[i].Location == "HKLM" {
			hive = registry.LOCAL_MACHINE
		}
		kApproved, err := registry.OpenKey(hive, `Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run`, registry.QUERY_VALUE)
		if err != nil {
			continue
		}
		b, _, err := kApproved.GetBinaryValue(items[i].Name)
		kApproved.Close()
		if err == nil && len(b) > 0 && b[0] != 0x02 && b[0] != 0x00 {
			items[i].Enabled = false
		}
	}

	return items
}

func ToggleStartupItem(name string, location string, enable bool) bool {
	hive := registry.CURRENT_USER
	if location == "HKLM" {
		hive = registry.LOCAL_MACHINE
	} else if location != "HKCU" {
		return false
	}
	kApproved, err := registry.OpenKey(hive, `Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run`, registry.SET_VALUE)
	if err == nil {
		var val []byte
		if enable {
			val = []byte{0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00}
		} else {
			val = []byte{0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00}
		}
		if err := kApproved.SetBinaryValue(name, val); err != nil {
			kApproved.Close()
			return false
		}
		kApproved.Close()
		return true
	}

	return false
}

func GetAutoStartEnabled() bool {
	k, err := registry.OpenKey(registry.CURRENT_USER, `Software\Microsoft\Windows\CurrentVersion\Run`, registry.QUERY_VALUE)
	if err != nil {
		return false
	}
	defer k.Close()

	val, _, err := k.GetStringValue("budwin")
	return err == nil && len(val) > 0
}

func SetAutoStartEnabled(enable bool) bool {
	k, err := registry.OpenKey(registry.CURRENT_USER, `Software\Microsoft\Windows\CurrentVersion\Run`, registry.SET_VALUE|registry.QUERY_VALUE)
	if err != nil {
		return false
	}
	defer k.Close()

	if enable {
		exePath, err := os.Executable()
		if err != nil {
			return false
		}
		exePath, err = filepath.Abs(exePath)
		if err != nil {
			return false
		}
		if err := k.SetStringValue("budwin", `"`+exePath+`"`); err != nil {
			return false
		}

		kApp, err := registry.OpenKey(registry.CURRENT_USER, `Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run`, registry.SET_VALUE)
		if err == nil {
			if err := kApp.SetBinaryValue("budwin", []byte{0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00}); err != nil {
				kApp.Close()
				return false
			}
			kApp.Close()
		}
	} else {
		if err := k.DeleteValue("budwin"); err != nil {
			if err != registry.ErrNotExist {
				return false
			}
		}
	}

	return true
}
