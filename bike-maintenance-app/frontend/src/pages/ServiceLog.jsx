import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchBike, fetchComponents, fetchServiceLogs } from '../api';

export default function ServiceLog() {
  const { id } = useParams();
  const [bike, setBike]     = useState(null);
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [b, components] = await Promise.all([fetchBike(id), fetchComponents(id)]);
      setBike(b);
      const nested = await Promise.all(
        components.map(c => fetchServiceLogs(c.id).then(list => list.map(l => ({ ...l, componentName: c.name }))))
      );
      setLogs(nested.flat().sort((a, b) => b.date.localeCompare(a.date)));
      setLoading(false);
    };
    load();
  }, [id]);

  const totalCost = logs.reduce((s, l) => s + (l.cost || 0), 0);

  if (loading) return <div className="animate-pulse space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-800 rounded-xl" />)}</div>;

  return (
    <div>
      <Link to={`/bikes/${id}`} className="text-gray-500 hover:text-white text-sm inline-flex items-center gap-1 mb-6 transition-colors">
        &larr; {bike?.name}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Service History</h1>
        {totalCost > 0 && (
          <div className="text-right">
            <p className="text-lg font-bold">&pound;{totalCost.toFixed(2)}</p>
            <p className="text-xs text-gray-500">total spent</p>
          </div>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">&#128295;</span>
          </div>
          <p className="font-semibold text-gray-300">No service logs yet</p>
          <p className="text-sm text-gray-600 mt-1">Log a service from the bike detail page</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map(log => (
            <div key={log.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-start justify-between hover:border-gray-700 transition-colors">
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${
                  log.type === 'replace' ? 'bg-blue-900/40 text-blue-400' : 'bg-green-900/40 text-green-400'
                }`}>
                  {log.type === 'replace' ? 'Replaced' : 'Serviced'}
                </span>
                <div>
                  <p className="font-medium text-white text-sm">{log.componentName}</p>
                  {log.notes && <p className="text-gray-400 text-sm mt-0.5">{log.notes}</p>}
                  {log.km_at_service != null && <p className="text-gray-600 text-xs mt-1">{log.km_at_service.toLocaleString()} km on bike</p>}
                </div>
              </div>
              <div className="text-right text-sm shrink-0 ml-4">
                <p className="text-gray-400">{log.date}</p>
                {log.cost != null && <p className="text-white font-semibold mt-1">&pound;{parseFloat(log.cost).toFixed(2)}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
