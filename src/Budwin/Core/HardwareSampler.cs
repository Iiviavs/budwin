using System.IO;
using System.Net.NetworkInformation;
using System.Runtime.InteropServices;

namespace Budwin.Core;

public struct SystemSnapshot
{
    public float CpuPercent;
    public float RamPercent;
    public ulong RamUsedBytes;
    public ulong RamTotalBytes;
    public ulong RamFreeBytes;
    public float DiskReadBytesPerSec;
    public float DiskWriteBytesPerSec;
    public float NetworkInBytesPerSec;
    public float NetworkOutBytesPerSec;
    public GpuTelemetry Gpu;
}

public sealed class HardwareSampler : IDisposable
{
    [StructLayout(LayoutKind.Sequential)]
    private struct MEMORYSTATUSEX
    {
        public uint dwLength;
        public uint dwMemoryLoad;
        public ulong ullTotalPhys;
        public ulong ullAvailPhys;
        public ulong ullTotalPageFile;
        public ulong ullAvailPageFile;
        public ulong ullTotalVirtual;
        public ulong ullAvailVirtual;
        public ulong ullAvailExtendedVirtual;

        public static MEMORYSTATUSEX Create()
        {
            return new MEMORYSTATUSEX { dwLength = (uint)Marshal.SizeOf(typeof(MEMORYSTATUSEX)) };
        }
    }

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool GlobalMemoryStatusEx(ref MEMORYSTATUSEX lpBuffer);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool GetSystemTimes(out long lpIdleTime, out long lpKernelTime, out long lpUserTime);

    // CPU Calculation State
    private long _prevIdleTime;
    private long _prevKernelTime;
    private long _prevUserTime;
    private bool _firstCpuSample = true;

    // Network Calculation State
    private long _prevNetBytesIn;
    private long _prevNetBytesOut;
    private DateTime _prevNetTime = DateTime.UtcNow;
    private bool _firstNetSample = true;

    public HardwareSampler()
    {
        NvmlInterop.Initialize();
        SampleCpu();
        SampleNetwork();
    }

    public SystemSnapshot Sample()
    {
        var snapshot = new SystemSnapshot();

        // 1. CPU
        snapshot.CpuPercent = SampleCpu();

        // 2. RAM
        var memStatus = MEMORYSTATUSEX.Create();
        if (GlobalMemoryStatusEx(ref memStatus))
        {
            snapshot.RamPercent = memStatus.dwMemoryLoad;
            snapshot.RamTotalBytes = memStatus.ullTotalPhys;
            snapshot.RamFreeBytes = memStatus.ullAvailPhys;
            snapshot.RamUsedBytes = memStatus.ullTotalPhys - memStatus.ullAvailPhys;
        }

        // 3. Network
        var (netIn, netOut) = SampleNetwork();
        snapshot.NetworkInBytesPerSec = netIn;
        snapshot.NetworkOutBytesPerSec = netOut;

        // 4. GPU
        snapshot.Gpu = NvmlInterop.GetTelemetry();

        return snapshot;
    }

    private float SampleCpu()
    {
        if (!GetSystemTimes(out long idleTime, out long kernelTime, out long userTime))
        {
            return 0.0f;
        }

        if (_firstCpuSample)
        {
            _prevIdleTime = idleTime;
            _prevKernelTime = kernelTime;
            _prevUserTime = userTime;
            _firstCpuSample = false;
            return 0.0f;
        }

        long diffIdle = idleTime - _prevIdleTime;
        long diffKernel = kernelTime - _prevKernelTime;
        long diffUser = userTime - _prevUserTime;

        _prevIdleTime = idleTime;
        _prevKernelTime = kernelTime;
        _prevUserTime = userTime;

        long diffTotal = diffKernel + diffUser;
        if (diffTotal <= 0) return 0.0f;

        float cpuUsage = (float)(diffTotal - diffIdle) / diffTotal * 100.0f;
        return Math.Clamp(cpuUsage, 0.0f, 100.0f);
    }

    private (float InRate, float OutRate) SampleNetwork()
    {
        long totalIn = 0;
        long totalOut = 0;

        try
        {
            var interfaces = NetworkInterface.GetAllNetworkInterfaces();
            foreach (var ni in interfaces)
            {
                if (ni.OperationalStatus == OperationalStatus.Up &&
                    ni.NetworkInterfaceType != NetworkInterfaceType.Loopback &&
                    ni.NetworkInterfaceType != NetworkInterfaceType.Tunnel)
                {
                    var stats = ni.GetIPStatistics();
                    totalIn += stats.BytesReceived;
                    totalOut += stats.BytesSent;
                }
            }
        }
        catch { }

        var now = DateTime.UtcNow;
        double elapsedSeconds = (now - _prevNetTime).TotalSeconds;

        if (_firstNetSample || elapsedSeconds <= 0)
        {
            _prevNetBytesIn = totalIn;
            _prevNetBytesOut = totalOut;
            _prevNetTime = now;
            _firstNetSample = false;
            return (0.0f, 0.0f);
        }

        float inRate = (float)((totalIn - _prevNetBytesIn) / elapsedSeconds);
        float outRate = (float)((totalOut - _prevNetBytesOut) / elapsedSeconds);

        _prevNetBytesIn = totalIn;
        _prevNetBytesOut = totalOut;
        _prevNetTime = now;

        return (Math.Max(0, inRate), Math.Max(0, outRate));
    }

    public void Dispose()
    {
        NvmlInterop.Shutdown();
    }
}
