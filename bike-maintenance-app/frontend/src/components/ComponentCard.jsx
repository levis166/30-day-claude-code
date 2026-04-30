import HealthBar from './HealthBar';

export default function ComponentCard({ component, onLogService, onEdit, onDelete, onHistory }) {
  const { name, km_since_install, km_remaining, pct, status, replace_at_km, service_at_km } = component;

  const cardStyle = {
    ok:       'bg-green-900/10 border-green-800/40',
    warning:  'bg-yellow-900/10 border-yellow-800/40',
    critical: 'bg-orange-900/15 border-orange-700/50',
    overdue:  'bg-red-900/15 border-red-700/50',
  }[status] || 'bg-gray-900 border-gray-800';

  return (
    <div className={`rounded-lg border p-4 ${cardStyle}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white text-sm">{name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {km_since_install} km on component
            {km_remaining !== null && (
              <span className="text-gray-500"> &middot; {km_remaining} km left</span>
            )}
          </p>
        </div>
        <div className="flex gap-1 shrink-0 ml-2">
          <button onClick={onHistory}    className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded">History</button>
          <button onClick={onLogService} className="text-xs bg-gray-800 hover:bg-gray-700 text-white    px-2 py-1 rounded">Log</button>
          <button onClick={onEdit}       className="text-xs bg-gray-800 hover:bg-gray-700 text-white    px-2 py-1 rounded">Edit</button>
          <button onClick={onDelete}     className="text-xs bg-red-900/40 hover:bg-red-800 text-red-300 px-2 py-1 rounded">×</button>
        </div>
      </div>
      <HealthBar pct={pct} status={status} />
      {(replace_at_km || service_at_km) && (
        <p className="text-xs text-gray-600 mt-2">
          {replace_at_km && `Replace at ${replace_at_km.toLocaleString()} km`}
          {replace_at_km && service_at_km && ' · '}
          {service_at_km && `Service at ${service_at_km.toLocaleString()} km`}
        </p>
      )}
    </div>
  );
}
