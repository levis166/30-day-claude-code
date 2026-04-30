import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  fetchBike, fetchBikeHealth, fetchRides, fetchServiceLogs,
  createRide, deleteRide, updateComponent, deleteComponent, createServiceLog,
} from '../api';
import ComponentCard from '../components/ComponentCard';

const inputCls = 'w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 text-xl">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AddRideModal({ bikeId, onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', distance_km: '', date: new Date().toISOString().slice(0, 10), duration_min: '', elevation_m: '' });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Modal title="Log Ride" onClose={onClose}>
      <form onSubmit={async e => { e.preventDefault(); await onAdd({ bike_id: bikeId, name: form.name, distance_km: parseFloat(form.distance_km), date: form.date, moving_time_s: form.duration_min ? parseInt(form.duration_min) * 60 : null, elevation_m: form.elevation_m ? parseFloat(form.elevation_m) : null }); onClose(); }} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Name</label>
          <input className={inputCls} value={form.name} onChange={set('name')} placeholder="Morning loop" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Distance (km) *</label><input required type="number" step="0.1" min="0" className={inputCls} value={form.distance_km} onChange={set('distance_km')} /></div>
          <div><label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Date *</label><input required type="date" className={inputCls} value={form.date} onChange={set('date')} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Duration (min)</label><input type="number" min="0" className={inputCls} value={form.duration_min} onChange={set('duration_min')} /></div>
          <div><label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Elevation (m)</label><input type="number" min="0" className={inputCls} value={form.elevation_m} onChange={set('elevation_m')} /></div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
          <button type="submit" className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors">Add Ride</button>
        </div>
      </form>
    </Modal>
  );
}

function ServiceLogModal({ component, bikeKm, onClose, onLog }) {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), type: 'service', km_at_service: bikeKm || '', notes: '', cost: '' });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Modal title={`Log: ${component.name}`} onClose={onClose}>
      <form onSubmit={async e => { e.preventDefault(); await onLog({ component_id: component.id, date: form.date, type: form.type, km_at_service: form.km_at_service ? parseFloat(form.km_at_service) : null, notes: form.notes || null, cost: form.cost ? parseFloat(form.cost) : null }); onClose(); }} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Type *</label>
            <select required className={inputCls} value={form.type} onChange={set('type')}>
              <option value="service">Service</option>
              <option value="replace">Replace</option>
            </select>
          </div>
          <div><label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Date *</label><input required type="date" className={inputCls} value={form.date} onChange={set('date')} /></div>
        </div>
        {form.type === 'replace' && (
          <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-3 text-xs text-blue-300">
            Replacing resets this component&apos;s km counter from the current bike total.
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Bike km</label><input type="number" step="0.1" className={inputCls} value={form.km_at_service} onChange={set('km_at_service')} /></div>
          <div><label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Cost (&pound;)</label><input type="number" step="0.01" min="0" className={inputCls} value={form.cost} onChange={set('cost')} /></div>
        </div>
        <div><label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Notes</label><textarea rows={2} className={inputCls} value={form.notes} onChange={set('notes')} /></div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
          <button type="submit" className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors">Save</button>
        </div>
      </form>
    </Modal>
  );
}

function EditComponentModal({ component, onClose, onSave }) {
  const [form, setForm] = useState({ ...component });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setNum = k => e => setForm(f => ({ ...f, [k]: e.target.value ? parseFloat(e.target.value) : null }));

  return (
    <Modal title={`Edit: ${component.name}`} onClose={onClose}>
      <form onSubmit={async e => { e.preventDefault(); await onSave(component.id, form); onClose(); }} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Name *</label><input required className={inputCls} value={form.name} onChange={set('name')} /></div>
          <div><label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Brand</label><input className={inputCls} value={form.brand || ''} onChange={set('brand')} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Replace at (km)</label><input type="number" className={inputCls} value={form.replace_at_km || ''} onChange={setNum('replace_at_km')} /></div>
          <div><label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Service at (km)</label><input type="number" className={inputCls} value={form.service_at_km || ''} onChange={setNum('service_at_km')} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Install date</label><input type="date" className={inputCls} value={form.install_date || ''} onChange={set('install_date')} /></div>
          <div><label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Installed at (km)</label><input type="number" step="0.1" className={inputCls} value={form.installed_km || 0} onChange={setNum('installed_km')} /></div>
        </div>
        <div><label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Notes</label><textarea rows={2} className={inputCls} value={form.notes || ''} onChange={set('notes')} /></div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
          <button type="submit" className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors">Save</button>
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
        <ul className="space-y-2 max-h-80 overflow-y-auto">
          {logs.map(log => (
            <li key={log.id} className="bg-gray-800 rounded-xl p-3 text-sm">
              <div className="flex justify-between items-center mb-1">
                <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
                  log.type === 'replace' ? 'bg-blue-900/40 text-blue-400' : 'bg-green-900/40 text-green-400'
                }`}>{log.type === 'replace' ? 'Replaced' : 'Serviced'}</span>
                <span className="text-gray-500 text-xs">{log.date}</span>
              </div>
              {log.km_at_service != null && <p className="text-gray-400 text-xs">{log.km_at_service.toLocaleString()} km on bike</p>}
              {log.notes && <p className="text-gray-300 mt-1">{log.notes}</p>}
              {log.cost != null && <p className="text-gray-400 text-xs mt-1">&pound;{parseFloat(log.cost).toFixed(2)}</p>}
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

const fmt = s => { if (!s) return ''; const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h > 0 ? `${h}h ${m}m` : `${m}m`; };

export default function BikeDetail() {
  const { id } = useParams();
  const [bike, setBike]               = useState(null);
  const [health, setHealth]           = useState([]);
  const [rides, setRides]             = useState([]);
  const [tab, setTab]                 = useState('components');
  const [showAddRide, setShowAddRide] = useState(false);
  const [serviceTarget, setServiceTarget] = useState(null);
  const [editTarget, setEditTarget]       = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);
  const [loading, setLoading]         = useState(true);

  const loadData = async () => {
    const [b, h, r] = await Promise.all([fetchBike(id), fetchBikeHealth(id), fetchRides(id)]);
    setBike(b); setHealth(h); setRides(r);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [id]);

  const totalKm  = rides.reduce((s, r) => s + r.distance_km, 0);
  const totalElev = rides.reduce((s, r) => s + (r.elevation_m || 0), 0);
  const overdue  = health.filter(c => c.status === 'overdue');
  const critical = health.filter(c => c.status === 'critical');

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-24 bg-gray-800 rounded-2xl" /><div className="h-64 bg-gray-800 rounded-2xl" /></div>;
  if (!bike)   return <div className="text-red-400 py-8">Bike not found.</div>;

  return (
    <div>
      <Link to="/" className="text-gray-500 hover:text-white text-sm inline-flex items-center gap-1 mb-6 transition-colors">
        &larr; All Bikes
      </Link>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{bike.name}</h1>
            <p className="text-gray-400 text-sm mt-0.5">{[bike.brand, bike.model].filter(Boolean).join(' ')} &middot; {bike.type}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold tabular-nums">{Math.round(totalKm).toLocaleString()} km</p>
            <p className="text-gray-500 text-xs mt-0.5">{rides.length} rides</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-800">
          <div className="text-center">
            <p className="text-sm font-semibold">{Math.round(totalKm).toLocaleString()}</p>
            <p className="text-xs text-gray-500">km total</p>
          </div>
          <div className="text-center border-x border-gray-800">
            <p className="text-sm font-semibold">{Math.round(totalElev).toLocaleString()}</p>
            <p className="text-xs text-gray-500">m elevation</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">{health.filter(c => c.status !== 'ok').length}</p>
            <p className="text-xs text-gray-500">need attention</p>
          </div>
        </div>
      </div>

      {(overdue.length > 0 || critical.length > 0) && (
        <div className="mb-5 bg-red-900/15 border border-red-800/40 rounded-xl p-4 text-sm">
          {overdue.length  > 0 && <p className="text-red-400 font-medium">Overdue: {overdue.map(c => c.name).join(', ')}</p>}
          {critical.length > 0 && <p className="text-orange-400 mt-1">Critical: {critical.map(c => c.name).join(', ')}</p>}
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1 border-b border-gray-800 flex-1">
          {['components', 'rides'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`pb-3 px-4 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
                tab === t ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}>
              {t} <span className="text-gray-600 text-xs">({t === 'components' ? health.length : rides.length})</span>
            </button>
          ))}
        </div>
        <Link to={`/bikes/${id}/service-log`} className="text-xs text-gray-500 hover:text-gray-300 ml-4 pb-3 transition-colors">
          Full history &rarr;
        </Link>
      </div>

      {tab === 'components' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...health].sort((a, b) => (b.pct || 0) - (a.pct || 0)).map(c => (
            <ComponentCard key={c.id} component={c}
              onLogService={() => setServiceTarget(c)}
              onEdit={() => setEditTarget(c)}
              onDelete={async () => { if (!confirm(`Delete ${c.name}?`)) return; await deleteComponent(c.id); loadData(); }}
              onHistory={() => setHistoryTarget(c)}
            />
          ))}
        </div>
      )}

      {tab === 'rides' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowAddRide(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">+ Log Ride</button>
          </div>
          {rides.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <p className="text-gray-400 font-medium">No rides logged yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rides.map(r => (
                <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between hover:border-gray-700 transition-colors group">
                  <div>
                    <p className="font-medium text-white text-sm">{r.name || 'Ride'}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {r.date}{r.moving_time_s && ` · ${fmt(r.moving_time_s)}`}{r.elevation_m && ` · ${r.elevation_m}m`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold tabular-nums text-sm">{r.distance_km} km</span>
                    <button onClick={async () => { if (!confirm('Delete ride?')) return; await deleteRide(r.id); loadData(); }}
                      className="text-gray-700 hover:text-red-400 text-lg opacity-0 group-hover:opacity-100 transition-all">&times;</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showAddRide  && <AddRideModal bikeId={id} onClose={() => setShowAddRide(false)} onAdd={async d => { await createRide(d); loadData(); }} />}
      {serviceTarget && <ServiceLogModal component={serviceTarget} bikeKm={Math.round(totalKm)} onClose={() => setServiceTarget(null)} onLog={async d => { await createServiceLog(d); loadData(); }} />}
      {editTarget    && <EditComponentModal component={editTarget} onClose={() => setEditTarget(null)} onSave={async (cid, d) => { await updateComponent(cid, d); loadData(); }} />}
      {historyTarget && <ComponentHistoryModal component={historyTarget} onClose={() => setHistoryTarget(null)} />}
    </div>
  );
}
