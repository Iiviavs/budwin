using System.Threading;
using System.Windows;
using System.Windows.Threading;
using Budwin.Core;
using Budwin.UI;

namespace Budwin;

public partial class App : System.Windows.Application
{
    private static Mutex? _singleInstanceMutex;
    private HardwareSampler? _sampler;
    private TrayIconManager? _trayManager;
    private FlyoutWindow? _flyoutWindow;
    private DispatcherTimer? _timer;

    protected override void OnStartup(StartupEventArgs e)
    {
        const string mutexName = "Budwin_SingleInstance_Mutex";
        _singleInstanceMutex = new Mutex(true, mutexName, out bool isNewInstance);

        if (!isNewInstance)
        {
            System.Windows.MessageBox.Show("budwin is already running in your system tray.", "budwin", MessageBoxButton.OK, MessageBoxImage.Information);
            Shutdown();
            return;
        }

        base.OnStartup(e);

        _sampler = new HardwareSampler();
        _flyoutWindow = new FlyoutWindow(_sampler);

        _trayManager = new TrayIconManager(
            onLeftClick: () => _flyoutWindow.ToggleVisibility(),
            onQuit: () => Shutdown()
        );

        // 1-second telemetry timer
        _timer = new DispatcherTimer
        {
            Interval = TimeSpan.FromSeconds(1)
        };
        _timer.Tick += Timer_Tick;
        _timer.Start();
    }

    private void Timer_Tick(object? sender, EventArgs e)
    {
        if (_sampler == null || _flyoutWindow == null || _trayManager == null) return;

        var snapshot = _sampler.Sample();
        _trayManager.UpdateTooltip(snapshot.CpuPercent, snapshot.RamPercent, snapshot.Gpu.IsAvailable ? snapshot.Gpu.CoreUtilization : 0);

        if (_flyoutWindow.IsVisible)
        {
            _flyoutWindow.UpdateTelemetry();
        }
    }

    protected override void OnExit(ExitEventArgs e)
    {
        _timer?.Stop();
        _trayManager?.Dispose();
        _sampler?.Dispose();
        _singleInstanceMutex?.Dispose();

        base.OnExit(e);
    }
}
