import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import BikeDetail from './pages/BikeDetail';
import ServiceLog from './pages/ServiceLog';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <nav className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-black tracking-tight">BM</span>
            </div>
            <span className="font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">
              Bike Maintenance
            </span>
          </Link>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/bikes/:id" element={<BikeDetail />} />
          <Route path="/bikes/:id/service-log" element={<ServiceLog />} />
        </Routes>
      </main>
    </div>
  );
}
