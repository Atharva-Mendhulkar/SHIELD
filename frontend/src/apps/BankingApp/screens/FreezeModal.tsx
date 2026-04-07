import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface FreezModalProps {
  onLogout?: () => void;
}

export const FreezeModal: React.FC<FreezModalProps> = ({ onLogout }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
        <AlertTriangle className="text-red-500 w-16 h-16 relative" />
      </div>
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Transaction Frozen</h2>
        <p className="text-slate-400 text-sm">Suspicious activity detected. We've sent you an alert.</p>
      </div>
      <div className="bg-red-950/30 text-red-500 px-6 py-3 rounded-lg border border-red-500/30 font-bold text-center w-full">
        🔒 ACCOUNT FROZEN
      </div>
      <p className="text-slate-500 text-sm">Call 1800-XXX-XXXX to verify your identity.</p>
      <button onClick={onLogout} className="mt-4 px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold transition-colors">
        Return to Login
      </button>
    </div>
  );
};

export default FreezeModal;
