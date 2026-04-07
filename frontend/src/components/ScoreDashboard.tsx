import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, AlertCircle, CheckCircle, Activity, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScoreDashboardProps {
  score: number;
  history: { time: string, score: number }[];
  riskLevel: string;
  action: string;
  anomalies: string[];
  simSwapActive: boolean;
}

const RISK_LEVELS: Record<string, { color: string, label: string, action: string }> = {
  "LOW": { color: "text-emerald-500", label: "LOW RISK", action: "No intervention needed" },
  "MEDIUM": { color: "text-amber-500", label: "MEDIUM RISK", action: "Step-up auth recommended" },
  "HIGH": { color: "text-orange-500", label: "HIGH RISK", action: "Transaction pending review" },
  "CRITICAL": { color: "text-red-500", label: "CRITICAL ALERT", action: "BLOCK + FREEZE ACTIVE" }
};

export const ScoreDashboard: React.FC<ScoreDashboardProps> = ({
  score,
  history,
  riskLevel,
  action,
  anomalies,
  simSwapActive
}) => {
  const currentRisk = RISK_LEVELS[riskLevel] || RISK_LEVELS["LOW"];

  return (
    <div className="bg-slate-900 text-white rounded-3xl shadow-2xl p-8 w-full border border-white/5 flex flex-col space-y-8 backdrop-blur-3xl bg-slate-900/40 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className={`absolute -top-24 -right-24 w-64 h-64 blur-[120px] rounded-full opacity-20 ${currentRisk.color.replace('text', 'bg')}`} />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${currentRisk.color}`}>
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Behavioral Identity Engine</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Neural Network Analysis • Real-time</p>
          </div>
        </div>
        
        {simSwapActive && (
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center space-x-3 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-2xl"
          >
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            <span className="text-red-500 text-xs font-black uppercase tracking-wider">Telecommunication Alert: SIM SWAP</span>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative z-10">
        {/* Core Score display */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center p-10 bg-white/5 rounded-[2.5rem] border border-white/10 shadow-inner">
          <div className="relative">
            <motion.div 
              key={score}
              initial={{ scale: 0.5, opacity: 0, filter: 'blur(20px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              className={`text-9xl font-black ${currentRisk.color} tabular-nums leading-none tracking-tighter drop-shadow-2xl`}
            >
              {score}
            </motion.div>
          </div>
          <div className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] mt-4">Security Confidence</div>
          
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`mt-8 px-6 py-2.5 rounded-full border-2 ${currentRisk.color.replace('text', 'border')}/20 bg-white/5 flex items-center space-x-3`}
          >
            <Activity className={`w-5 h-5 ${currentRisk.color}`} />
            <span className={`text-sm font-black uppercase tracking-widest ${currentRisk.color}`}>{currentRisk.label}</span>
          </motion.div>
        </div>

        {/* Trend Graph */}
        <div className="lg:col-span-2 h-64 w-full bg-white/5 rounded-[2.5rem] border border-white/10 p-8 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="text-slate-400 text-xs font-black uppercase tracking-widest flex items-center">
               Identity Persistence Trend <Info className="w-4 h-4 ml-2 opacity-30" />
            </div>
            <div className={`text-[10px] font-bold px-3 py-1 rounded-lg bg-white/5 border border-white/5 ${currentRisk.color}`}>
              {Math.abs(score - (history[history.length-2]?.score || score))}pt variance
            </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="currentColor"
                  className={score < 45 ? "text-red-500" : (score < 70 ? "text-amber-500" : "text-emerald-500")}
                  strokeWidth={4} 
                  dot={false}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" /> Behavioral Deviations
          </h3>
          <div className="grid grid-cols-1 gap-2">
            <AnimatePresence>
              {anomalies.length > 0 ? (
                anomalies.map((a, i) => (
                  <motion.div 
                    key={a}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-4 bg-red-500/5 hover:bg-red-500/10 rounded-2xl border border-red-500/10 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]" />
                      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">{a}</span>
                    </div>
                    <span className="text-[10px] text-red-500/50 font-mono font-bold group-hover:text-red-500 transition-colors">CRITICAL_DRIFT</span>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center space-x-4 p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10"
                >
                  <div className="p-2 bg-emerald-500/20 rounded-xl">
                    <CheckCircle className="text-emerald-500 w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-black uppercase text-emerald-500 tracking-widest">Profile Match: Verified</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Behavioral signature aligns with user baseline.</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 flex flex-col justify-between">
           <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Neural Decisions</h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Automated Action</span>
                    <span className={`text-[11px] font-black uppercase tracking-widest ${currentRisk.color}`}>{action}</span>
                 </div>
                 <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      className={`h-full ${score < 45 ? 'bg-red-500' : 'bg-emerald-500'}`}
                    />
                 </div>
              </div>
           </div>
           <p className="text-[10px] text-slate-500 italic mt-6 leading-relaxed">
             "BehaviorShield leverages One-Class Support Vector Machines (ocSVM) to detect sub-second deviations in typing cadence and device handling stability."
           </p>
        </div>
      </div>
    </div>
  );
};
