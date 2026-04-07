import { useState, useEffect } from 'react';
import axios from 'axios';
import { useBehaviorSDK } from '../../hooks/useBehaviorSDK';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

type Screen = 'login' | 'dashboard' | 'transfer' | 'otp';
type ShieldStatus = 'safe' | 'checking' | 'frozen';

/* ─── Shield Badge ─── */
function ShieldBadge({ status }: { status: ShieldStatus }) {
  const cls = `shield-badge shield-badge--${status}`;
  const label = status === 'safe' ? 'Protected' : status === 'checking' ? 'Scanning...' : 'FROZEN';
  return (
    <div className={cls}>
      <span className={`shield-dot shield-dot--${status}`} />
      {label}
    </div>
  );
}

/* ─── Freeze Modal ─── */
function FreezeModal() {
  return (
    <div className="freeze-overlay">
      <div style={{ background: 'rgba(239,68,68,0.15)', padding: 6, borderRadius: 9999 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#EF4444' }}>warning</span>
        <span style={{ fontSize: 10, fontWeight: 800, color: '#EF4444', letterSpacing: '0.1em' }}>FROZEN</span>
      </div>
      <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 9999, padding: 24, border: '2px solid rgba(239,68,68,0.3)' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 56, color: '#EF4444' }}>lock</span>
      </div>
      <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', margin: 0 }}>
        Transaction Frozen
      </h1>
      <p style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', maxWidth: 260, lineHeight: 1.6, margin: 0 }}>
        Suspicious behavioral patterns detected. Your account has been temporarily restricted by S.H.I.E.L.D.
      </p>
      <p style={{ color: '#EF4444', fontSize: 11, fontWeight: 700, margin: 0 }}>
        SMS alert sent to registered number
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#CBD5E1', fontSize: 13, marginTop: 8 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>call</span>
        Call 1800-SHIELD
      </div>
    </div>
  );
}

/* ─── Login Screen ─── */
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [loading, setLoading] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 800);
  };
  return (
    <div className="banking-screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 28px 40px', minHeight: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 40 }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #0040df, #8f98fe)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'white' }}>shield</span>
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: '#0040df' }}>S.H.I.E.L.D</span>
        <span style={{ fontSize: 10, color: '#64748B', textAlign: 'center', maxWidth: 200 }}>Secure Banking Portal</span>
      </div>
      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, display: 'block' }}>Customer ID</label>
          <input type="text" defaultValue="ATHARVA01" style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1.5px solid #E2E8F0', background: 'white', fontSize: 14, fontWeight: 600, color: '#1E293B', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, display: 'block' }}>Password</label>
          <input type="password" defaultValue="password123" style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1.5px solid #E2E8F0', background: 'white', fontSize: 14, fontWeight: 600, color: '#1E293B', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <button type="submit" disabled={loading} style={{ marginTop: 8, width: '100%', padding: '16px', borderRadius: 14, background: 'linear-gradient(135deg, #0040df, #2d5bff)', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', boxShadow: '0 8px 24px rgba(0,64,223,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>lock</span>
          {loading ? 'Authenticating...' : 'Sign In Securely'}
        </button>
      </form>
      <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 6, color: '#94A3B8', fontSize: 10 }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E' }} />
        Protected by SHIELD Behavioral Biometrics
      </div>
    </div>
  );
}

/* ─── Dashboard Screen ─── */
function DashboardScreen({ onTransfer }: { onTransfer: () => void }) {
  return (
    <div className="banking-screen" style={{ padding: '72px 20px 100px', minHeight: '100%' }}>
      {/* Balance Card */}
      <div className="banking-gradient-card" style={{ padding: '28px 24px', borderRadius: 20, color: 'white', position: 'relative', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.7, margin: 0 }}>Available Balance</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, margin: '6px 0 0', letterSpacing: '-0.02em' }}>₹3,42,580<span style={{ fontSize: 18, fontWeight: 400, opacity: 0.6 }}>.00</span></h2>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 10, backdropFilter: 'blur(8px)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 26 }}>account_balance_wallet</span>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>
              <span>Daily Limit</span><span>82% Used</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '82%', background: 'white', borderRadius: 99, boxShadow: '0 0 12px rgba(255,255,255,0.4)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {[
          { icon: 'swap_horiz', label: 'Transfer', primary: true, onClick: onTransfer },
          { icon: 'history', label: 'History' },
          { icon: 'person', label: 'Profile' },
        ].map((a, i) => (
          <button key={i} onClick={a.onClick} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 8px', borderRadius: 16, border: 'none', cursor: 'pointer', background: a.primary ? 'rgba(0,64,223,0.08)' : '#f1f5f9', color: a.primary ? '#0040df' : '#64748B', transition: 'transform 0.2s' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{a.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 700 }}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>Recent Activity</span>
          <span style={{ fontSize: 11, color: '#0040df', fontWeight: 600 }}>View All</span>
        </div>
        {[
          { desc: 'Swiggy Food', amt: '-₹450', color: '#EF4444', icon: 'restaurant' },
          { desc: 'Salary Credit', amt: '+₹85,000', color: '#22C55E', icon: 'payments' },
          { desc: 'Netflix', amt: '-₹799', color: '#EF4444', icon: 'subscriptions' },
        ].map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'white', borderRadius: 14, marginBottom: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#64748B' }}>{t.icon}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{t.desc}</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: t.color }}>{t.amt}</span>
          </div>
        ))}
      </div>

      {/* Bottom Nav */}
      <nav style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #E2E8F0', padding: '10px 24px 20px', display: 'flex', justifyContent: 'space-around' }}>
        {[
          { icon: 'account_balance', active: true },
          { icon: 'shield' },
          { icon: 'swap_horiz' },
          { icon: 'history' },
        ].map((n, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8, borderRadius: 12, background: n.active ? 'rgba(0,64,223,0.1)' : 'transparent', color: n.active ? '#0040df' : '#94A3B8', transition: 'all 0.2s' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{n.icon}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}

/* ─── Transfer Screen ─── */
function TransferScreen({ onBack, onReview }: { onBack: () => void; onReview: () => void }) {
  const [beneficiary, setBeneficiary] = useState('');
  const [amount, setAmount] = useState('');

  const recipients = [
    { name: 'Priya', color: '#8B5CF6', initials: 'PS' },
    { name: 'Rahul', color: '#3B82F6', initials: 'RM' },
    { name: 'Anjali', color: '#EC4899', initials: 'AK' },
    { name: 'Vikram', color: '#10B981', initials: 'VT' },
  ];

  return (
    <div className="banking-screen" style={{ padding: '12px 20px 40px', minHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#64748B' }}>arrow_back</span>
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, margin: 0, color: '#1E293B' }}>Send Money</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onReview(); }} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, display: 'block' }}>Recipient</label>
          <div style={{ position: 'relative' }}>
            <input type="text" value={beneficiary} onChange={e => setBeneficiary(e.target.value)} placeholder="Name or UPI ID" style={{ width: '100%', padding: '16px 48px 16px 16px', borderRadius: 14, border: 'none', background: 'white', fontSize: 14, fontWeight: 600, color: '#1E293B', outline: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', boxSizing: 'border-box' }} />
            <span className="material-symbols-outlined" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 20, color: '#94A3B8' }}>verified_user</span>
          </div>
        </div>

        <div>
          <label style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, display: 'block' }}>Amount</label>
          <div style={{ position: 'relative' }}>
            <input type="text" value={amount} onChange={e => setAmount(e.target.value)} placeholder="₹ 0.00" style={{ width: '100%', padding: '20px 80px 20px 16px', borderRadius: 14, border: 'none', background: 'white', fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)', color: '#0040df', outline: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', boxSizing: 'border-box' }} />
            <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,64,223,0.08)', padding: '4px 10px', borderRadius: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#0040df' }}>INR</span>
            </div>
          </div>
        </div>

        {/* Recent Recipients */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Recent Recipients</p>
          <div style={{ display: 'flex', gap: 14, overflowX: 'auto' }} className="no-scrollbar">
            <button type="button" style={{ width: 52, height: 52, borderRadius: '50%', border: '2px dashed #CBD5E1', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#94A3B8' }}>add</span>
            </button>
            {recipients.map((r, i) => (
              <button key={i} type="button" onClick={() => setBeneficiary(r.name)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>{r.initials}</div>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#64748B' }}>{r.name}</span>
              </button>
            ))}
          </div>
        </div>

        <button type="submit" style={{ marginTop: 12, width: '100%', padding: '18px', borderRadius: 16, background: 'linear-gradient(135deg, #0040df, #2d5bff)', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', boxShadow: '0 8px 24px rgba(0,64,223,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>security</span>
          Review Secure Transfer
        </button>
      </form>
    </div>
  );
}

/* ─── OTP Screen ─── */
function OTPScreen({ onBack, onConfirm }: { onBack: () => void; onConfirm: () => void }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(28);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timeLeft]);

  const handleChange = (i: number, v: string) => {
    if (v.length > 1) return;
    const n = [...otp]; n[i] = v; setOtp(n);
    if (v && i < 5) {
      const next = document.getElementById(`otp-${i + 1}`) as HTMLInputElement;
      next?.focus();
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      const prev = document.getElementById(`otp-${i - 1}`) as HTMLInputElement;
      prev?.focus();
    }
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onConfirm(); }, 1500);
  };

  const circumference = 2 * Math.PI * 32;
  const offset = circumference * (1 - timeLeft / 28);

  return (
    <div className="banking-screen" style={{ padding: '12px 20px 40px', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <button onClick={onBack} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#64748B' }}>arrow_back</span>
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, margin: 0, color: '#1E293B' }}>Verify Transaction</h1>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, margin: 0 }}>Enter the 6-digit OTP sent to<br /><strong style={{ color: '#1E293B' }}>+91 ****6789</strong></p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
        {otp.map((d, i) => (
          <input key={i} id={`otp-${i}`} className="otp-input" type="text" inputMode="numeric" maxLength={1} value={d} onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)} />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 32 }}>
        <div style={{ position: 'relative', width: 72, height: 72 }}>
          <svg width={72} height={72} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={36} cy={36} r={32} fill="none" stroke="#E2E8F0" strokeWidth={3} />
            <circle cx={36} cy={36} r={32} fill="none" stroke={timeLeft > 10 ? '#0040df' : '#EF4444'} strokeWidth={3} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-mono)', color: timeLeft > 10 ? '#1E293B' : '#EF4444' }}>
            0:{timeLeft.toString().padStart(2, '0')}
          </span>
        </div>
        <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>Expires in</span>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={handleSubmit} disabled={otp.some(d => !d) || loading} style={{ width: '100%', padding: '16px', borderRadius: 14, background: otp.some(d => !d) ? '#CBD5E1' : 'linear-gradient(135deg, #0040df, #2d5bff)', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: otp.some(d => !d) ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-display)' }}>
          {loading ? 'Verifying...' : 'Confirm Payment'}
        </button>
        <button onClick={() => { setTimeLeft(28); setOtp(['', '', '', '', '', '']); }} disabled={timeLeft > 0} style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'transparent', color: timeLeft > 0 ? '#CBD5E1' : '#0040df', fontWeight: 600, fontSize: 13, border: 'none', cursor: timeLeft > 0 ? 'not-allowed' : 'pointer' }}>
          Resend OTP
        </button>
      </div>
    </div>
  );
}

/* ─── Main Banking App ─── */
export default function BankingApp() {
  const [screen, setScreen] = useState<Screen>('login');
  const [shieldStatus, setShieldStatus] = useState<ShieldStatus>('safe');
  const [isFrozen, setIsFrozen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const userId = 1;

  const sdk = useBehaviorSDK(userId, sessionId);

  // Listen to SDK score for freeze
  useEffect(() => {
    if (sdk.currentScore !== null && sdk.currentScore < 30 && sdk.action === 'BLOCK_AND_FREEZE') {
      setShieldStatus('frozen');
      setIsFrozen(true);
    } else if (sdk.currentScore !== null && sdk.currentScore < 50) {
      setShieldStatus('checking');
    }
  }, [sdk.currentScore, sdk.action]);

  // Also poll score endpoint independently
  useEffect(() => {
    if (!sessionId) return;
    const iv = setInterval(async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/score/${sessionId}`);
        if (res.data.action === 'BLOCK_AND_FREEZE') {
          setShieldStatus('frozen');
          setIsFrozen(true);
        }
      } catch { /* API might not be up */ }
    }, 3000);
    return () => clearInterval(iv);
  }, [sessionId]);

  const handleLogin = async () => {
    setShieldStatus('checking');
    try {
      const res = await axios.post(`${BACKEND_URL}/session/start`, {
        user_id: userId,
        session_type: 'legitimate',
        device_class: sdk.deviceClass,
        device_fingerprint: sdk.deviceFingerprint,
      });
      setSessionId(res.data.session_id);
    } catch { /* continue demo */ }
    setTimeout(() => { setShieldStatus('safe'); setScreen('dashboard'); }, 500);
  };

  const handleTransfer = () => setScreen('transfer');
  const handleReview = () => { setShieldStatus('checking'); setTimeout(() => { setShieldStatus('safe'); setScreen('otp'); }, 300); };
  const handleConfirm = () => {
    setShieldStatus('checking');
    setTimeout(() => {
      if (isFrozen) return; // freeze modal already showing
      setShieldStatus('safe');
      setScreen('dashboard');
    }, 1500);
  };

  return (
    <div className="phone-frame">
      <div className="phone-frame-inner" style={{ position: 'relative' }}>
        {screen !== 'login' && <ShieldBadge status={shieldStatus} />}

        {screen === 'login' && <LoginScreen onLogin={handleLogin} />}
        {screen === 'dashboard' && <DashboardScreen onTransfer={handleTransfer} />}
        {screen === 'transfer' && <TransferScreen onBack={() => setScreen('dashboard')} onReview={handleReview} />}
        {screen === 'otp' && <OTPScreen onBack={() => setScreen('transfer')} onConfirm={handleConfirm} />}

        {isFrozen && <FreezeModal />}
      </div>
    </div>
  );
}
