import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchBikes, fetchBikeHealth, createBike, deleteBike } from '../api';
import HealthBar from '../components/HealthBar';

function AddBikeModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    name: '', brand: '', model: '', type: 'road',
    install_date: new Date().toISOString().slice(0, 10),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Add Bike</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Name *</label>
            <input required className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="My Road Bike" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-400">Brand</label>
              <input className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="Canyon" />
            </div>
            <div>
              <label className="text-sm text-gray-400">Model</label>
              <input className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="Ultimate CF SL" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-400">Type</label>
              <select className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="road">Road</option>
                <option value="gravel">Gravel</option>
                <option value="mtb">MTB</option>
                <option value="cx">CX</option>
                <option value="track">Track</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400">Components from</label>
              <input type="date" className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value={form.install_date} onChange={e => setForm(f => ({ ...f, install_date: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium">Add Bike</button>
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

  const worstComponent = health.find(c => c.status === 'overdue')
    || health.find(c => c.status === 'critical')
    || health.find(c => c.status === 'warning');

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <Link to={`/bikes/${bike.id}`} className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
            {bike.name}
          </Link>
          <p className="text-gray-500 text-sm mt-0.5">
            {[bike.brand, bike.model].filter(Boolean).join(' ')} &middot; {bike.type}
          </p>
        </div>
        <button onClick={() => onDelete(bike.id)} className="text-gray-700 hover:text-red-400 text-xl leading-none">&times;</button>
      </div>

      <div className="flex gap-3 text-sm mb-4">
        {overdue  > 0 && <span className="text-red-400">{overdue} overdue</span>}
        {critical > 0 && <span className="text-orange-400">{critical} critical</span>}
        {warning  > 0 && <span className="text-yellow-400">{warning} due soon</span>}
        {overdue === 0 && critical === 0 && warning === 0 && (
          <span className="text-green-400">All components good</span>
        )}
      </div>

      {worstComponent && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">{worstComponent.name}</p>
          <HealthBar pct={worstComponent.pct} status={worstComponent.status} />
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-800 text-sm">
        <span className="text-gray-600">{health.length} components tracked</span>
        <Link to={`/bikes/${bike.id}`} className="text-blue-400 hover:text-blue-300">View details &rarr;</Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [bikes, setBikes]       = useState([]);
  const [healthMap, setHealthMap] = useState({});
  const [showAdd, setShowAdd]   = useState(false);
  const [loading, setLoading]   = useState(true);

  const loadData = async () => {
    const b = await fetchBikes();
    setBikes(b);
    const entries = await Promise.all(
      b.map(bike => fetchBikeHealth(bike.id).then(h => [bike.id, h]))
    );
    setHealthMap(Object.fromEntries(entries));
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = async (data) => { await createBike(data); loadData(); };

  const handleDelete = async (id) => {
    if (!confirm('Delete this bike and all its data?')) return;
    await deleteBike(id);
    loadData();
  };

  const allComponents  = Object.values(healthMap).flat();
  const overdueCount   = allComponents.filter(c => c.status === 'overdue').length;
  const criticalCount  = allComponents.filter(c => c.status === 'critical').length;

  if (loading) return <div className="text-gray-500 py-8">Loading...</div>;

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Bikes</h1>
          {(overdueCount > 0 || criticalCount > 0) && (
            <p className="text-sm mt-1">
              {overdueCount  > 0 && <span className="text-red-400">{overdueCount} overdue</span>}
              {overdueCount  > 0 && criticalCount > 0 && <span className="text-gray-600"> &middot; </span>}
              {criticalCount > 0 && <span className="text-orange-400">{criticalCount} critical</span>}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium"
        >
          + Add Bike
        </button>
      </div>

      {bikes.length === 0 ? (
        <div className="text-center py-24 text-gray-600">
          <p className="text-5xl mb-4">&#128690;</p>
          <p className="text-lg font-medium text-gray-400">No bikes yet</p>
          <p className="text-sm mt-1">Add your first bike to start tracking components</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bikes.map(bike => (
            <BikeCard
              key={bike.id}
              bike={bike}
              health={healthMap[bike.id] || []}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showAdd && <AddBikeModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </div>
  );
}
