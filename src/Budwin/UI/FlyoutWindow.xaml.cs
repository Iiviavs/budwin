using System.Diagnostics;
using System.Windows;
using System.Windows.Media;
using System.Windows.Forms;
using Budwin.Core;
using Application = System.Windows.Application;
using MessageBox = System.Windows.MessageBox;

namespace Budwin.UI;

public partial class FlyoutWindow : Window
{
    private readonly HardwareSampler _sampler;
    private readonly RingBuffer<float> _cpuHistory = new(60);
    private readonly RingBuffer<float> _gpuHistory = new(60);

    public FlyoutWindow(HardwareSampler sampler)
    {
        InitializeComponent();
        _sampler = sampler;

        ChkAutoStart.IsChecked = StartupManager.IsRunOnStartupEnabled();
        Deactivated += FlyoutWindow_Deactivated;
    }

    private void FlyoutWindow_Deactivated(object? sender, EventArgs e)
    {
        Hide();
    }

    public void ToggleVisibility()
    {
        if (IsVisible)
        {
            Hide();
        }
        else
        {
            PositionNearTray();
            Show();
            Activate();
            UpdateTelemetry();
        }
    }

    public void PositionNearTray()
    {
        var screen = Screen.PrimaryScreen ?? Screen.AllScreens[0];
        var workingArea = screen.WorkingArea;
        var bounds = screen.Bounds;

        // Position bottom-right by default above the taskbar
        double dpiScale = System.Windows.Media.VisualTreeHelper.GetDpi(this).DpiScaleX;
        double windowWidth = Width * dpiScale;
        double windowHeight = Height * dpiScale;

        double left = workingArea.Right - windowWidth - 10;
        double top = workingArea.Bottom - windowHeight - 10;

        Left = left / dpiScale;
        Top = top / dpiScale;
    }

    public void UpdateTelemetry()
    {
        var snapshot = _sampler.Sample();

        // 1. CPU
        _cpuHistory.Add(snapshot.CpuPercent);
        TxtCpuPercent.Text = $"{Math.Round(snapshot.CpuPercent)}%";
        CpuSparkline.UpdateData(_cpuHistory.ToArray(), 100.0f);

        // 2. GPU
        if (snapshot.Gpu.IsAvailable)
        {
            _gpuHistory.Add(snapshot.Gpu.CoreUtilization);
            TxtGpuPercent.Text = $"{snapshot.Gpu.CoreUtilization}% ({snapshot.Gpu.TemperatureCelsius}°C)";
            GpuSparkline.UpdateData(_gpuHistory.ToArray(), 100.0f);
        }
        else
        {
            TxtGpuPercent.Text = "N/A";
        }

        // 3. RAM
        TxtRamPercent.Text = $"{Math.Round(snapshot.RamPercent)}%";
        BarRam.Value = snapshot.RamPercent;
        double usedGb = (double)snapshot.RamUsedBytes / (1024 * 1024 * 1024);
        double totalGb = (double)snapshot.RamTotalBytes / (1024 * 1024 * 1024);
        TxtRamDetail.Text = $"{usedGb:F1} / {totalGb:F1} GB";

        // 4. Network
        string downStr = FormatSpeed(snapshot.NetworkInBytesPerSec);
        string upStr = FormatSpeed(snapshot.NetworkOutBytesPerSec);
        TxtNetDown.Text = downStr;
        TxtNetUp.Text = upStr;
        TxtNetSpeed.Text = downStr;

        // 5. Top Processes (only refresh process list if window is actively open)
        if (IsVisible)
        {
            ListTopProcesses.ItemsSource = ProcessManager.GetTopMemoryProcesses(5);
        }
    }

    private static string FormatSpeed(float bytesPerSec)
    {
        if (bytesPerSec >= 1024 * 1024)
        {
            return $"{(bytesPerSec / (1024 * 1024)):F1} MB/s";
        }
        if (bytesPerSec >= 1024)
        {
            return $"{(bytesPerSec / 1024):F0} KB/s";
        }
        return $"{bytesPerSec:F0} B/s";
    }

    private void BtnClose_Click(object sender, RoutedEventArgs e)
    {
        Hide();
    }

    private void BtnKillProcess_Click(object sender, RoutedEventArgs e)
    {
        if (sender is System.Windows.Controls.Button btn && btn.Tag is int pid)
        {
            if (MessageBox.Show($"Are you sure you want to end process ID {pid}?", "End Process", MessageBoxButton.YesNo, MessageBoxImage.Warning) == MessageBoxResult.Yes)
            {
                if (ProcessManager.TryKillProcess(pid, out string err))
                {
                    ListTopProcesses.ItemsSource = ProcessManager.GetTopMemoryProcesses(5);
                }
                else
                {
                    MessageBox.Show($"Failed to end process: {err}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
        }
    }

    private void ChkAutoStart_Changed(object sender, RoutedEventArgs e)
    {
        StartupManager.SetRunOnStartup(ChkAutoStart.IsChecked == true);
    }

    private void BtnGithub_Click(object sender, RoutedEventArgs e)
    {
        try
        {
            Process.Start(new ProcessStartInfo("https://github.com/crynn/budwin") { UseShellExecute = true });
        }
        catch { }
    }

    private void BtnQuit_Click(object sender, RoutedEventArgs e)
    {
        Application.Current.Shutdown();
    }
}
