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
		MinWidth:          380,
		MinHeight:         520,
		Frameless:         true,
		HideWindowOnClose: true,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 11, G: 14, B: 20, A: 255},
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
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
			BackdropType:         windows.Mica,
			Theme:                windows.Dark,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
