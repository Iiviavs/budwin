package process

import "strings"

type ProcessCategory string

const (
	CategorySafe       ProcessCategory = "safe"
	CategoryBackground ProcessCategory = "background"
	CategoryProtected  ProcessCategory = "protected"
)

type ProcessMetadata struct {
	Category    ProcessCategory
	Label       string
	Description string
}

var knownProcesses = map[string]ProcessMetadata{
	// Protected Core Windows OS
	"explorer.exe":         {Category: CategoryProtected, Label: "Critical System", Description: "Windows Shell, Desktop & Taskbar"},
	"dwm.exe":              {Category: CategoryProtected, Label: "Critical System", Description: "Desktop Window Manager (UI Compositor)"},
	"svchost.exe":          {Category: CategoryProtected, Label: "Critical System", Description: "Host Process for Windows Services"},
	"csrss.exe":            {Category: CategoryProtected, Label: "Critical System", Description: "Client Server Runtime Subsystem"},
	"services.exe":         {Category: CategoryProtected, Label: "Critical System", Description: "Service Control Manager"},
	"lsass.exe":            {Category: CategoryProtected, Label: "Critical System", Description: "Local Security Authority Process"},
	"smss.exe":             {Category: CategoryProtected, Label: "Critical System", Description: "Session Manager Subsystem"},
	"wininit.exe":          {Category: CategoryProtected, Label: "Critical System", Description: "Windows Start-Up Application"},
	"winlogon.exe":         {Category: CategoryProtected, Label: "Critical System", Description: "Windows Logon Application"},
	"system":               {Category: CategoryProtected, Label: "Critical System", Description: "NT Kernel & System Threads"},
	"registry":             {Category: CategoryProtected, Label: "Critical System", Description: "Windows Registry Subsystem"},
	"msmpeng.exe":          {Category: CategoryProtected, Label: "Critical System", Description: "Microsoft Defender Antivirus Core"},
	"securityhealthservice": {Category: CategoryProtected, Label: "Critical System", Description: "Windows Security Center Service"},
	"fontdrvhost.exe":      {Category: CategoryProtected, Label: "Critical System", Description: "Usermode Font Driver Host"},

	// Background Hardware & Helpers
	"nvcontainer.exe":      {Category: CategoryBackground, Label: "Background Helper", Description: "NVIDIA Display & Telemetry Container"},
	"nvidia overlay.exe":   {Category: CategoryBackground, Label: "Background Helper", Description: "NVIDIA In-Game Overlay"},
	"armourycrate.exe":     {Category: CategoryBackground, Label: "Background Helper", Description: "ASUS ROG Hardware Control & Lighting"},
	"rog live service.exe": {Category: CategoryBackground, Label: "Background Helper", Description: "ASUS ROG System Monitoring Service"},
	"msedgewebview2.exe":   {Category: CategoryBackground, Label: "Background Helper", Description: "Windows Edge Embedded Web View"},
	"figma_agent.exe":      {Category: CategoryBackground, Label: "Background Helper", Description: "Figma Local Font & Plugin Helper"},

	// Safe User Applications
	"chrome.exe":           {Category: CategorySafe, Label: "User Application", Description: "Google Chrome Web Browser"},
	"msedge.exe":           {Category: CategorySafe, Label: "User Application", Description: "Microsoft Edge Web Browser"},
	"discord.exe":          {Category: CategorySafe, Label: "User Application", Description: "Discord Voice & Text Messaging"},
	"spotify.exe":          {Category: CategorySafe, Label: "User Application", Description: "Spotify Music Player"},
	"steam.exe":            {Category: CategorySafe, Label: "User Application", Description: "Steam Gaming Platform"},
	"steamwebhelper.exe":   {Category: CategorySafe, Label: "User Application", Description: "Steam Store & Community Web Helper"},
	"epicgameslauncher.exe": {Category: CategorySafe, Label: "User Application", Description: "Epic Games Launcher"},
	"notion.exe":           {Category: CategorySafe, Label: "User Application", Description: "Notion Workspace"},
	"perplexity.exe":       {Category: CategorySafe, Label: "User Application", Description: "Perplexity AI Desktop App"},
	"claude.exe":           {Category: CategorySafe, Label: "User Application", Description: "Anthropic Claude Desktop App"},
	"telegram.exe":         {Category: CategorySafe, Label: "User Application", Description: "Telegram Desktop Messenger"},
	"whatsapp.exe":         {Category: CategorySafe, Label: "User Application", Description: "WhatsApp Desktop Messaging"},
	"robloxplayerbeta.exe": {Category: CategorySafe, Label: "User Application", Description: "Roblox Game Engine Client"},
	"antigravity.exe":      {Category: CategorySafe, Label: "User Application", Description: "Antigravity AI Assistant & Workspace"},
}

func ClassifyProcess(name string) ProcessMetadata {
	lower := strings.ToLower(strings.TrimSpace(name))
	if meta, found := knownProcesses[lower]; found {
		return meta
	}

	// Heuristics
	if strings.Contains(lower, "host") || strings.Contains(lower, "svc") || strings.Contains(lower, "broker") {
		return ProcessMetadata{
			Category:    CategoryBackground,
			Label:       "Background Service",
			Description: "Windows Background Helper Task",
		}
	}

	return ProcessMetadata{
		Category:    CategorySafe,
		Label:       "User Application",
		Description: "Desktop Application",
	}
}
