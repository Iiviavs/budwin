using System.Windows;
using System.Windows.Media;
using Point = System.Windows.Point;
using Color = System.Windows.Media.Color;
using Pen = System.Windows.Media.Pen;
using Brush = System.Windows.Media.Brush;

namespace Budwin.UI.Controls;

public sealed class SparklineControl : FrameworkElement
{
    public static readonly DependencyProperty StrokeBrushProperty =
        DependencyProperty.Register(nameof(StrokeBrush), typeof(Brush), typeof(SparklineControl),
            new FrameworkPropertyMetadata(new SolidColorBrush(Color.FromRgb(0x4C, 0xAF, 0x50)), FrameworkPropertyMetadataOptions.AffectsRender));

    public static readonly DependencyProperty FillGradientProperty =
        DependencyProperty.Register(nameof(FillGradient), typeof(Brush), typeof(SparklineControl),
            new FrameworkPropertyMetadata(null, FrameworkPropertyMetadataOptions.AffectsRender));

    public Brush StrokeBrush
    {
        get => (Brush)GetValue(StrokeBrushProperty);
        set => SetValue(StrokeBrushProperty, value);
    }

    public Brush FillGradient
    {
        get => (Brush)GetValue(FillGradientProperty);
        set => SetValue(FillGradientProperty, value);
    }

    private float[] _values = Array.Empty<float>();
    private float _maxValue = 100.0f;

    public void UpdateData(float[] values, float maxValue = 100.0f)
    {
        _values = values;
        _maxValue = Math.Max(1.0f, maxValue);
        InvalidateVisual();
    }

    protected override void OnRender(DrawingContext dc)
    {
        base.OnRender(dc);

        double width = ActualWidth;
        double height = ActualHeight;

        if (width <= 0 || height <= 0) return;

        // Background subtle grid line
        var gridPen = new Pen(new SolidColorBrush(Color.FromArgb(20, 255, 255, 255)), 1.0);
        dc.DrawLine(gridPen, new Point(0, height * 0.5), new Point(width, height * 0.5));

        if (_values.Length < 2) return;

        var points = new Point[_values.Length];
        double stepX = width / (_values.Length - 1);

        for (int i = 0; i < _values.Length; i++)
        {
            double normalizedY = Math.Clamp(_values[i] / _maxValue, 0.0, 1.0);
            double y = height - (normalizedY * (height - 4)) - 2;
            points[i] = new Point(i * stepX, y);
        }

        // Fill geometry
        var fillGeo = new StreamGeometry();
        using (var ctx = fillGeo.Open())
        {
            ctx.BeginFigure(new Point(0, height), isFilled: true, isClosed: true);
            ctx.LineTo(points[0], isStroked: false, isSmoothJoin: true);
            for (int i = 1; i < points.Length; i++)
            {
                ctx.LineTo(points[i], isStroked: false, isSmoothJoin: true);
            }
            ctx.LineTo(new Point(width, height), isStroked: false, isSmoothJoin: true);
        }
        fillGeo.Freeze();

        Brush fillBrush = FillGradient ?? new LinearGradientBrush(
            Color.FromArgb(80, 76, 175, 80),
            Color.FromArgb(0, 76, 175, 80),
            new Point(0, 0),
            new Point(0, 1));

        dc.DrawGeometry(fillBrush, null, fillGeo);

        // Stroke line geometry
        var lineGeo = new StreamGeometry();
        using (var ctx = lineGeo.Open())
        {
            ctx.BeginFigure(points[0], isFilled: false, isClosed: false);
            for (int i = 1; i < points.Length; i++)
            {
                ctx.LineTo(points[i], isStroked: true, isSmoothJoin: true);
            }
        }
        lineGeo.Freeze();

        var strokePen = new Pen(StrokeBrush, 1.8) { StartLineCap = PenLineCap.Round, EndLineCap = PenLineCap.Round };
        dc.DrawGeometry(null, strokePen, lineGeo);
    }
}
