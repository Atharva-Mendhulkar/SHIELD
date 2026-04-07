import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BankingAppPage } from './pages/BankingAppPage';
import { DashboardPage } from './pages/DashboardPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { LayoutDashboard, Terminal, CreditCard } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/30">
        
        {/* Persistent Navigation */}
        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900/80 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-3xl shadow-2xl flex items-center space-x-10">
          <Link to="/" className="flex flex-col items-center group">
            <div className="p-2 group-hover:bg-amber-500/20 rounded-xl transition-all">
              <CreditCard className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
            </div>
            <span className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-amber-500">Bank</span>
          </Link>
          
          <Link to="/dashboard" className="flex flex-col items-center group">
            <div className="p-2 group-hover:bg-blue-500/20 rounded-xl transition-all">
              <LayoutDashboard className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <span className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">Ops</span>
          </Link>

          <Link to="/simulator" className="flex flex-col items-center group">
            <div className="p-2 group-hover:bg-emerald-500/20 rounded-xl transition-all">
              <Terminal className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </div>
            <span className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500">SIM</span>
          </Link>

          <div className="w-[1px] h-6 bg-white/10 mx-2" />

          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-amber-500/20">SH</div>
             <div className="hidden sm:block">
               <div className="text-xs font-bold leading-none italic">SHIELD</div>
               <div className="text-[8px] font-black uppercase text-slate-500 tracking-widest leading-none mt-1">Behavioral Detection</div>
             </div>
          </div>
        </nav>

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
