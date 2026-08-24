using System.Diagnostics;
using Microsoft.Win32;

namespace Budwin.Core;

public static class StartupManager
{
    private const string RegistryKeyName = "Budwin";
    private const string RunRegistryPath = @"SOFTWARE\Microsoft\Windows\CurrentVersion\Run";

    public static bool IsRunOnStartupEnabled()
    {
        try
        {
            using var key = Registry.CurrentUser.OpenSubKey(RunRegistryPath, false);
            return key?.GetValue(RegistryKeyName) != null;
        }
        catch
        {
            return false;
        }
    }

    public static bool SetRunOnStartup(bool enable)
    {
        try
        {
            using var key = Registry.CurrentUser.OpenSubKey(RunRegistryPath, true);
            if (key == null) return false;

            if (enable)
            {
                string? exePath = Environment.ProcessPath ?? Process.GetCurrentProcess().MainModule?.FileName;
                if (!string.IsNullOrEmpty(exePath))
                {
                    key.SetValue(RegistryKeyName, $"\"{exePath}\"");
                    return true;
                }
                return false;
            }
            else
            {
                key.DeleteValue(RegistryKeyName, false);
                return true;
            }
        }
        catch
        {
            return false;
        }
    }
}
