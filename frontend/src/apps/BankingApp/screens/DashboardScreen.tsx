import React, { useState } from 'react';
import { CreditCard, Send, Eye } from 'lucide-react';

interface DashboardScreenProps {
  onTransfer: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onTransfer }) => {
  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto">
      <div>
        <h1 className="text-xl font-bold">Good morning</h1>
        <p className="text-slate-400 text-sm mt-1">John Kumar</p>
      </div>

      <div className="relative group" style={{ animation: 'glow-effect 3s ease-in-out infinite' }}>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-amber-500 uppercase">Main Account</p>
              <h2 className="text-2xl font-bold mt-1">INR3,42,580</h2>
            </div>
            <CreditCard className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex space-x-2">
            <button onClick={onTransfer} className="flex-1 bg-amber-500 py-2 rounded-lg text-slate-950 font-bold text-xs hover:scale-[1.02] transition-all">Transfer</button>
            <button className="flex-1 bg-slate-800 py-2 rounded-lg text-slate-100 font-bold text-xs hover:bg-slate-700">Details</button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase">Recent Activity</h3>
        {[
          { desc: 'Swiggy Food', amt: '-INR450' },
          { desc: 'Salary Credit', amt: '+INR85,000' },
        ].map((t, i) => (
          <div key={i} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
            <span className="text-sm">{t.desc}</span>
            <span className="text-sm font-bold">{t.amt}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardScreen;
