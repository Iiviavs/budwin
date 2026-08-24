namespace Budwin.Core;

/// <summary>
/// A fixed-capacity ring buffer designed for zero-allocation history charts.
/// </summary>
public sealed class RingBuffer<T>
{
    private readonly T[] _buffer;
    private int _head;
    private int _count;

    public int Capacity => _buffer.Length;
    public int Count => _count;

    public RingBuffer(int capacity)
    {
        if (capacity <= 0) throw new ArgumentOutOfRangeException(nameof(capacity));
        _buffer = new T[capacity];
    }

    public void Add(T item)
    {
        _buffer[_head] = item;
        _head = (_head + 1) % _buffer.Length;
        if (_count < _buffer.Length)
        {
            _count++;
        }
    }

    public T[] ToArray()
    {
        var result = new T[_count];
        if (_count == 0) return result;

        int start = (_count < _buffer.Length) ? 0 : _head;
        for (int i = 0; i < _count; i++)
        {
            result[i] = _buffer[(start + i) % _buffer.Length];
        }
        return result;
    }

    public void Clear()
    {
        _head = 0;
        _count = 0;
        Array.Clear(_buffer, 0, _buffer.Length);
    }
}
