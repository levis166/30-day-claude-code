export default function HealthBar({ pct, status }) {
  if (pct === null) return <span className="text-gray-600 text-xs">No threshold set</span>;

  const config = {
    ok:       { bar: 'bg-gradient-to-r from-green-600 to-green-400',   label: 'Good',     text: 'text-green-400'  },
    warning:  { bar: 'bg-gradient-to-r from-yellow-600 to-yellow-400', label: 'Due soon', text: 'text-yellow-400' },
    critical: { bar: 'bg-gradient-to-r from-orange-600 to-orange-400', label: 'Critical', text: 'text-orange-400' },
    overdue:  { bar: 'bg-gradient-to-r from-red-700 to-red-500',       label: 'Overdue',  text: 'text-red-400'   },
  }[status] || { bar: 'bg-green-500', label: 'Good', text: 'text-green-400' };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5 text-xs">
        <span className={`font-semibold ${config.text}`}>{config.label}</span>
        <span className="text-gray-500 tabular-nums">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${config.bar}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}
