package tray

import (
	"syscall"
	"unsafe"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	wailsRuntime "context"
)

var (
	shell32DLL          = syscall.NewLazyDLL("shell32.dll")
	shellNotifyIconW    = shell32DLL.NewProc("Shell_NotifyIconW")
	user32DLL           = syscall.NewLazyDLL("user32.dll")
	createWindowExW     = user32DLL.NewProc("CreateWindowExW")
	defWindowProcW      = user32DLL.NewProc("DefWindowProcW")
	registerClassExW    = user32DLL.NewProc("RegisterClassExW")
	getMessageW         = user32DLL.NewProc("GetMessageW")
	translateMessage    = user32DLL.NewProc("TranslateMessage")
	dispatchMessageW    = user32DLL.NewProc("DispatchMessageW")
	postQuitMessage     = user32DLL.NewProc("PostQuitMessage")
	destroyWindow       = user32DLL.NewProc("DestroyWindow")
	loadImageW          = user32DLL.NewProc("LoadImageW")
	createPopupMenu     = user32DLL.NewProc("CreatePopupMenu")
	appendMenuW         = user32DLL.NewProc("AppendMenuW")
	trackPopupMenu      = user32DLL.NewProc("TrackPopupMenu")
	destroyMenu         = user32DLL.NewProc("DestroyMenu")
	getCursorPos        = user32DLL.NewProc("GetCursorPos")
	setForegroundWindow = user32DLL.NewProc("SetForegroundWindow")
)

const (
	NIM_ADD        = 0x00000000
	NIM_MODIFY     = 0x00000001
	NIM_DELETE     = 0x00000002
	NIF_MESSAGE    = 0x00000001
	NIF_ICON       = 0x00000002
	NIF_TIP        = 0x00000004
	IMAGE_ICON     = 1
	LR_LOADFROMFILE = 0x00000010
	LR_DEFAULTSIZE = 0x00000040
	WM_USER        = 0x0400
	WM_TRAYICON    = WM_USER + 1
	WM_LBUTTONUP   = 0x0202
	WM_LBUTTONDBLCLK = 0x0203
	WM_RBUTTONUP   = 0x0205
	MF_STRING      = 0x0000
	MF_SEPARATOR   = 0x0800
	TPM_BOTTOMALIGN = 0x0020
	TPM_LEFTALIGN  = 0x0000
)

type WNDCLASSEXW struct {
	CbSize        uint32
	Style         uint32
	LpfnWndProc   uintptr
	CbClsExtra    int32
	CbWndExtra    int32
	HInstance     uintptr
	HIcon         uintptr
	HCursor       uintptr
	HbrBackground uintptr
	LpszMenuName  *uint16
	LpszClassName *uint16
	HIconSm       uintptr
}

type NOTIFYICONDATAW struct {
	CbSize           uint32
	HWnd             uintptr
	UID              uint32
	UFlags           uint32
	UCallbackMessage uint32
	HIcon            uintptr
	SzTip            [128]uint16
	DwState          uint32
	DwStateMask      uint32
	SzInfo           [256]uint16
	UTimeoutOrVersion uint32
	SzInfoTitle      [64]uint16
	DwInfoFlags      uint32
	GuidItem         [16]byte
	HBalloonIcon     uintptr
}

type POINT struct {
	X, Y int32
}

type MSG struct {
	Hwnd     uintptr
	Message  uint32
	WParam   uintptr
	LParam   uintptr
	Time     uint32
	Pt       POINT
	LPrivate uint32
}

var (
	appCtx               wailsRuntime.Context
	trayHwnd             uintptr
	trayNID              NOTIFYICONDATAW
	procGetSystemMetrics = user32DLL.NewProc("GetSystemMetrics")
)

func getScreenSize() (int, int) {
	w, _, _ := procGetSystemMetrics.Call(0) // SM_CXSCREEN
	h, _, _ := procGetSystemMetrics.Call(1) // SM_CYSCREEN
	return int(w), int(h)
}

func wndProc(hwnd uintptr, msg uint32, wParam uintptr, lParam uintptr) uintptr {
	switch msg {
	case WM_TRAYICON:
		switch lParam {
		case WM_LBUTTONUP, WM_LBUTTONDBLCLK:
			if appCtx != nil {
				miniW, miniH := 380, 580
				screenWidth, screenHeight := getScreenSize()
				if screenWidth == 0 {
					screenWidth, screenHeight = 1920, 1080
				}
				runtime.WindowSetMinSize(appCtx, miniW, miniH)
				runtime.WindowSetMaxSize(appCtx, miniW, miniH)
				runtime.WindowSetSize(appCtx, miniW, miniH)
				runtime.WindowSetPosition(appCtx, screenWidth-miniW-16, screenHeight-miniH-56)
				runtime.WindowShow(appCtx)
				runtime.WindowUnminimise(appCtx)
				runtime.EventsEmit(appCtx, "tray-open-mini")
			}
		case WM_RBUTTONUP:
			showContextMenu(hwnd)
		}
		return 0
	}
	r, _, _ := defWindowProcW.Call(hwnd, uintptr(msg), wParam, lParam)
	return r
}

func showContextMenu(hwnd uintptr) {
	hMenu, _, _ := createPopupMenu.Call()
	if hMenu == 0 {
		return
	}

	showText, _ := syscall.UTF16PtrFromString("⚡ Open budwin")
	miniText, _ := syscall.UTF16PtrFromString("🪟 Mini View")
	quitText, _ := syscall.UTF16PtrFromString("❌ Quit budwin")

	appendMenuW.Call(hMenu, uintptr(MF_STRING), 1, uintptr(unsafe.Pointer(showText)))
	appendMenuW.Call(hMenu, uintptr(MF_STRING), 2, uintptr(unsafe.Pointer(miniText)))
	appendMenuW.Call(hMenu, uintptr(MF_SEPARATOR), 0, 0)
	appendMenuW.Call(hMenu, uintptr(MF_STRING), 3, uintptr(unsafe.Pointer(quitText)))

	var pt POINT
	getCursorPos.Call(uintptr(unsafe.Pointer(&pt)))

	setForegroundWindow.Call(hwnd)
	cmd, _, _ := trackPopupMenu.Call(
		hMenu,
		uintptr(TPM_LEFTALIGN|TPM_BOTTOMALIGN|0x0100), // TPM_RETURNCMD
		uintptr(pt.X),
		uintptr(pt.Y),
		0,
		hwnd,
		0,
	)

	destroyMenu.Call(hMenu)

	if appCtx == nil {
		return
	}

	switch cmd {
	case 1:
		runtime.WindowSetMinSize(appCtx, 380, 520)
		runtime.WindowSetMaxSize(appCtx, 3840, 2160)
		runtime.WindowSetSize(appCtx, 1060, 700)
		runtime.WindowCenter(appCtx)
		runtime.WindowShow(appCtx)
		runtime.WindowUnminimise(appCtx)
		runtime.EventsEmit(appCtx, "tray-open-full")
	case 2:
		miniW, miniH := 380, 580
		screenWidth, screenHeight := getScreenSize()
		if screenWidth == 0 {
			screenWidth, screenHeight = 1920, 1080
		}
		runtime.WindowSetMinSize(appCtx, miniW, miniH)
		runtime.WindowSetMaxSize(appCtx, miniW, miniH)
		runtime.WindowSetSize(appCtx, miniW, miniH)
		runtime.WindowSetPosition(appCtx, screenWidth-miniW-16, screenHeight-miniH-56)
		runtime.WindowShow(appCtx)
		runtime.WindowUnminimise(appCtx)
		runtime.EventsEmit(appCtx, "tray-open-mini")
	case 3:
		RemoveTray()
		runtime.Quit(appCtx)
	}
}

// InitTray creates the invisible message window and attaches the raccoon icon to Windows System Tray
func InitTray(ctx wailsRuntime.Context, iconPath string) {
	appCtx = ctx

	go func() {
		className, _ := syscall.UTF16PtrFromString("BudwinTrayClass")
		windowName, _ := syscall.UTF16PtrFromString("BudwinTrayWindow")

		wc := WNDCLASSEXW{
			LpfnWndProc:   syscall.NewCallback(wndProc),
			LpszClassName: className,
		}
		wc.CbSize = uint32(unsafe.Sizeof(wc))
		registerClassExW.Call(uintptr(unsafe.Pointer(&wc)))

		hwnd, _, _ := createWindowExW.Call(
			0,
			uintptr(unsafe.Pointer(className)),
			uintptr(unsafe.Pointer(windowName)),
			0, 0, 0, 0, 0,
			0, 0, 0, 0,
		)
		trayHwnd = hwnd

		pathPtr, _ := syscall.UTF16PtrFromString(iconPath)
		hIcon, _, _ := loadImageW.Call(
			0,
			uintptr(unsafe.Pointer(pathPtr)),
			IMAGE_ICON,
			16, 16,
			LR_LOADFROMFILE,
		)

		trayNID = NOTIFYICONDATAW{
			HWnd:             hwnd,
			UID:              1001,
			UFlags:           NIF_ICON | NIF_TIP | NIF_MESSAGE,
			UCallbackMessage: WM_TRAYICON,
			HIcon:            hIcon,
		}
		trayNID.CbSize = uint32(unsafe.Sizeof(trayNID))

		tip := "budwin - System & Latency Monitor"
		tipRunes := []rune(tip)
		for i := 0; i < len(tipRunes) && i < 127; i++ {
			trayNID.SzTip[i] = uint16(tipRunes[i])
		}

		shellNotifyIconW.Call(NIM_ADD, uintptr(unsafe.Pointer(&trayNID)))

		var msg MSG
		for {
			r, _, _ := getMessageW.Call(uintptr(unsafe.Pointer(&msg)), 0, 0, 0)
			if r == 0 || int32(r) == -1 {
				break
			}
			translateMessage.Call(uintptr(unsafe.Pointer(&msg)))
			dispatchMessageW.Call(uintptr(unsafe.Pointer(&msg)))
		}
	}()
}

func RemoveTray() {
	if trayHwnd != 0 {
		shellNotifyIconW.Call(NIM_DELETE, uintptr(unsafe.Pointer(&trayNID)))
		destroyWindow.Call(trayHwnd)
		trayHwnd = 0
	}
}
