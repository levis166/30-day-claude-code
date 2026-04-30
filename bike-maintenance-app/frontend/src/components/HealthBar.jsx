export default function HealthBar({ pct, status }) {
  if (pct === null) return <span className="text-gray-500 text-xs">No threshold set</span>;

  const barColor = {
    ok:       'bg-green-500',
    warning:  'bg-yellow-400',
    critical: 'bg-orange-500',
    overdue:  'bg-red-600',
  }[status] || 'bg-green-500';

  const textColor = {
    ok:       'text-green-400',
    warning:  'text-yellow-400',
    critical: 'text-orange-400',
    overdue:  'text-red-400',
  }[status] || 'text-green-400';

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className={textColor}>
          {status === 'overdue' ? 'Overdue' : status === 'critical' ? 'Critical' : status === 'warning' ? 'Due soon' : 'Good'}
        </span>
        <span className="text-gray-500">{pct}% used</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}
