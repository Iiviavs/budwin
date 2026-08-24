package main

import (
	"context"
	"embed"
	"os"
	"path/filepath"

	"budwin/pkg/tray"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed build/windows/icon.ico
var iconData []byte

func main() {
	app := NewApp()

	tempIcon := filepath.Join(os.TempDir(), "budwin_tray.ico")
	if len(iconData) > 0 {
		_ = os.WriteFile(tempIcon, iconData, 0644)
	}

	err := wails.Run(&options.App{
		Title:             "budwin",
		Width:             1060,
		Height:            700,
		MinWidth:          180,
		MinHeight:         32,
		Frameless:         true,
		HideWindowOnClose: true,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 0, G: 0, B: 0, A: 0},
		OnStartup: func(ctx context.Context) {
			app.startup(ctx)
			tray.InitTray(ctx, tempIcon)
		},
		OnShutdown: func(ctx context.Context) {
			tray.RemoveTray()
		},
		Bind: []interface{}{
			app,
		},
		Windows: &windows.Options{
			WebviewIsTransparent: true,
			WindowIsTranslucent:  true,
			BackdropType:         windows.Acrylic,
			Theme:                windows.Dark,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
