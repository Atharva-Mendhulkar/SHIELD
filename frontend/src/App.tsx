import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import BankingAppPage from './pages/BankingAppPage';
import DashboardPage from './pages/DashboardPage';
import SimulatorPage from './pages/SimulatorPage';
import { LayoutDashboard, Terminal, CreditCard } from 'lucide-react';
import './index.css';

// Navigation aware of active routes
function Navigation() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '16px 24px', borderRadius: 9999, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', gap: 32 }}>
      
      <Link to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', position: 'relative' }} className="group">
        <div style={{ padding: 8, borderRadius: 12, background: isActive('/') ? 'rgba(245, 158, 11, 0.2)' : 'transparent', transition: 'all 0.2s' }}>
          <CreditCard size={20} color={isActive('/') ? '#F59E0B' : '#64748B'} />
        </div>
        <span style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em', marginTop: 4, color: '#F59E0B', opacity: isActive('/') ? 1 : 0, transition: 'opacity 0.2s', position: 'absolute', top: '100%' }}>Bank</span>
      </Link>
      
      <Link to="/dashboard" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', position: 'relative' }} className="group">
        <div style={{ padding: 8, borderRadius: 12, background: isActive('/dashboard') ? 'rgba(59, 130, 246, 0.2)' : 'transparent', transition: 'all 0.2s' }}>
          <LayoutDashboard size={20} color={isActive('/dashboard') ? '#3B82F6' : '#64748B'} />
        </div>
        <span style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em', marginTop: 4, color: '#3B82F6', opacity: isActive('/dashboard') ? 1 : 0, transition: 'opacity 0.2s', position: 'absolute', top: '100%' }}>Ops</span>
      </Link>

      <Link to="/simulator" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', position: 'relative' }} className="group">
        <div style={{ padding: 8, borderRadius: 12, background: isActive('/simulator') ? 'rgba(16, 185, 129, 0.2)' : 'transparent', transition: 'all 0.2s' }}>
          <Terminal size={20} color={isActive('/simulator') ? '#10B981' : '#64748B'} />
        </div>
        <span style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em', marginTop: 4, color: '#10B981', opacity: isActive('/simulator') ? 1 : 0, transition: 'opacity 0.2s', position: 'absolute', top: '100%' }}>SIM</span>
      </Link>

      <div style={{ width: 1, height: 24, background: 'rgba(255, 255, 255, 0.1)', margin: '0 -8px' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
         <div style={{ width: 32, height: 32, background: '#F59E0B', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#020617', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}>SH</div>
         <div style={{ display: 'none', '@media (min-width: 640px)': { display: 'block' } } as any}>
           <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1, fontStyle: 'italic', color: '#F1F5F9' }}>SHIELD</div>
           <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.15em', lineHeight: 1, marginTop: 4 }}>Behavioral Detection</div>
         </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', background: '#020617', color: '#F1F5F9', fontFamily: 'var(--font-sans)' }}>
        <Navigation />
        <Routes>
          <Route path="/" element={<BankingAppPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/simulator" element={<SimulatorPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
