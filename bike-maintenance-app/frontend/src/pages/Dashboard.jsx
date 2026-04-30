import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchBikes, fetchBikeHealth, createBike, deleteBike } from '../api';
import HealthBar from '../components/HealthBar';

const TYPE_BADGE = {
  road:   'bg-blue-900/40 text-blue-400',
  gravel: 'bg-amber-900/40 text-amber-400',
  mtb:    'bg-green-900/40 text-green-400',
  cx:     'bg-purple-900/40 text-purple-400',
  track:  'bg-rose-900/40 text-rose-400',
};

function AddBikeModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    name: '', brand: '', model: '', type: 'road',
    install_date: new Date().toISOString().slice(0, 10),
  });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd(form);
    onClose();
  };

  const inputCls = 'w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors';

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold">Add Bike</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Name *</label>
            <input required className={inputCls} value={form.name} onChange={set('name')} placeholder="My Road Bike" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Brand</label>
              <input className={inputCls} value={form.brand} onChange={set('brand')} placeholder="Canyon" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Model</label>
              <input className={inputCls} value={form.model} onChange={set('model')} placeholder="Ultimate" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Type</label>
              <select className={inputCls} value={form.type} onChange={set('type')}>
                <option value="road">Road</option>
                <option value="gravel">Gravel</option>
                <option value="mtb">MTB</option>
                <option value="cx">CX</option>
                <option value="track">Track</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Components from</label>
              <input type="date" className={inputCls} value={form.install_date} onChange={set('install_date')} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors">Add Bike</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BikeCard({ bike, health, onDelete }) {
  const overdue  = health.filter(c => c.status === 'overdue').length;
  const critical = health.filter(c => c.status === 'critical').length;
  const warning  = health.filter(c => c.status === 'warning').length;
  const issues   = overdue + critical;

  const worstComponent =
    health.find(c => c.status === 'overdue') ||
    health.find(c => c.status === 'critical') ||
    health.find(c => c.status === 'warning');

  const stripColor = issues > 0 ? 'bg-red-500' : warning > 0 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors group">
      <div className={`h-1 w-full ${stripColor} transition-colors`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <Link to={`/bikes/${bike.id}`} className="text-lg font-bold text-white hover:text-blue-400 transition-colors">
              {bike.name}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              {bike.brand && <span className="text-sm text-gray-400">{bike.brand}</span>}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE[bike.type] || TYPE_BADGE.road}`}>
                {bike.type}
              </span>
            </div>
          </div>
          <button
            onClick={() => onDelete(bike.id)}
            className="text-gray-700 hover:text-red-400 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
          >&times;</button>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {overdue  > 0 && <span className="text-xs bg-red-900/40 text-red-400 px-2 py-0.5 rounded-full font-medium">{overdue} overdue</span>}
          {critical > 0 && <span className="text-xs bg-orange-900/40 text-orange-400 px-2 py-0.5 rounded-full font-medium">{critical} critical</span>}
          {warning  > 0 && <span className="text-xs bg-yellow-900/40 text-yellow-400 px-2 py-0.5 rounded-full font-medium">{warning} due soon</span>}
          {issues === 0 && warning === 0 && <span className="text-xs bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full font-medium">All good</span>}
        </div>

        {worstComponent && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1.5">{worstComponent.name}</p>
            <HealthBar pct={worstComponent.pct} status={worstComponent.status} />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-800 text-sm">
          <span className="text-gray-600">{health.length} components</span>
          <Link to={`/bikes/${bike.id}`} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            View &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [bikes, setBikes]         = useState([]);
  const [healthMap, setHealthMap] = useState({});
  const [showAdd, setShowAdd]     = useState(false);
  const [loading, setLoading]     = useState(true);

  const loadData = async () => {
    const b = await fetchBikes();
    setBikes(b);
    const entries = await Promise.all(b.map(bike => fetchBikeHealth(bike.id).then(h => [bike.id, h])));
    setHealthMap(Object.fromEntries(entries));
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd    = async (data) => { await createBike(data); loadData(); };
  const handleDelete = async (id)   => {
    if (!confirm('Delete this bike and all its data?')) return;
    await deleteBike(id);
    loadData();
  };

  const allComponents = Object.values(healthMap).flat();
  const issueCount    = allComponents.filter(c => c.status === 'overdue' || c.status === 'critical').length;
  const healthyCount  = allComponents.filter(c => c.status === 'ok').length;

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-800 rounded-xl w-48" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-800 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => <div key={i} className="h-52 bg-gray-800 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Bikes</h1>
        <button onClick={() => setShowAdd(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          + Add Bike
        </button>
      </div>

      {bikes.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{bikes.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Bikes</p>
          </div>
          <div className={`border rounded-xl p-4 text-center ${issueCount > 0 ? 'bg-red-900/10 border-red-800/40' : 'bg-gray-900 border-gray-800'}`}>
            <p className={`text-2xl font-bold ${issueCount > 0 ? 'text-red-400' : 'text-green-400'}`}>{issueCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Issues</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{healthyCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Healthy</p>
          </div>
        </div>
      )}

      {bikes.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">&#128690;</span>
          </div>
          <p className="font-semibold text-gray-300">No bikes yet</p>
          <p className="text-sm text-gray-600 mt-1">Add your first bike to start tracking components</p>
          <button onClick={() => setShowAdd(true)} className="mt-6 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
            + Add your first bike
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {bikes.map(bike => (
            <BikeCard key={bike.id} bike={bike} health={healthMap[bike.id] || []} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showAdd && <AddBikeModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </div>
  );
}
