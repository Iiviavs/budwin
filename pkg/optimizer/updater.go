package optimizer

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os/exec"
	"strings"
	"syscall"
	"time"
)

const AppVersion = "v1.9.2"

type UpdateInfo struct {
	HasUpdate      bool   `json:"hasUpdate"`
	CurrentVersion string `json:"currentVersion"`
	LatestVersion  string `json:"latestVersion"`
	ReleaseName    string `json:"releaseName"`
	ReleaseNotes   string `json:"releaseNotes"`
	DownloadUrl    string `json:"downloadUrl"`
	PublishedAt    string `json:"publishedAt"`
}

type githubReleaseResponse struct {
	TagName     string `json:"tag_name"`
	Name        string `json:"name"`
	Body        string `json:"body"`
	HtmlUrl     string `json:"html_url"`
	PublishedAt string `json:"published_at"`
	Assets      []struct {
		Name               string `json:"name"`
		BrowserDownloadUrl string `json:"browser_download_url"`
	} `json:"assets"`
}

// CheckForUpdates queries the GitHub API for the latest published release of budwin
func CheckForUpdates() UpdateInfo {
	client := http.Client{
		Timeout: 5 * time.Second,
	}

	req, err := http.NewRequest("GET", "https://api.github.com/repos/Iiviavs/budwin/releases/latest", nil)
	if err != nil {
		return UpdateInfo{
			HasUpdate:      false,
			CurrentVersion: AppVersion,
			LatestVersion:  AppVersion,
		}
	}
	req.Header.Set("User-Agent", "budwin-app")
	req.Header.Set("Accept", "application/vnd.github.v3+json")

	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		return UpdateInfo{
			HasUpdate:      false,
			CurrentVersion: AppVersion,
			LatestVersion:  AppVersion,
		}
	}
	defer resp.Body.Close()

	var rel githubReleaseResponse
	if err := json.NewDecoder(resp.Body).Decode(&rel); err != nil {
		return UpdateInfo{
			HasUpdate:      false,
			CurrentVersion: AppVersion,
			LatestVersion:  AppVersion,
		}
	}

	latestTag := strings.TrimSpace(rel.TagName)
	hasUpdate := isVersionNewer(AppVersion, latestTag)

	downloadUrl := rel.HtmlUrl
	for _, asset := range rel.Assets {
		if strings.HasSuffix(strings.ToLower(asset.Name), ".exe") {
			downloadUrl = asset.BrowserDownloadUrl
			break
		}
	}

	return UpdateInfo{
		HasUpdate:      hasUpdate,
		CurrentVersion: AppVersion,
		LatestVersion:  latestTag,
		ReleaseName:    rel.Name,
		ReleaseNotes:   rel.Body,
		DownloadUrl:    downloadUrl,
		PublishedAt:    rel.PublishedAt,
	}
}

// OpenUrlInBrowser opens the specified URL in the user's default browser
func OpenUrlInBrowser(url string) bool {
	if url == "" {
		url = "https://github.com/Iiviavs/budwin/releases"
	}
	cmd := exec.Command("cmd", "/c", "start", "", url)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	err := cmd.Start()
	return err == nil
}

// isVersionNewer checks if remote tag is newer than local version
func isVersionNewer(current, latest string) bool {
	if latest == "" || current == latest {
		return false
	}
	cClean := strings.TrimPrefix(strings.ToLower(current), "v")
	lClean := strings.TrimPrefix(strings.ToLower(latest), "v")

	var cMajor, cMinor, cPatch int
	var lMajor, lMinor, lPatch int

	fmt.Sscanf(cClean, "%d.%d.%d", &cMajor, &cMinor, &cPatch)
	fmt.Sscanf(lClean, "%d.%d.%d", &lMajor, &lMinor, &lPatch)

	if lMajor > cMajor {
		return true
	}
	if lMajor == cMajor && lMinor > cMinor {
		return true
	}
	if lMajor == cMajor && lMinor == cMinor && lPatch > cPatch {
		return true
	}

	return false
}
