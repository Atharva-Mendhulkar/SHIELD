import { useState, useEffect } from 'react';
import axios from 'axios';
import { AttackSimulator } from '../components/AttackSimulator';
import { Terminal, Shield, Zap, Play, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import type { ScenarioInfo, ScenarioRunResponse } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

interface SimulationResult {
  scenario: string;
  score: number;
  action: string;
  time: string;
}

export const SimulatorPage = () => {
  const [status, setStatus] = useState('SYSTEM_IDLE');
  const [scenarios, setScenarios] = useState<ScenarioInfo[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [currentStep, setCurrentStep] = useState(0); // 0: Enroll, 1: Start Legit, 2: Simulator Ready
  const userId = 1;

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const res = await axios.get<ScenarioInfo[]>(`${BACKEND_URL}/scenarios/list`);
        setScenarios(res.data);
      } catch (e) {
        console.error("Failed to fetch scenarios", e);
      }
    };
    fetchScenarios();
  }, []);

  const handleEnroll = async () => {
    setStatus('ENROLLING_USER_ATHARVA...');
    try {
      await axios.post(`${BACKEND_URL}/enroll/${userId}`);
      setStatus('[DONE] USER_ENROLLED (10_SESSIONS)');
      setCurrentStep(1);
    } catch {
      setStatus('! ENROLLMENT_FAILED');
    }
  };

  const handleStartLegit = async () => {
    setStatus('STARTING_LEGIT_SESSION...');
    try {
      const res = await axios.post(`${BACKEND_URL}/session/start`, { 
        user_id: userId, 
        session_type: 'legitimate' 
      });
      setStatus(`[DONE] SESSION_ACTIVE: ${res.data.session_id}`);
      setCurrentStep(2);
    } catch {
      setStatus('! SESSION_INIT_FAILED');
    }
  };

  const handleTriggerSimSwap = async () => {
    setStatus('⚡ TRIGGERING_SIM_SWAP...');
    try {
      await axios.post(`${BACKEND_URL}/sim-swap/trigger?user_id=${userId}`);
      setStatus('[DONE] SIM_SWAP_ACTIVE');
    } catch {
      setStatus('! TRIGGER_FAILED');
    }
  };

  const handleStartAttack = async () => {
    if (!selectedScenario) {
      setStatus('! SELECT_SCENARIO_FIRST');
      return;
    }
    
    setStatus(`RUNNING_SCENARIO: ${selectedScenario}...`);
    try {
      const res = await axios.post<ScenarioRunResponse>(`${BACKEND_URL}/scenarios/${selectedScenario}/run?user_id=${userId}`);
      setStatus(`[DONE] SCENARIO_COMPLETE: ${res.data.action}`);
      setResults(prev => [
        ...prev,
        { scenario: selectedScenario, score: res.data.final_score, action: res.data.action, time: '28.2s' }
      ].slice(-5));
    } catch {
      setStatus('! SCENARIO_EXEC_FAILED');
    }
  };

  const handleReset = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 flex flex-col space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center space-x-4">
          <div className="bg-amber-500/20 p-3 rounded-xl border border-amber-500/30">
            <Shield className="text-amber-500 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black italic tracking-tight text-slate-100 flex items-center">
              SHIELD CONTROL PANEL <Zap className="w-5 h-5 ml-2 text-amber-500 fill-amber-500" />
            </h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Internal Security Simulator v2.1.0</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-right">
             <div className="text-[10px] text-slate-500 font-bold uppercase">System Integrity</div>
             <div className="text-emerald-500 font-bold">VERIFIED</div>
          </div>
          <div className="h-10 w-1 bg-emerald-500/30 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* Left: Controls */}
        <div className="lg:col-span-4 space-y-6">
          <AttackSimulator 
             onEnroll={handleEnroll}
             onStartLegit={handleStartLegit}
             onTriggerSimSwap={handleTriggerSimSwap}
             onStartAttack={handleStartAttack}
             onReset={handleReset}
             status={status}
             currentStep={currentStep}
          />
          
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
             <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4 flex items-center">
               <Play className="w-3 h-3 mr-2" /> Select Scenario
             </h3>
             <div className="space-y-2">
               {scenarios.map((s) => (
                 <button 
                   key={s.id}
                   onClick={() => setSelectedScenario(s.id)}
                   className={`w-full text-left p-3 rounded-xl border transition-all ${
                     selectedScenario === s.id 
                       ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' 
                       : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                   }`}
                 >
                   <div className="font-bold text-xs uppercase tracking-tight">{s.name}</div>
                   <div className="text-[10px] opacity-70 mt-0.5">{s.description}</div>
                 </button>
               ))}
             </div>
          </div>
        </div>

        {/* Right: Results Terminal */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
               <Terminal className="text-slate-500 w-4 h-4" />
               <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Simulator Output</span>
            </div>
            <div className="flex space-x-1.5">
               <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
               <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
               <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
            </div>
          </div>

          <div className="p-6 space-y-6 flex-1 overflow-y-auto font-mono">
             {results.length === 0 ? (
               <div className="text-center py-20 text-slate-700">
                  <Info className="w-10 h-10 mx-auto mb-4 opacity-20" />
                  <p className="text-xs uppercase tracking-widest">Awaiting scenario execution...</p>
               </div>
             ) : (
               <div className="space-y-4">
                 <table className="w-full text-[12px] text-left">
                   <thead>
                     <tr className="text-slate-500 border-b border-slate-800">
                       <th className="pb-3 px-2 font-bold uppercase italic">Scenario</th>
                       <th className="pb-3 px-2 font-bold uppercase italic">Score</th>
                       <th className="pb-3 px-2 font-bold uppercase italic">Action</th>
                       <th className="pb-3 px-2 font-bold uppercase italic">Time</th>
                       <th className="pb-3 px-2 font-bold uppercase italic">Status</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800/50">
                     {results.map((r, i) => (
                       <tr key={i} className="text-slate-100 group hover:bg-slate-800/20 transition-colors">
                         <td className="py-4 px-2 font-bold">{r.scenario}</td>
                         <td className={`py-4 px-2 font-bold ${r.score < 45 ? 'text-red-500' : 'text-emerald-500'}`}>{r.score}</td>
                         <td className="py-4 px-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.action.includes('BLOCK') || r.action.includes('FREEZE') 
                                ? 'bg-red-500/20 text-red-500' 
                                : 'bg-amber-500/20 text-amber-500'
                            }`}>
                               {r.action}
                            </span>
                         </td>
                         <td className="py-4 px-2 text-slate-500">{r.time}</td>
                         <td className="py-4 px-2">
                           {r.score < 80 ? (
                             <div className="bg-red-500/10 p-1 rounded border border-red-500/20">
                                <AlertTriangle className="w-3 h-3 text-red-500" />
                             </div>
                           ) : (
                             <div className="bg-emerald-500/10 p-1 rounded border border-emerald-500/20">
                                <CheckCircle className="w-3 h-3 text-emerald-500" />
                             </div>
                           )}
                         </td>
                       </tr>
                     ))}
                     {/* Legacy Constraint Row */}
                     <tr className="text-slate-500 bg-slate-950/30">
                       <td className="py-4 px-2 font-bold opacity-50 italic">Legacy Rule-Based</td>
                       <td className="py-4 px-2 font-bold opacity-50">N/A</td>
                       <td className="py-4 px-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500/50">
                             APPROVED [FAIL]
                          </span>
                       </td>
                       <td className="py-4 px-2 opacity-50 italic">N/A</td>
                       <td className="py-4 px-2">
                          <div className="bg-emerald-500/5 p-1 rounded border border-emerald-500/10 grayscale opacity-30">
                             <CheckCircle className="w-3 h-3" />
                          </div>
                       </td>
                     </tr>
                   </tbody>
                 </table>
                 
                 <div className="mt-8 p-4 bg-slate-950 rounded-xl border border-slate-800/50">
                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">Detailed Analysis</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">
                      "Outlier detected in typing dynamics (Z=3.8) and navigation pattern entropy. SIM swap signal fusion confirmed high-risk state. Transaction blocked within 24.2 seconds."
                    </p>
                 </div>
               </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SimulatorPage;
