import React, { useState } from 'react';
import { Shield, Lock, CreditCard, Send, CheckCircle, AlertTriangle, Home, Activity, Clock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BankingAppProps {
  onTransactionStart: () => void;
  isAccountFrozen: boolean;
  onLogout: () => void;
}

export const BankingApp: React.FC<BankingAppProps> = ({ 
  onTransactionStart, 
  isAccountFrozen, 
  onLogout 
}) => {
  const [activeScreen, setActiveScreen] = useState<'LOGIN' | 'DASHBOARD' | 'TRANSFER' | 'OTP' | 'SUCCESS' | 'FAILURE'>('LOGIN');
  const [amount, setAmount] = useState('15000');
  const [beneficiary, setBeneficiary] = useState('Rajesh Sharma');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveScreen('DASHBOARD');
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    onTransactionStart();
    setActiveScreen('OTP');
    
    // Simulate OTP success after 3 seconds for demo
    setTimeout(() => {
      if (isAccountFrozen) {
        setActiveScreen('FAILURE');
      } else {
        setActiveScreen('SUCCESS');
      }
    }, 4000);
  };

  if (isAccountFrozen) {
    return (
      <div className="bg-slate-950 text-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-red-500/50 flex flex-col items-center justify-center space-y-4" style={{backgroundImage: 'linear-gradient(135deg, rgba(127, 29, 29, 0.1) 0%, rgba(15, 23, 42, 0.95) 100%)'}}>
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
          <AlertTriangle className="text-red-500 w-16 h-16 relative" />
        </div>
        <h2 className="text-2xl font-bold text-center">Transaction Blocked</h2>
        <p className="text-slate-400 text-center text-sm">
          Unusual behavioral patterns detected. Your account has been temporarily frozen for security.
        </p>
        <div className="bg-red-950/30 text-red-500 px-4 py-2 rounded-lg text-sm border border-red-500/30 font-bold">
          🔒 ACCOUNT FROZEN
        </div>
        <button
          onClick={onLogout}
          className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-white rounded-3xl shadow-2xl w-full max-w-md h-[720px] flex flex-col overflow-hidden relative" style={{border: '1px solid rgba(255, 255, 255, 0.1)', backgroundImage: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)'}}>
      {/* Header with Glass Effect */}
      <div className="backdrop-blur-md px-6 py-4 flex justify-between items-center border-b" style={{borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(15, 23, 42, 0.8)'}}>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-extrabold text-slate-950">IB</div>
          <span className="font-display font-bold text-lg tracking-tight">INDRA BANK</span>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 shield-active">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></div>
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">BehaviorShield</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeScreen === 'LOGIN' && (
          <motion.form 
            key="login"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleLogin}
            className="p-8 space-y-6"
          >
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">Welcome Back</h1>
              <p className="text-slate-400">Secure entry to your personal banking.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Customer ID</label>
              <input 
                type="text" 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all" 
                placeholder="XXXX-XXXX"
                defaultValue="ATHARVA01"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <input 
                type="password" 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all" 
                placeholder="••••••••"
                defaultValue="password123"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center"
            >
              Sign In <Lock className="ml-2 w-4 h-4" />
            </button>
          </motion.form>
        )}

        {activeScreen === 'DASHBOARD' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 space-y-6 flex-1 overflow-y-auto pb-20"
          >
            <header>
              <h1 className="text-3xl font-display font-extrabold text-slate-100">Welcome, John Kumar</h1>
              <p className="text-slate-400 text-sm mt-1">Ac: 49XX XXXX XXXX 4521</p>
            </header>

            {/* Main Balance Card with Gradient and Glow */}
            <div className="relative group cursor-pointer" style={{animation: 'glow-effect 3s ease-in-out infinite'}}>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] mb-1">Available Balance</p>
                    <h2 className="text-4xl font-display font-extrabold tracking-tight">INR3,42,580.00</h2>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-2xl">
                    <CreditCard className="w-6 h-6 text-amber-500" />
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveScreen('TRANSFER')}
                    className="flex-1 bg-amber-500 py-3 rounded-xl text-slate-950 font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Transfer
                  </button>
                  <button className="flex-1 bg-slate-800 py-3 rounded-xl text-slate-100 font-bold text-sm hover:bg-slate-700 transition-all">Details</button>
                </div>
              </div>
            </div>

            {/* Behavioral Snapshot Grid */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1 text-center">Behavioral Snapshot</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-xl">📱</div>
                  <span className="text-[10px] font-bold text-slate-500">Device</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-xl">⌨️</div>
                  <span className="text-[10px] font-bold text-slate-500">Typing</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-xl">📍</div>
                  <span className="text-[10px] font-bold text-slate-500">Loc</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-xl">⚡</div>
                  <span className="text-[10px] font-bold text-slate-500">Action</span>
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {activeScreen === 'TRANSFER' && (
          <motion.form
            key="transfer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleTransfer}
            className="p-8 space-y-6 flex-1 overflow-y-auto pb-20"
          >
            <header className="flex items-center space-x-4">
              <button onClick={() => setActiveScreen('DASHBOARD')} type="button" className="p-2 bg-slate-900 rounded-lg text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
              </button>
              <h1 className="text-2xl font-display font-extrabold text-slate-100 uppercase tracking-tight">Secure Transfer</h1>
            </header>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Recipient Account</label>
                <input
                  type="text"
                  placeholder="Julian Smith (Verified)"
                  className="w-full bg-slate-900 border border-slate-800 p-5 rounded-2xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                  value="JULIAN SMITH"
                  onChange={(e) => setBeneficiary(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-display font-extrabold text-amber-500">INR</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-slate-900 border border-slate-800 p-8 pl-20 rounded-2xl text-4xl font-display font-extrabold text-slate-100 focus:outline-none focus:border-amber-500/50 transition-colors"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-slate-500 text-right italic mt-2">-- Daily Limit Remaining: INR1,42,850.00</p>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 py-6 rounded-2xl text-slate-950 font-display font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
                style={{boxShadow: '0 20px 25px -5px rgba(245, 158, 11, 0.1)'}}
              >
                Confirm & Send
              </button>
            </div>
          </motion.form>
        )}

        {activeScreen === 'OTP' && (
          <motion.div 
            key="otp"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 space-y-8 flex flex-col items-center justify-center flex-1"
          >
            <div className="text-center space-y-4">
              <div className="bg-amber-500/10 p-4 rounded-full inline-block">
                <Shield className="text-amber-500 w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold">OTP Verification</h2>
              <p className="text-slate-400 text-sm">Enter the 6-digit code sent to your registered mobile ending in •• 9102</p>
            </div>

            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="w-10 h-12 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-xl font-bold animate-pulse">
                   _
                </div>
              ))}
            </div>

            <div className="text-amber-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">
              Security scan in progress...
            </div>
          </motion.div>
        )}

        {activeScreen === 'SUCCESS' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 space-y-6 flex flex-col items-center justify-center flex-1"
          >
            <div className="w-24 h-24 bg-amber-500/10 border-4 border-amber-500 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="text-amber-500 w-12 h-12" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-display font-extrabold text-slate-100">[DONE] Transfer Success</h2>
              <p className="text-slate-500 mt-2">Transaction ID: SH-8E8DF0F1</p>
            </div>
            <button
              onClick={() => setActiveScreen('DASHBOARD')}
              className="mt-8 px-8 py-3 bg-slate-900 border border-slate-800 rounded-xl font-bold text-sm text-slate-400 hover:bg-slate-800 transition-all"
            >
              Back to Dashboard
            </button>
          </motion.div>
        )}

        {activeScreen === 'FAILURE' && (
          <motion.div 
            key="failure"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 space-y-6 flex flex-col items-center justify-center flex-1"
          >
            <div className="bg-red-500/20 p-6 rounded-full">
               <AlertTriangle className="text-red-500 w-16 h-16" />
            </div>
            <div className="text-center">
               <h2 className="text-2xl font-bold text-red-500">Transaction Failed</h2>
               <p className="text-slate-400 text-sm mt-2">Behavioral anomalies detected during sensitive operation.</p>
            </div>
            <button 
              onClick={() => setActiveScreen('DASHBOARD')}
              className="w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-bold transition-all"
            >
              Return Home
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
