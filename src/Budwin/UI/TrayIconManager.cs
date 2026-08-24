using System.Drawing;
using System.Windows.Forms;
using Application = System.Windows.Application;

namespace Budwin.UI;

public sealed class TrayIconManager : IDisposable
{
    private readonly NotifyIcon _notifyIcon;
    private readonly Action _onLeftClick;

    public TrayIconManager(Action onLeftClick, Action onQuit)
    {
        _onLeftClick = onLeftClick;

        _notifyIcon = new NotifyIcon
        {
            Icon = SystemIcons.Application,
            Text = "budwin — System Monitor",
            Visible = true
        };

        var contextMenu = new ContextMenuStrip();
        contextMenu.Items.Add("Open Dashboard", null, (s, e) => _onLeftClick());
        contextMenu.Items.Add(new ToolStripSeparator());
        contextMenu.Items.Add("Exit", null, (s, e) => onQuit());

        _notifyIcon.ContextMenuStrip = contextMenu;
        _notifyIcon.MouseClick += (s, e) =>
        {
            if (e.Button == MouseButtons.Left)
            {
                _onLeftClick();
            }
        };
    }

    public void UpdateTooltip(float cpu, float ram, uint gpu)
    {
        string text = $"budwin | CPU: {cpu:F0}% | RAM: {ram:F0}% | GPU: {gpu}%";
        if (text.Length >= 64) text = text.Substring(0, 63);
        _notifyIcon.Text = text;
    }

    public void Dispose()
    {
        _notifyIcon.Visible = false;
        _notifyIcon.Dispose();
    }
}
