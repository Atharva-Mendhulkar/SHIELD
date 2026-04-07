import React, { useState } from 'react';

interface TransferScreenProps {
  onBack: () => void;
  onConfirm: () => void;
}

export const TransferScreen: React.FC<TransferScreenProps> = ({ onBack, onConfirm }) => {
  const [amount, setAmount] = useState('15000');

  return (
    <div className="h-full flex flex-col p-8 space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={onBack} className="p-2 bg-slate-900 rounded-lg text-slate-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-2xl font-bold uppercase">Secure Transfer</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onConfirm(); }} className="space-y-6 flex-1">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Recipient Account</label>
          <input type="text" placeholder="Julian Smith (Verified)" className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl focus:outline-none focus:border-amber-500/50" value="JULIAN SMITH" />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Amount</label>
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-bold text-amber-500">INR</span>
            <input type="number" placeholder="0.00" className="w-full bg-slate-900 border border-slate-800 p-6 pl-16 rounded-2xl text-2xl font-bold focus:outline-none focus:border-amber-500/50" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
        </div>

        <button type="submit" className="w-full bg-amber-500 py-4 rounded-2xl text-slate-950 font-bold uppercase tracking-widest hover:scale-[1.02] transition-all">
          Confirm & Send
        </button>
      </form>
    </div>
  );
};

export default TransferScreen;
