using System.Diagnostics;

namespace Budwin.Core;

public struct ProcessSummary
{
    public int Id { get; set; }
    public string Name { get; set; }
    public ulong MemoryBytes { get; set; }
    public double MemoryMb => Math.Round((double)MemoryBytes / (1024 * 1024), 1);
    public string MemoryDisplay => $"{MemoryMb} MB";
}

public static class ProcessManager
{
    public static List<ProcessSummary> GetTopMemoryProcesses(int count = 5)
    {
        var list = new List<ProcessSummary>();
        try
        {
            var processes = Process.GetProcesses();
            foreach (var p in processes)
            {
                try
                {
                    list.Add(new ProcessSummary
                    {
                        Id = p.Id,
                        Name = p.ProcessName,
                        MemoryBytes = (ulong)p.WorkingSet64
                    });
                }
                catch
                {
                    // Process terminated during enumeration
                }
                finally
                {
                    p.Dispose();
                }
            }
        }
        catch { }

        return list.OrderByDescending(p => p.MemoryBytes).Take(count).ToList();
    }

    public static bool TryKillProcess(int processId, out string errorMessage)
    {
        errorMessage = string.Empty;
        try
        {
            using var proc = Process.GetProcessById(processId);
            proc.Kill(entireProcessTree: true);
            return true;
        }
        catch (Exception ex)
        {
            errorMessage = ex.Message;
            return false;
        }
    }
}
