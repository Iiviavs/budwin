package optimizer

import (
	"strings"
	"sync"
	"time"

	"github.com/shirou/gopsutil/v3/process"
)

// Known gaming executable patterns
var knownGameExecutables = map[string]string{
	"cs2.exe":                          "Counter-Strike 2",
	"csgo.exe":                         "Counter-Strike: GO",
	"valorant.exe":                     "VALORANT",
	"valorant-win64-shipping.exe":      "VALORANT",
	"league of legends.exe":            "League of Legends",
	"leagueclient.exe":                 "League of Legends Client",
	"fortniteclient-win64-shipping.exe": "Fortnite",
	"r5apex.exe":                       "Apex Legends",
	"overwatch.exe":                    "Overwatch 2",
	"gta5.exe":                         "Grand Theft Auto V",
	"robloxplayerbeta.exe":             "Roblox",
	"javaw.exe":                        "Minecraft (Java)",
	"bedrock.exe":                      "Minecraft (Bedrock)",
	"cyberpunk2077.exe":                "Cyberpunk 2077",
	"dota2.exe":                        "Dota 2",
	"rainbowsix.exe":                   "Rainbow Six Siege",
	"destiny2.exe":                     "Destiny 2",
	"genshinimpact.exe":                "Genshin Impact",
	"pubg.exe":                         "PUBG: BATTLEGROUNDS",
	"tslgame.exe":                      "PUBG: BATTLEGROUNDS",
	"eldenring.exe":                    "ELDEN RING",
	"rocketleague.exe":                 "Rocket League",
	"warframe.x64.exe":                 "Warframe",
	"cod.exe":                          "Call of Duty: Warzone",
}

type AutoBoostStatus struct {
	AutoBoostEnabled bool   `json:"autoBoostEnabled"`
	ActiveGameName   string `json:"activeGameName"`
	ActiveGamePid    int32  `json:"activeGamePid"`
	IsBoosting       bool   `json:"isBoosting"`
}

type AutoBoostManager struct {
	mu             sync.RWMutex
	enabled        bool
	activeGameName string
	activeGamePid  int32
	isBoosting     bool
	stopChan       chan struct{}
}

var (
	autoBoostInstance *AutoBoostManager
	autoBoostOnce     sync.Once
)

func GetAutoBoostManager() *AutoBoostManager {
	autoBoostOnce.Do(func() {
		autoBoostInstance = &AutoBoostManager{
			enabled:  true,
			stopChan: make(chan struct{}),
		}
		go autoBoostInstance.watchdogLoop()
	})
	return autoBoostInstance
}

func (m *AutoBoostManager) watchdogLoop() {
	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			m.checkRunningGames()
		case <-m.stopChan:
			return
		}
	}
}

func (m *AutoBoostManager) checkRunningGames() {
	m.mu.Lock()
	defer m.mu.Unlock()

	if !m.enabled {
		return
	}

	procs, err := process.Processes()
	if err != nil {
		return
	}

	var foundGameName string
	var foundGamePid int32

	for _, p := range procs {
		name, err := p.Name()
		if err != nil {
			continue
		}
		lowerName := strings.ToLower(name)
		if gameTitle, exists := knownGameExecutables[lowerName]; exists {
			foundGameName = gameTitle
			foundGamePid = p.Pid
			break
		}
	}

	if foundGameName != "" {
		if !m.isBoosting || m.activeGamePid != foundGamePid {
			m.activeGameName = foundGameName
			m.activeGamePid = foundGamePid
			m.isBoosting = true

			// Engage Game Boost automatically!
			_ = EnableGameBoost()
			// Set high priority for the game process
			_ = SetProcessHighPriority(foundGamePid)
		}
	} else {
		if m.isBoosting {
			// Game exited, revert boost silently
			m.activeGameName = ""
			m.activeGamePid = 0
			m.isBoosting = false
			_ = DisableGameBoost()
		}
	}
}

func (m *AutoBoostManager) GetStatus() AutoBoostStatus {
	m.mu.RLock()
	defer m.mu.RUnlock()

	return AutoBoostStatus{
		AutoBoostEnabled: m.enabled,
		ActiveGameName:   m.activeGameName,
		ActiveGamePid:    m.activeGamePid,
		IsBoosting:       m.isBoosting,
	}
}

func (m *AutoBoostManager) SetAutoBoostEnabled(enable bool) bool {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.enabled = enable
	if !enable && m.isBoosting {
		m.isBoosting = false
		m.activeGameName = ""
		m.activeGamePid = 0
		_ = DisableGameBoost()
	}
	return m.enabled
}
