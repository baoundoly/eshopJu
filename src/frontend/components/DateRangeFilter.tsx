'use client';

interface DateRangeFilterProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  loading?: boolean;
}

export default function DateRangeFilter({ from, to, onChange, loading }: DateRangeFilterProps) {
  const presets = [
    { label: 'Today', days: 0 },
    { label: '7 days', days: 7 },
    { label: '30 days', days: 30 },
    { label: '90 days', days: 90 },
  ];

  const applyPreset = (days: number) => {
    const toDate = new Date();
    const fromDate = days === 0 ? new Date() : new Date();
    if (days > 0) fromDate.setDate(fromDate.getDate() - days);
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);
    onChange(fromDate.toISOString().slice(0, 10), toDate.toISOString().slice(0, 10));
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex gap-1">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p.days)}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-700 text-gray-400 hover:border-rose-500 hover:text-white transition-colors disabled:opacity-40"
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={from}
          onChange={(e) => onChange(e.target.value, to)}
          disabled={loading}
          className="bg-gray-900 border border-gray-700 text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-rose-500 disabled:opacity-40"
        />
        <span className="text-gray-500 text-xs">to</span>
        <input
          type="date"
          value={to}
          onChange={(e) => onChange(from, e.target.value)}
          disabled={loading}
          className="bg-gray-900 border border-gray-700 text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-rose-500 disabled:opacity-40"
        />
      </div>
    </div>
  );
}
