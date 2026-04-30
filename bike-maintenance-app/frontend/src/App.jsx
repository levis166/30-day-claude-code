import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import BikeDetail from './pages/BikeDetail';
import ServiceLog from './pages/ServiceLog';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <Link to="/" className="text-xl font-bold text-white tracking-tight">
            Bike Maintenance
          </Link>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/bikes/:id" element={<BikeDetail />} />
          <Route path="/bikes/:id/service-log" element={<ServiceLog />} />
        </Routes>
      </main>
    </div>
  );
}
