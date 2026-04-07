import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { BankingAppPage } from './pages/BankingAppPage';
import { DashboardPage } from './pages/DashboardPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { LayoutDashboard, Terminal, CreditCard } from 'lucide-react';

function NavDock() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/90 backdrop-blur-2xl border border-white/10 px-6 py-3.5 rounded-2xl shadow-2xl shadow-black/40 flex items-center space-x-8">
      <Link to="/" className="flex flex-col items-center group">
        <div className={`p-2 rounded-xl transition-all ${isActive('/') ? 'bg-brand-gold/20' : 'group-hover:bg-brand-gold/10'}`}>
          <CreditCard className={`w-5 h-5 transition-colors ${isActive('/') ? 'text-brand-gold' : 'text-slate-400 group-hover:text-brand-gold'}`} />
        </div>
        <span className={`text-[9px] uppercase font-black tracking-widest mt-0.5 transition-opacity ${isActive('/') ? 'opacity-100 text-brand-gold' : 'opacity-0 group-hover:opacity-100 text-brand-gold'}`}>Bank</span>
      </Link>

      <Link to="/dashboard" className="flex flex-col items-center group">
        <div className={`p-2 rounded-xl transition-all ${isActive('/dashboard') ? 'bg-blue-500/20' : 'group-hover:bg-blue-500/10'}`}>
          <LayoutDashboard className={`w-5 h-5 transition-colors ${isActive('/dashboard') ? 'text-blue-500' : 'text-slate-400 group-hover:text-blue-500'}`} />
        </div>
        <span className={`text-[9px] uppercase font-black tracking-widest mt-0.5 transition-opacity ${isActive('/dashboard') ? 'opacity-100 text-blue-500' : 'opacity-0 group-hover:opacity-100 text-blue-500'}`}>Ops</span>
      </Link>

      <Link to="/simulator" className="flex flex-col items-center group">
        <div className={`p-2 rounded-xl transition-all ${isActive('/simulator') ? 'bg-emerald-500/20' : 'group-hover:bg-emerald-500/10'}`}>
          <Terminal className={`w-5 h-5 transition-colors ${isActive('/simulator') ? 'text-emerald-500' : 'text-slate-400 group-hover:text-emerald-500'}`} />
        </div>
        <span className={`text-[9px] uppercase font-black tracking-widest mt-0.5 transition-opacity ${isActive('/simulator') ? 'opacity-100 text-emerald-500' : 'opacity-0 group-hover:opacity-100 text-emerald-500'}`}>Sim</span>
      </Link>

      <div className="w-[1px] h-5 bg-white/10" />

      <div className="flex items-center space-x-2.5">
        <div className="w-7 h-7 bg-brand-gold rounded-lg flex items-center justify-center font-bold text-slate-950 text-xs shadow-lg shadow-brand-gold/20">SH</div>
        <div className="hidden sm:block">
          <div className="text-[10px] font-bold leading-none italic">SHIELD</div>
          <div className="text-[7px] font-black uppercase text-slate-500 tracking-widest leading-none mt-0.5">Behavioral Detection</div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-brand-gold/30">
        <NavDock />
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
