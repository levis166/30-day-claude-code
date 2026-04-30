import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchBike, fetchComponents, fetchServiceLogs } from '../api';

export default function ServiceLog() {
  const { id } = useParams();
  const [bike, setBike]   = useState(null);
  const [logs, setLogs]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [b, components] = await Promise.all([fetchBike(id), fetchComponents(id)]);
      setBike(b);
      const nested = await Promise.all(
        components.map(c =>
          fetchServiceLogs(c.id).then(list =>
            list.map(l => ({ ...l, componentName: c.name }))
          )
        )
      );
      setLogs(nested.flat().sort((a, b) => b.date.localeCompare(a.date)));
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <div className="text-gray-500 py-8">Loading...</div>;

  return (
    <div>
      <Link to={`/bikes/${id}`} className="text-gray-500 hover:text-white text-sm inline-block mb-6">
        &larr; {bike?.name}
      </Link>
      <h1 className="text-3xl font-bold mb-8">Service History</h1>

      {logs.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p className="text-5xl mb-4">&#128295;</p>
          <p className="text-gray-400 text-lg">No service logs yet</p>
          <p className="text-sm mt-1">Log a service or replacement from the bike detail page</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map(log => (
            <div key={log.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 shrink-0 text-xs font-semibold px-2 py-1 rounded ${
                  log.type === 'replace' ? 'bg-blue-900/40 text-blue-400' : 'bg-green-900/40 text-green-400'
                }`}>
                  {log.type === 'replace' ? 'Replaced' : 'Serviced'}
                </span>
                <div>
                  <p className="font-medium text-white">{log.componentName}</p>
                  {log.notes && <p className="text-gray-400 text-sm mt-0.5">{log.notes}</p>}
                  {log.km_at_service != null && (
                    <p className="text-gray-600 text-xs mt-1">{log.km_at_service} km on bike</p>
                  )}
                </div>
              </div>
              <div className="text-right text-sm shrink-0 ml-4">
                <p className="text-gray-400">{log.date}</p>
                {log.cost != null && (
                  <p className="text-white font-medium mt-1">&pound;{parseFloat(log.cost).toFixed(2)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
