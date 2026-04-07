import { useState, useEffect } from 'react';
import axios from 'axios';
import { ScoreDashboard } from '../components/ScoreDashboard';
import { Activity, Users, Shield, AlertTriangle, Clock } from 'lucide-react';
import type { ScoreResponse, SimSwapStatus } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const DashboardPage = () => {
  const [score, setScore] = useState(91);
  const [history, setHistory] = useState<{ time: string, score: number }[]>([]);
  const [riskLevel, setRiskLevel] = useState('LOW');
  const [action, setAction] = useState('ALLOW');
  const [anomalies, setAnomalies] = useState<string[]>([]);
  const [simSwapActive, setSimSwapActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Poll for the latest session and its score
  useEffect(() => {
    const fetchLatest = async () => {
       try {
         // In a real system, we'd have a websocket or a way to get the "active" session.
         // For the demo, we assume user_id=1.
          // We'll also check SIM swap status.
          const simRes = await axios.get<SimSwapStatus>(`${BACKEND_URL}/sim-swap/status/1`);
          setSimSwapActive(simRes.data.is_active);
 
          // For demo simplicity, we'll try to find an active session.
          // If we have a sessionId, we poll it.
          if (sessionId) {
            const scoreRes = await axios.get<ScoreResponse>(`${BACKEND_URL}/score/${sessionId}`);
            if (scoreRes.data) {
               setScore(scoreRes.data.score);
               setRiskLevel(scoreRes.data.risk_level || 'LOW');
               setAction(scoreRes.data.action || 'ALLOW');
               setAnomalies(scoreRes.data.top_anomalies || []);
               setHistory(prev => {
                 const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                 if (prev.length > 0 && prev[prev.length - 1].score === scoreRes.data.score) return prev;
                 return [...prev, { time: now, score: scoreRes.data.score }].slice(-20);
               });
            }
          }
       } catch (e) {
         console.error("Dashboard poll failed", e);
       }
    };

    const interval = setInterval(fetchLatest, 2000);
    return () => clearInterval(interval);
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-slate-950 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar / Stats */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
           <div className="flex items-center space-x-3 mb-6">
             <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-amber-500/20">SH</div>
             <div>
               <h1 className="text-xl font-bold text-slate-100 italic">SHIELD</h1>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Fraud Operations</p>
             </div>
           </div>
           
           <div className="space-y-4">
             <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/50">
               <div className="flex items-center justify-between mb-1">
                 <span className="text-[10px] text-slate-500 font-bold uppercase">System Status</span>
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
               </div>
               <div className="text-lg font-bold text-emerald-500">OPTIMAL</div>
             </div>
             
             <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/50">
               <div className="flex items-center justify-between mb-1">
                 <span className="text-[10px] text-slate-500 font-bold uppercase">Active Sessions</span>
               </div>
               <div className="text-lg font-bold text-slate-200">1,248</div>
             </div>
           </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
           <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center">
             <Clock className="w-3 h-3 mr-2" /> Recent Alerts
           </h3>
           <div className="space-y-3">
             <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="text-[10px] text-red-500 font-bold uppercase mb-1">SIM Swap Detected</div>
                <div className="text-xs text-slate-300">User ID: 1 • Atharva Kumar</div>
             </div>
             <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="text-[10px] text-amber-500 font-bold uppercase mb-1">Behavioral Drift</div>
                <div className="text-xs text-slate-300">User ID: 412 • Unusual timing</div>
             </div>
           </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="lg:col-span-9 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-slate-500" />
              <span className="text-sm font-bold text-slate-300">User: Atharva Kumar</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-bold text-emerald-500">Compliance: 100%</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Session ID:</span>
            <input 
              type="text" 
              placeholder="Enter Session ID..."
              className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-xs font-mono text-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              onChange={(e) => setSessionId(e.target.value)}
              value={sessionId || ''}
            />
          </div>
        </div>

        <ScoreDashboard 
          score={score}
          history={history}
          riskLevel={riskLevel}
          action={action}
          anomalies={anomalies}
          simSwapActive={simSwapActive}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center space-x-4">
              <div className="bg-blue-500/20 p-3 rounded-xl">
                 <Activity className="text-blue-500 w-6 h-6" />
              </div>
              <div>
                 <div className="text-[10px] text-slate-500 font-bold uppercase">Latency (p99)</div>
                 <div className="text-xl font-bold">42ms</div>
              </div>
           </div>
           
           <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center space-x-4">
              <div className="bg-emerald-500/20 p-3 rounded-xl">
                 <Shield className="text-emerald-500 w-6 h-6" />
              </div>
              <div>
                 <div className="text-[10px] text-slate-500 font-bold uppercase">Detection Rate</div>
                 <div className="text-xl font-bold">94.8%</div>
              </div>
           </div>

           <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center space-x-4">
              <div className="bg-red-500/20 p-3 rounded-xl">
                 <AlertTriangle className="text-red-500 w-6 h-6" />
              </div>
              <div>
                 <div className="text-[10px] text-slate-500 font-bold uppercase">False Positives</div>
                 <div className="text-xl font-bold">2.1%</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
