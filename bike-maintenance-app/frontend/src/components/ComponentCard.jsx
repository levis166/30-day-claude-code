import HealthBar from './HealthBar';

const STATUS = {
  ok:       { strip: 'border-l-green-600',  badge: 'bg-green-900/30 text-green-400 ring-green-800/50'   },
  warning:  { strip: 'border-l-yellow-500', badge: 'bg-yellow-900/30 text-yellow-400 ring-yellow-800/50' },
  critical: { strip: 'border-l-orange-500', badge: 'bg-orange-900/30 text-orange-400 ring-orange-800/50' },
  overdue:  { strip: 'border-l-red-600',    badge: 'bg-red-900/30 text-red-400 ring-red-800/50'         },
};

const LABEL = { ok: 'Good', warning: 'Due soon', critical: 'Critical', overdue: 'Overdue' };

export default function ComponentCard({ component, onLogService, onEdit, onDelete, onHistory }) {
  const { name, brand, km_since_install, km_remaining, pct, status, replace_at_km, service_at_km } = component;
  const s = STATUS[status] || STATUS.ok;

  return (
    <div className={`bg-gray-900 rounded-xl border border-gray-800 border-l-[3px] ${s.strip} hover:border-gray-700 transition-colors`}>
      <div className="p-4">

        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-white text-sm">{name}</h3>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ring-1 ${s.badge}`}>
                {LABEL[status] || 'Good'}
              </span>
            </div>
            {brand && <p className="text-xs text-gray-500 mt-0.5">{brand}</p>}
          </div>
          <div className="flex gap-1 shrink-0">
            <button onClick={onHistory}    className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-2 py-1 rounded-md transition-colors">Hist</button>
            <button onClick={onLogService} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-2 py-1 rounded-md transition-colors">Log</button>
            <button onClick={onEdit}       className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-2 py-1 rounded-md transition-colors">Edit</button>
            <button onClick={onDelete}     className="text-xs bg-gray-800 hover:bg-red-900/50 text-gray-500 hover:text-red-400 px-2 py-1 rounded-md transition-colors">&times;</button>
          </div>
        </div>

        <HealthBar pct={pct} status={status} />

        <div className="flex items-center justify-between mt-3 text-xs">
          <span className="text-gray-500">{km_since_install.toLocaleString()} km on component</span>
          {km_remaining !== null && (
            <span className={km_remaining === 0 ? 'text-red-400 font-medium' : 'text-gray-600'}>
              {km_remaining === 0 ? 'Due now' : `${km_remaining.toLocaleString()} km left`}
            </span>
          )}
        </div>

        {(replace_at_km || service_at_km) && (
          <div className="mt-2.5 pt-2.5 border-t border-gray-800/80 flex gap-4 text-xs text-gray-600">
            {replace_at_km && <span>Replace at {replace_at_km.toLocaleString()} km</span>}
            {service_at_km && <span>Service at {service_at_km.toLocaleString()} km</span>}
          </div>
        )}

      </div>
    </div>
  );
}
