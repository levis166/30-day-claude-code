import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  fetchBike, fetchBikeHealth, fetchRides, fetchServiceLogs,
  createRide, deleteRide, updateComponent, deleteComponent, createServiceLog,
} from '../api';
import ComponentCard from '../components/ComponentCard';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AddRideModal({ bikeId, onClose, onAdd }) {
  const [form, setForm] = useState({
    name: '', distance_km: '', date: new Date().toISOString().slice(0, 10),
    duration_min: '', elevation_m: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd({
      bike_id: bikeId,
      name: form.name,
      distance_km: parseFloat(form.distance_km),
      date: form.date,
      moving_time_s: form.duration_min ? parseInt(form.duration_min) * 60 : null,
      elevation_m: form.elevation_m ? parseFloat(form.elevation_m) : null,
    });
    onClose();
  };

  return (
    <Modal title="Log Ride" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-gray-400">Name</label>
          <input className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Morning loop" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-400">Distance (km) *</label>
            <input required type="number" step="0.1" min="0" className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={form.distance_km} onChange={e => setForm(f => ({ ...f, distance_km: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm text-gray-400">Date *</label>
            <input required type="date" className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-400">Duration (min)</label>
            <input type="number" min="0" className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={form.duration_min} onChange={e => setForm(f => ({ ...f, duration_min: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm text-gray-400">Elevation (m)</label>
            <input type="number" min="0" className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={form.elevation_m} onChange={e => setForm(f => ({ ...f, elevation_m: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg">Add Ride</button>
        </div>
      </form>
    </Modal>
  );
}

function ServiceLogModal({ component, bikeKm, onClose, onLog }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: 'service', km_at_service: bikeKm || '', notes: '', cost: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onLog({
      component_id: component.id,
      date: form.date,
      type: form.type,
      km_at_service: form.km_at_service ? parseFloat(form.km_at_service) : null,
      notes: form.notes || null,
      cost: form.cost ? parseFloat(form.cost) : null,
    });
    onClose();
  };

  return (
    <Modal title={`Log: ${component.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-400">Type *</label>
            <select required className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="service">Service</option>
              <option value="replace">Replace</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400">Date *</label>
            <input required type="date" className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
        </div>
        {form.type === 'replace' && (
          <p className="text-xs text-blue-400 bg-blue-900/20 border border-blue-800 rounded p-2">
            This will reset the component km counter from today&apos;s bike total.
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-400">Bike km at service</label>
            <input type="number" step="0.1" className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={form.km_at_service} onChange={e => setForm(f => ({ ...f, km_at_service: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm text-gray-400">Cost (&pound;)</label>
            <input type="number" step="0.01" min="0" className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-400">Notes</label>
          <textarea rows={2} className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg">Save</button>
        </div>
      </form>
    </Modal>
  );
}

function EditComponentModal({ component, onClose, onSave }) {
  const [form, setForm] = useState({ ...component });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(component.id, form);
    onClose();
  };

  return (
    <Modal title={`Edit: ${component.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-400">Name *</label>
            <input required className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm text-gray-400">Brand</label>
            <input className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={form.brand || ''} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-400">Replace at (km)</label>
            <input type="number" className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={form.replace_at_km || ''} onChange={e => setForm(f => ({ ...f, replace_at_km: e.target.value ? parseFloat(e.target.value) : null }))} />
          </div>
          <div>
            <label className="text-sm text-gray-400">Service at (km)</label>
            <input type="number" className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={form.service_at_km || ''} onChange={e => setForm(f => ({ ...f, service_at_km: e.target.value ? parseFloat(e.target.value) : null }))} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-400">Install date</label>
            <input type="date" className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={form.install_date || ''} onChange={e => setForm(f => ({ ...f, install_date: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm text-gray-400">Installed at (km)</label>
            <input type="number" step="0.1" className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={form.installed_km || 0} onChange={e => setForm(f => ({ ...f, installed_km: parseFloat(e.target.value) }))} />
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-400">Notes</label>
          <textarea rows={2} className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg">Save</button>
        </div>
      </form>
    </Modal>
  );
}

function ComponentHistoryModal({ component, onClose }) {
  const [logs, setLogs] = useState([]);
  useEffect(() => { fetchServiceLogs(component.id).then(setLogs); }, [component.id]);

  return (
    <Modal title={`History: ${component.name}`} onClose={onClose}>
      {logs.length === 0 ? (
        <p className="text-gray-500 text-sm py-6 text-center">No service logs yet</p>
      ) : (
        <ul className="space-y-3 max-h-80 overflow-y-auto">
          {logs.map(log => (
            <li key={log.id} className="bg-gray-800 rounded-lg p-3 text-sm">
              <div className="flex justify-between mb-1">
                <span className={`font-medium ${log.type === 'replace' ? 'text-blue-400' : 'text-green-400'}`}>
                  {log.type === 'replace' ? 'Replaced' : 'Serviced'}
                </span>
                <span className="text-gray-400">{log.date}</span>
              </div>
              {log.km_at_service != null && <p className="text-gray-400">{log.km_at_service} km on bike</p>}
              {log.notes && <p className="text-gray-300 mt-1">{log.notes}</p>}
              {log.cost != null && <p className="text-gray-400 mt-1">&pound;{parseFloat(log.cost).toFixed(2)}</p>}
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

const fmt = (s) => {
  if (!s) return '';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export default function BikeDetail() {
  const { id } = useParams();
  const [bike, setBike]         = useState(null);
  const [health, setHealth]     = useState([]);
  const [rides, setRides]       = useState([]);
  const [tab, setTab]           = useState('components');
  const [showAddRide, setShowAddRide]     = useState(false);
  const [serviceTarget, setServiceTarget] = useState(null);
  const [editTarget, setEditTarget]       = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);
  const [loading, setLoading]   = useState(true);

  const loadData = async () => {
    const [b, h, r] = await Promise.all([fetchBike(id), fetchBikeHealth(id), fetchRides(id)]);
    setBike(b); setHealth(h); setRides(r);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [id]);

  const totalKm  = rides.reduce((s, r) => s + r.distance_km, 0);
  const overdue  = health.filter(c => c.status === 'overdue');
  const critical = health.filter(c => c.status === 'critical');

  if (loading) return <div className="text-gray-500 py-8">Loading...</div>;
  if (!bike)   return <div className="text-red-400 py-8">Bike not found.</div>;

  return (
    <div>
      <Link to="/" className="text-gray-500 hover:text-white text-sm inline-block mb-6">&larr; All Bikes</Link>

      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold">{bike.name}</h1>
          <p className="text-gray-400 mt-1">{[bike.brand, bike.model].filter(Boolean).join(' ')} &middot; {bike.type}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{Math.round(totalKm).toLocaleString()} km</p>
          <p className="text-gray-500 text-xs">total recorded</p>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Link to={`/bikes/${id}/service-log`} className="text-sm text-gray-500 hover:text-gray-300">
          Full service history &rarr;
        </Link>
      </div>

      {(overdue.length > 0 || critical.length > 0) && (
        <div className="mb-6 bg-red-900/20 border border-red-800/50 rounded-lg p-3 text-sm">
          {overdue.length  > 0 && <p className="text-red-400">Overdue: {overdue.map(c => c.name).join(', ')}</p>}
          {critical.length > 0 && <p className="text-orange-400 mt-0.5">Critical: {critical.map(c => c.name).join(', ')}</p>}
        </div>
      )}

      <div className="flex gap-1 mb-6 border-b border-gray-800">
        {['components', 'rides'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 px-3 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {t} ({t === 'components' ? health.length : rides.length})
          </button>
        ))}
      </div>

      {tab === 'components' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...health].sort((a, b) => (b.pct || 0) - (a.pct || 0)).map(c => (
            <ComponentCard
              key={c.id}
              component={c}
              onLogService={() => setServiceTarget(c)}
              onEdit={() => setEditTarget(c)}
              onDelete={async () => {
                if (!confirm(`Delete ${c.name} and its service logs?`)) return;
                await deleteComponent(c.id);
                loadData();
              }}
              onHistory={() => setHistoryTarget(c)}
            />
          ))}
        </div>
      )}

      {tab === 'rides' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowAddRide(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
              + Log Ride
            </button>
          </div>
          {rides.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <p className="text-4xl mb-3">&#128690;</p>
              <p className="text-gray-400">No rides logged yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rides.map(r => (
                <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{r.name || 'Ride'}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {r.date}
                      {r.moving_time_s && ` · ${fmt(r.moving_time_s)}`}
                      {r.elevation_m   && ` · ${r.elevation_m}m`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">{r.distance_km} km</span>
                    <button onClick={async () => {
                      if (!confirm('Delete this ride?')) return;
                      await deleteRide(r.id); loadData();
                    }} className="text-gray-600 hover:text-red-400 text-lg">&times;</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showAddRide && (
        <AddRideModal bikeId={id} onClose={() => setShowAddRide(false)}
          onAdd={async (data) => { await createRide(data); loadData(); }} />
      )}
      {serviceTarget && (
        <ServiceLogModal component={serviceTarget} bikeKm={Math.round(totalKm)}
          onClose={() => setServiceTarget(null)}
          onLog={async (data) => { await createServiceLog(data); loadData(); }} />
      )}
      {editTarget && (
        <EditComponentModal component={editTarget} onClose={() => setEditTarget(null)}
          onSave={async (cid, data) => { await updateComponent(cid, data); loadData(); }} />
      )}
      {historyTarget && (
        <ComponentHistoryModal component={historyTarget} onClose={() => setHistoryTarget(null)} />
      )}
    </div>
  );
}
