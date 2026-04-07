import { useState, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import { Play, Zap, RefreshCcw, UserCheck, ShieldAlert, Lock, Shield, Info, CheckCircle, AlertTriangle, Search } from 'lucide-react';
import type { ScenarioInfo, ScenarioRunResponse, FeatureSnapshot } from '../../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

type StepStatus = 'pending' | 'ready' | 'active' | 'done';

interface ScenarioResult {
  scenarioId: string;
  scenarioName: string;
  score: number;
  detected: boolean;
  time: string;
  result: string;
}

/* ─── Orb Visualization ─── */
function OrbVisualization({ score, phase, anomalyCount }: { score: number | null; phase: string; anomalyCount: number }) {
  const centerColor = useMemo(() => {
    if (phase === 'blocked') return 'from-red-600 to-red-900';
    if (phase === 'allowed') return 'from-emerald-500 to-emerald-800';
    if (phase === 'attacking') return 'from-amber-500 to-amber-800';
    return 'from-blue-500/50 to-blue-900/50';
  }, [phase]);

  const centerGlow = useMemo(() => {
    if (phase === 'blocked') return '0 0 60px rgba(239,68,68,0.5), 0 0 120px rgba(239,68,68,0.2)';
    if (phase === 'allowed') return '0 0 60px rgba(34,197,94,0.4), 0 0 120px rgba(34,197,94,0.15)';
    if (phase === 'attacking') return '0 0 40px rgba(245,158,11,0.4)';
    return '0 0 30px rgba(59,130,246,0.2)';
  }, [phase]);

  const frozen = phase === 'blocked';
  const orbs = [
    { label: 'Device', r: 130, s: 36 }, { label: 'SIM', r: 140, s: 30 },
    { label: 'Typing', r: 125, s: 32 }, { label: 'Location', r: 145, s: 34 },
    { label: 'Network', r: 130, s: 28 }, { label: 'Browser', r: 135, s: 30 },
    { label: 'Behavior', r: 140, s: 32 }, { label: 'Velocity', r: 125, s: 28 }
  ];

  return (
    <div style={{ position: 'relative', width: 350, height: 350, margin: '32px auto' }}>
      {[120, 140, 160].map(r => (
        <div key={r} style={{ position: 'absolute', width: r*2, height: r*2, left: `calc(50% - ${r}px)`, top: `calc(50% - ${r}px)`, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} />
      ))}
      
      {phase === 'attacking' && (
        <div style={{ position: 'absolute', width: 300, height: 300, left: 'calc(50% - 150px)', top: 'calc(50% - 150px)', borderRadius: '50%', border: '2px solid rgba(245,158,11,0.3)', animation: 'shield-pulse 2s ease-in-out infinite' }} />
      )}

      {orbs.map((o, i) => {
        const isRed = i < anomalyCount;
        const dur = frozen ? 0 : 8 + i * 2;
        const angle = (i * 360) / orbs.length;
        
        return (
          <div key={i} style={{ position: 'absolute', left: '50%', top: '50%', width: 0, height: 0, transform: `rotate(${angle}deg)` }}>
            <div style={{ position: 'absolute', left: o.r, top: -o.s/2, width: o.s, height: o.s, background: isRed ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.08)', border: `1px solid ${isRed ? 'rgba(239,68,68,0.6)' : 'rgba(34,197,94,0.3)'}`, color: isRed ? '#EF4444' : 'rgba(34,197,94,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, boxShadow: isRed ? '0 0 14px rgba(239,68,68,0.4)' : 'none', transition: 'all 0.5s', transform: `rotate(${-angle}deg)` }}>
              {o.label.slice(0,3)}
            </div>
          </div>
        );
      })}

      <div style={{ position: 'absolute', width: 120, height: 120, left: 'calc(50% - 60px)', top: 'calc(50% - 60px)', borderRadius: '50%', background: `linear-gradient(135deg, ${phase==='blocked'?'#b91c1c,#7f1d1d':phase==='allowed'?'#10b981,#065f46':phase==='attacking'?'#f59e0b,#b45309':'rgba(59,130,246,0.5),rgba(30,58,138,0.5)'})`, boxShadow: centerGlow, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'all 0.7s', color: 'white' }}>
        {phase === 'blocked' && <Lock size={24} style={{ marginBottom: 4 }} />}
        {phase === 'allowed' && <UserCheck size={24} style={{ marginBottom: 4 }} />}
        {phase === 'idle' && <Shield size={24} style={{ marginBottom: 4, opacity: 0.5 }} />}
        {score !== null ? (
          <>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: 10, opacity: 0.6, fontFamily: 'var(--font-mono)' }}>SCORE</span>
          </>
        ) : <span style={{ fontSize: 12, opacity: 0.4, fontFamily: 'var(--font-mono)' }}>READY</span>}
      </div>
    </div>
  );
}


/* ─── Simulator Control Panel ─── */
export default function SimulatorControlPanel() {
  const [scenarios, setScenarios] = useState<ScenarioInfo[]>([]);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(['ready', 'pending', 'pending', 'pending']);
  const [results, setResults] = useState<ScenarioResult[]>([]);
  const [phase, setPhase] = useState<'idle' | 'enrolling' | 'attacking' | 'blocked' | 'allowed'>('idle');
  const [score, setScore] = useState<number | null>(null);
  const [anomalyCount, setAnomalyCount] = useState(0);
  const [showLegacy, setShowLegacy] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const userId = 1;

  useEffect(() => {
    axios.get(`${BACKEND_URL}/scenarios/list`).then(res => setScenarios(res.data)).catch(() => {});
  }, []);

  const updateStep = (index: number, status: StepStatus) => {
    setStepStatuses(prev => { const n = [...prev]; n[index] = status; return n; });
  };

  const simulateStep = useCallback(async (step: number) => {
    if (!activeScenario) return;
    const scenario = scenarios.find(s => s.id === activeScenario);
    if (!scenario) return;

    if (step === 0) { // Enroll
      updateStep(0, 'active');
      setPhase('enrolling');
      try { await axios.post(`${BACKEND_URL}/enroll/${userId}`); } catch {}
      await new Promise(r => setTimeout(r, 1500));
      setScore(91); setPhase('idle');
      updateStep(0, 'done'); updateStep(1, 'ready');
    } else if (step === 1) { // SIM Swap
      updateStep(1, 'active');
      try { await axios.post(`${BACKEND_URL}/sim-swap/trigger?user_id=${userId}`); } catch {}
      await new Promise(r => setTimeout(r, 2000));
      updateStep(1, 'done'); updateStep(2, 'ready');
    } else if (step === 2) { // Attack
      updateStep(2, 'active');
      setPhase('attacking');
      let finalScore = scenario.expected_score;
      let finalAction = scenario.expected_action;
      
      try {
        const res = await axios.post<ScenarioRunResponse>(`${BACKEND_URL}/scenarios/${scenario.id}/run?user_id=${userId}`);
        finalScore = res.data.final_score;
        finalAction = res.data.action;
      } catch {}

      const isAttack = finalScore < 70;
      const totalAnomalies = isAttack ? 6 : 0;
      
      for (let i = 1; i <= 5; i++) {
        setAnomalyCount(Math.round((i/5) * totalAnomalies));
        setScore(Math.round(finalScore + ((91 - finalScore) * (5 - i)) / 5));
        await new Promise(r => setTimeout(r, 600));
      }

      setScore(finalScore);
      setAnomalyCount(totalAnomalies);
      setPhase(finalScore < 45 ? 'blocked' : 'allowed');

      setResults(prev => [...prev, {
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        score: finalScore,
        detected: isAttack,
        time: `${scenario.detection_time_s || 1.1}s`,
        result: finalAction,
      }]);

      updateStep(2, 'done'); updateStep(3, 'ready');
    } else if (step === 3) { // Legacy
      updateStep(3, 'active');
      await new Promise(r => setTimeout(r, 500));
      setShowLegacy(true);
      updateStep(3, 'done');
    }
  }, [activeScenario, scenarios]);

  const handleReset = () => {
    clearInterval(timerRef.current);
    try { axios.post(`${BACKEND_URL}/sim-swap/clear?user_id=${userId}`); } catch {}
    setStepStatuses(['ready', 'pending', 'pending', 'pending']);
    setPhase('idle'); setScore(null); setAnomalyCount(0); setShowLegacy(false);
  };

  const steps = [
    { title: '1. Enroll Baseline', desc: 'Train ocSVM on 10 valid sessions', icon: UserCheck, color: '#3B82F6' },
    { title: '2. SIM Swap (Optional)', desc: 'Trigger external telecom alert', icon: Zap, color: '#EF4444' },
    { title: '3. Run Scenario', desc: 'Execute 55-feature behavioral payload', icon: Play, color: '#F59E0B' },
    { title: '4. Compare Legacy', desc: 'Analyze rule-based vs SHIELD', icon: Search, color: '#8B5CF6' }
  ];

  return (
    <div style={{ background: '#09090B', color: '#FAFAFA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <header style={{ padding: '16px 24px', borderBottom: '1px solid #1E2D4A', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(9,9,11,0.8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,255,136,0.2)', color: '#00FF88', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>S</div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)' }}>Attack Simulation Control Panel</h1>
            <div style={{ fontSize: 10, color: '#71717A', fontFamily: 'var(--font-mono)' }}>SHIELD v2 — Live Operations Simulator</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00FF88', animation: 'shield-pulse 2s ease infinite' }} />
          <span style={{ fontSize: 12, color: '#71717A', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>LIVE_ENV</span>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: 320, borderRight: '1px solid #1E2D4A', padding: 24, overflowY: 'auto' }}>
          <label style={{ fontSize: 10, fontWeight: 800, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, display: 'block' }}>Target Scenario</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
            {scenarios.map(s => (
              <button key={s.id} onClick={() => { setActiveScenario(s.id); handleReset(); }} style={{ textAlign: 'left', padding: 12, borderRadius: 8, background: activeScenario === s.id ? 'rgba(0,255,136,0.1)' : 'transparent', border: `1px solid ${activeScenario === s.id ? '#00FF88' : '#1E2D4A'}`, color: activeScenario === s.id ? '#00FF88' : '#A1A1AA', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{s.name}</div>
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>{s.description.slice(0, 40)}...</div>
              </button>
            ))}
          </div>

          <label style={{ fontSize: 10, fontWeight: 800, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, display: 'block' }}>Execution Flow</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {steps.map((s, i) => {
              const status = stepStatuses[i];
              const disabled = status === 'pending' || !activeScenario;
              return (
                <button key={i} onClick={() => simulateStep(i)} disabled={disabled} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8, background: status === 'active' ? 'rgba(255,255,255,0.1)' : 'transparent', border: `1px solid ${status === 'active' ? s.color : '#1E2D4A'}`, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, textAlign: 'left', transition: 'all 0.2s' }}>
                  <div style={{ background: `rgba(${status === 'done' ? '0,255,136' : '255,255,255'}, 0.1)`, padding: 6, borderRadius: 6 }}>
                    {status === 'done' ? <CheckCircle size={16} color="#00FF88" /> : <s.icon size={16} color={s.color} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: status === 'done' ? '#00FF88' : '#FAFAFA' }}>{s.title}</div>
                    <div style={{ fontSize: 10, color: '#71717A' }}>{s.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <button onClick={handleReset} style={{ marginTop: 24, width: '100%', padding: 12, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            <RefreshCcw size={14} /> Reset State
          </button>
        </div>

        {/* Main Area */}
        <div style={{ flex: 1, padding: 32, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00FF88' }} />
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#00FF88', letterSpacing: '0.2em' }}>LIVE SCENARIO OUTPUT</span>
            <span style={{ fontSize: 11, color: '#71717A', marginLeft: 8 }}>— {scenarios.find(s=>s.id===activeScenario)?.name || 'Select a scenario'}</span>
          </div>

          <OrbVisualization score={score} phase={phase} anomalyCount={anomalyCount} />

          {/* Legacy Contrast */}
          {showLegacy && (
            <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
              <div style={{ flex: 1, padding: 24, borderRadius: 16, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <h3 style={{ fontSize: 12, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Legacy Rule-Based System</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ background: 'rgba(34,197,94,0.1)', padding: 8, borderRadius: 8 }}><CheckCircle size={20} color="#22C55E" /></div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#22C55E' }}>APPROVED</div>
                    <div style={{ fontSize: 11, color: '#71717A' }}>OTP matched. Device unchecked.</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#EF4444', fontWeight: 700 }}>Result: Account Compromised (False Negative)</div>
              </div>
              <div style={{ flex: 1, padding: 24, borderRadius: 16, background: `rgba(${score && score < 45 ? '239,68,68' : '34,197,94'}, 0.05)`, border: `1px solid rgba(${score && score < 45 ? '239,68,68' : '34,197,94'}, 0.3)` }}>
                <h3 style={{ fontSize: 12, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>S.H.I.E.L.D (ocSVM + Context)</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ background: `rgba(${score && score < 45 ? '239,68,68' : '34,197,94'}, 0.1)`, padding: 8, borderRadius: 8 }}>{score && score < 45 ? <ShieldAlert size={20} color="#EF4444" /> : <Shield size={20} color="#22C55E" />}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: score && score < 45 ? '#EF4444' : '#22C55E' }}>{score && score < 45 ? 'BLOCKED & FROZEN' : 'SAFE & ALLOWED'}</div>
                    <div style={{ fontSize: 11, color: '#71717A' }}>Score: {score} • Anomalies: {anomalyCount}</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#00FF88', fontWeight: 700 }}>Result: {score && score < 45 ? 'Action Prevented (True Positive)' : 'Legitimate Transaction Allowed'}</div>
              </div>
            </div>
          )}

          {/* Results Table */}
          {results.length > 0 && (
            <div style={{ background: '#111113', border: '1px solid #1E2D4A', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px 20px', borderBottom: '1px solid #1E2D4A', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>Simulation Ledger</div>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead style={{ fontSize: 11, color: '#71717A', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '12px 20px', borderBottom: '1px solid #1E2D4A' }}>Scenario</th>
                    <th style={{ padding: '12px 20px', borderBottom: '1px solid #1E2D4A' }}>Score</th>
                    <th style={{ padding: '12px 20px', borderBottom: '1px solid #1E2D4A' }}>Action</th>
                    <th style={{ padding: '12px 20px', borderBottom: '1px solid #1E2D4A' }}>Latency</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>
                  {results.map((r, i) => (
                    <tr key={i}>
                      <td style={{ padding: '16px 20px', borderBottom: '1px solid #1E2D4A', color: '#FAFAFA' }}>{r.scenarioName}</td>
                      <td style={{ padding: '16px 20px', borderBottom: '1px solid #1E2D4A', color: r.score < 45 ? '#EF4444' : '#22C55E', fontWeight: 700 }}>{r.score}</td>
                      <td style={{ padding: '16px 20px', borderBottom: '1px solid #1E2D4A' }}>
                        <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 11, background: r.score < 45 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: r.score < 45 ? '#EF4444' : '#22C55E', fontWeight: 700 }}>{r.result}</span>
                      </td>
                      <td style={{ padding: '16px 20px', borderBottom: '1px solid #1E2D4A', color: '#71717A' }}>{r.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
