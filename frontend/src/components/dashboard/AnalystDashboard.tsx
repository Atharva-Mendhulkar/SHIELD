import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { Shield, AlertCircle, CheckCircle, Activity, Zap, AlertTriangle, Users, Clock, Monitor, Smartphone, MessageSquare, Info, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ScoreResponse, SimSwapStatus } from '../../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

/* ─── Helpers ─── */
function getScoreColor(s: number) { return s >= 70 ? '#22C55E' : s >= 45 ? '#F59E0B' : '#EF4444'; }
function getRisk(s: number) { return s >= 70 ? 'LOW' : s >= 45 ? 'MEDIUM' : s >= 30 ? 'HIGH' : 'CRITICAL'; }
function getAction(s: number) { return s >= 70 ? 'ALLOW' : s >= 45 ? 'STEP-UP AUTH' : s >= 30 ? 'BLOCK' : 'BLOCK + FREEZE'; }

const riskBadge: Record<string, string> = {
  LOW: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  MEDIUM: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  HIGH: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
  CRITICAL: 'bg-red-500/10 text-red-500 border-red-500/30',
};

/* ─── Alert Data ─── */
const ALERTS = [
  { id: 1, severity: 'critical', text: 'SIM SWAP ACTIVE', time: '6 min ago' },
  { id: 2, severity: 'critical', text: 'New device fingerprint', time: '6 min ago' },
  { id: 3, severity: 'warning', text: 'Typing anomaly — +80% delay', time: '12 min ago' },
  { id: 4, severity: 'warning', text: 'Navigation — direct to transfer', time: '18 min ago' },
];

/* ─── Main Dashboard ─── */
export default function AnalystDashboard() {
  const [score, setScore] = useState(91);
  const [history, setHistory] = useState<{ time: string; score: number }[]>([]);
  const [riskLevel, setRiskLevel] = useState('LOW');
  const [action, setAction] = useState('ALLOW');
  const [anomalies, setAnomalies] = useState<string[]>([]);
  const [simSwapActive, setSimSwapActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [frozen, setFrozen] = useState(false);

  // Poll backend
  useEffect(() => {
    const poll = async () => {
      try {
        const simRes = await axios.get<SimSwapStatus>(`${BACKEND_URL}/sim-swap/status/1`);
        setSimSwapActive(simRes.data.is_active);
        if (sessionId) {
          const scoreRes = await axios.get<ScoreResponse>(`${BACKEND_URL}/score/${sessionId}`);
          if (scoreRes.data) {
            setScore(scoreRes.data.score);
            setRiskLevel(scoreRes.data.risk_level || getRisk(scoreRes.data.score));
            setAction(scoreRes.data.action || getAction(scoreRes.data.score));
            setAnomalies(scoreRes.data.top_anomalies || []);
            if (scoreRes.data.action === 'BLOCK_AND_FREEZE') setFrozen(true);
            setHistory(prev => {
              const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              if (prev.length && prev[prev.length - 1].score === scoreRes.data.score) return prev;
              return [...prev, { time: now, score: scoreRes.data.score }].slice(-20);
            });
          }
        }
      } catch { /* API down */ }
    };
    const iv = setInterval(poll, 2000);
    return () => clearInterval(iv);
  }, [sessionId]);

  const color = getScoreColor(score);
  const risk = riskLevel || getRisk(score);
  const actionText = action || getAction(score);

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', color: '#F1F5F9', padding: 24 }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} color="#0F172A" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-display)', margin: 0, letterSpacing: '-0.02em' }}>S.H.I.E.L.D</h1>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>Fraud Operations Center</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', animation: 'shield-pulse 2s ease infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', fontFamily: 'var(--font-mono)' }}>LIVE</span>
        </div>
      </div>

      {/* User + Session ID row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Users size={14} color="#64748B" /><span style={{ fontSize: 12, fontWeight: 600 }}>Atharva Kumar</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Shield size={14} color="#22C55E" /><span style={{ fontSize: 12, fontWeight: 600, color: '#22C55E' }}>Compliance: 100%</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: '#64748B', fontWeight: 700 }}>SESSION:</span>
          <input type="text" placeholder="Enter Session ID..." value={sessionId || ''} onChange={e => setSessionId(e.target.value)} style={{ background: '#1E293B', border: '1px solid #334155', padding: '6px 12px', borderRadius: 8, fontSize: 11, fontFamily: 'var(--font-mono)', color: '#F59E0B', outline: 'none', width: 200 }} />
        </div>
      </div>

      {/* Main 3-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 280px', gap: 20, marginBottom: 20 }}>

        {/* Col 1: User Profile */}
        <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F1F5F9', color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, fontFamily: 'var(--font-mono)' }}>AK</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Atharva Kumar</div>
              <div style={{ fontSize: 11, color: '#64748B', fontFamily: 'var(--font-mono)' }}>Acc ****4521</div>
            </div>
          </div>
          <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${riskBadge[risk]}`} style={{ marginBottom: 16 }}>{risk} RISK</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>Enrolled</span><Check size={14} color="#22C55E" /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>Sessions</span><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>10</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>Baseline</span><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>91</span></div>
            <div style={{ height: 1, background: '#334155', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: '#64748B' }}>Devices</span>
              <div style={{ display: 'flex', gap: 4 }}><Monitor size={14} color="#64748B" /><Smartphone size={14} color="#64748B" /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: '#64748B' }}>Current</span>
              {simSwapActive ? <span style={{ fontSize: 10, fontWeight: 700, color: '#EF4444', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: 8 }}>UNKNOWN</span> : <span style={{ fontSize: 11, color: '#22C55E', fontWeight: 600 }}>Known ✓</span>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: '#64748B' }}>SIM Status</span>
              {simSwapActive ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#EF4444', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: 8 }}><Zap size={10} /> SWAP</span> : <span style={{ fontSize: 11, color: '#22C55E', fontWeight: 600 }}>Normal</span>}
            </div>
          </div>
        </div>

        {/* Col 2: Score + Chart */}
        <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden' }}>
          {frozen && <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.05)', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}><span style={{ color: '#EF4444', fontWeight: 800, fontSize: 18, opacity: 0.3, transform: 'rotate(-15deg)', letterSpacing: '0.2em' }}>FROZEN</span></div>}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 4 }}>Confidence Score</div>
            <motion.div key={score} initial={{ scale: 1.1, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} style={{ fontSize: 72, fontWeight: 800, fontFamily: 'var(--font-mono)', color, lineHeight: 1, letterSpacing: '-0.04em' }}>{score}</motion.div>
          </div>
          <div style={{ height: 180, marginBottom: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 12, fontSize: 11, fontWeight: 600 }} />
                <ReferenceLine y={45} stroke="#F59E0B" strokeDasharray="6 4" label={{ value: 'Step-Up', position: 'right', fontSize: 9, fill: '#F59E0B' }} />
                <ReferenceLine y={30} stroke="#EF4444" strokeDasharray="6 4" label={{ value: 'Block', position: 'right', fontSize: 9, fill: '#EF4444' }} />
                <Line type="monotone" dataKey="score" stroke={color} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} animationDuration={800} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${riskBadge[risk]}`}>RISK: {risk}</span>
            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${score < 30 ? riskBadge.CRITICAL : score < 45 ? riskBadge.MEDIUM : riskBadge.LOW}`}>ACTION: {actionText}</span>
          </div>
        </div>

        {/* Col 3: Alert Feed */}
        <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Live Alerts</h3>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', animation: 'shield-pulse 2s ease infinite' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
            {ALERTS.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: 10, borderRadius: 10, border: `1px solid ${a.severity === 'critical' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`, background: a.severity === 'critical' ? 'rgba(239,68,68,0.05)' : 'rgba(245,158,11,0.05)' }}>
                {a.severity === 'critical' ? <Zap size={14} color="#EF4444" style={{ marginTop: 2, flexShrink: 0 }} /> : <AlertTriangle size={14} color="#F59E0B" style={{ marginTop: 2, flexShrink: 0 }} />}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{a.text}</div>
                  <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>{a.time}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <button onClick={() => { try { axios.post(`${BACKEND_URL}/alert/send`); } catch {} }} style={{ marginTop: 12, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#EF4444', color: 'white', fontWeight: 700, fontSize: 12, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer' }}>
            <MessageSquare size={14} /> SEND SMS ALERT
          </button>
        </div>
      </div>

      {/* Bottom 2-Column: Anomalies + Neural Decisions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Anomalies */}
        <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, marginTop: 0 }}>
            <AlertCircle size={13} /> Behavioral Deviations
          </h3>
          <AnimatePresence>
            {anomalies.length > 0 ? anomalies.map((a, i) => (
              <motion.div key={a} initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(239,68,68,0.05)', borderRadius: 12, border: '1px solid rgba(239,68,68,0.1)', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 8px #EF4444' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{a}</span>
                </div>
                <span style={{ fontSize: 9, color: 'rgba(239,68,68,0.5)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>DRIFT</span>
              </motion.div>
            )) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'rgba(34,197,94,0.05)', borderRadius: 12, border: '1px solid rgba(34,197,94,0.1)' }}>
                <CheckCircle size={16} color="#22C55E" />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#22C55E', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Profile Match: Verified</div>
                  <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>Behavioral signature aligns with baseline.</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Neural Decisions */}
        <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 16px' }}>Neural Decisions</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 12 }}>
              <span style={{ color: '#94A3B8', fontWeight: 600 }}>Automated Action</span>
              <span style={{ fontWeight: 800, color }}>{actionText}</span>
            </div>
            <div style={{ height: 4, background: '#334155', borderRadius: 99, overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} style={{ height: '100%', background: score < 45 ? '#EF4444' : '#22C55E', borderRadius: 99 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              {[
                { label: 'Latency', value: '42ms', icon: Activity },
                { label: 'Detection', value: '94.8%', icon: Shield },
                { label: 'FP Rate', value: '2.1%', icon: AlertTriangle },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <m.icon size={12} color="#64748B" />
                  <div>
                    <div style={{ fontSize: 9, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>{m.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{m.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontSize: 10, color: '#64748B', fontStyle: 'italic', lineHeight: 1.6, marginTop: 16, marginBottom: 0 }}>
            "One-Class SVM detects sub-second deviations in typing cadence and device handling stability — mapped to [0, 100] confidence score."
          </p>
        </div>
      </div>

      {/* SIM Swap Banner */}
      {simSwapActive && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: 12, borderRadius: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', animation: 'shield-pulse 1s ease infinite' }} />
          <span style={{ fontSize: 12, fontWeight: 800, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Telecom Alert: SIM SWAP DETECTED</span>
        </motion.div>
      )}
    </div>
  );
}
