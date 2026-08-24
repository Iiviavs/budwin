using System.Runtime.InteropServices;

namespace Budwin.Core;

public struct GpuTelemetry
{
    public bool IsAvailable;
    public string Name;
    public uint CoreUtilization;    // Percentage (0-100)
    public uint MemoryUtilization;  // Percentage (0-100)
    public ulong VramTotalBytes;
    public ulong VramUsedBytes;
    public ulong VramFreeBytes;
    public uint TemperatureCelsius;
    public uint FanSpeedPercent;
    public uint PowerUsageMilliWatts;
}

/// <summary>
/// Lightweight P/Invoke wrapper for NVIDIA Management Library (nvml.dll).
/// Automatically degrades gracefully if no NVIDIA GPU or driver is present.
/// </summary>
public static class NvmlInterop
{
    private const string NvmlDll = "nvml.dll";

    [StructLayout(LayoutKind.Sequential)]
    private struct nvmlMemory_t
    {
        public ulong total;
        public ulong free;
        public ulong used;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct nvmlUtilization_t
    {
        public uint gpu;
        public uint memory;
    }

    [DllImport(NvmlDll, EntryPoint = "nvmlInit_v2")]
    private static extern int nvmlInit_v2();

    [DllImport(NvmlDll, EntryPoint = "nvmlShutdown")]
    private static extern int nvmlShutdown();

    [DllImport(NvmlDll, EntryPoint = "nvmlDeviceGetHandleByIndex_v2")]
    private static extern int nvmlDeviceGetHandleByIndex_v2(uint index, out IntPtr device);

    [DllImport(NvmlDll, EntryPoint = "nvmlDeviceGetName")]
    private static extern int nvmlDeviceGetName(IntPtr device, byte[] name, uint length);

    [DllImport(NvmlDll, EntryPoint = "nvmlDeviceGetUtilizationRates")]
    private static extern int nvmlDeviceGetUtilizationRates(IntPtr device, out nvmlUtilization_t utilization);

    [DllImport(NvmlDll, EntryPoint = "nvmlDeviceGetMemoryInfo")]
    private static extern int nvmlDeviceGetMemoryInfo(IntPtr device, out nvmlMemory_t memory);

    [DllImport(NvmlDll, EntryPoint = "nvmlDeviceGetTemperature")]
    private static extern int nvmlDeviceGetTemperature(IntPtr device, int sensorType, out uint temp);

    [DllImport(NvmlDll, EntryPoint = "nvmlDeviceGetFanSpeed")]
    private static extern int nvmlDeviceGetFanSpeed(IntPtr device, out uint speed);

    [DllImport(NvmlDll, EntryPoint = "nvmlDeviceGetPowerUsage")]
    private static extern int nvmlDeviceGetPowerUsage(IntPtr device, out uint powerMilliWatts);

    private static bool _initialized = false;
    private static IntPtr _primaryDevice = IntPtr.Zero;
    private static string _deviceName = "NVIDIA GPU";

    public static bool Initialize()
    {
        try
        {
            int res = nvmlInit_v2();
            if (res == 0)
            {
                if (nvmlDeviceGetHandleByIndex_v2(0, out _primaryDevice) == 0)
                {
                    byte[] nameBuffer = new byte[64];
                    if (nvmlDeviceGetName(_primaryDevice, nameBuffer, 64) == 0)
                    {
                        _deviceName = System.Text.Encoding.ASCII.GetString(nameBuffer).TrimEnd('\0');
                    }
                    _initialized = true;
                    return true;
                }
            }
        }
        catch
        {
            // NVML dll not present or driver unsupported
        }
        _initialized = false;
        return false;
    }

    public static GpuTelemetry GetTelemetry()
    {
        if (!_initialized && !Initialize())
        {
            return new GpuTelemetry { IsAvailable = false, Name = "N/A" };
        }

        var telem = new GpuTelemetry
        {
            IsAvailable = true,
            Name = _deviceName
        };

        try
        {
            if (nvmlDeviceGetUtilizationRates(_primaryDevice, out var util) == 0)
            {
                telem.CoreUtilization = util.gpu;
                telem.MemoryUtilization = util.memory;
            }

            if (nvmlDeviceGetMemoryInfo(_primaryDevice, out var mem) == 0)
            {
                telem.VramTotalBytes = mem.total;
                telem.VramUsedBytes = mem.used;
                telem.VramFreeBytes = mem.free;
            }

            if (nvmlDeviceGetTemperature(_primaryDevice, 0, out var temp) == 0)
            {
                telem.TemperatureCelsius = temp;
            }

            if (nvmlDeviceGetFanSpeed(_primaryDevice, out var fan) == 0)
            {
                telem.FanSpeedPercent = fan;
            }

            if (nvmlDeviceGetPowerUsage(_primaryDevice, out var pwr) == 0)
            {
                telem.PowerUsageMilliWatts = pwr;
            }
        }
        catch
        {
            telem.IsAvailable = false;
        }

        return telem;
    }

    public static void Shutdown()
    {
        if (_initialized)
        {
            try { nvmlShutdown(); } catch { }
            _initialized = false;
        }
    }
}
