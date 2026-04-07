import React from 'react';
import { Shield } from 'lucide-react';

export const OTPScreen: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 space-y-8">
      <div className="text-center space-y-4">
        <div className="bg-amber-500/10 p-4 rounded-full inline-block">
          <Shield className="text-amber-500 w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold">OTP Verification</h2>
        <p className="text-slate-400 text-sm">Enter the 6-digit code sent to your registered mobile</p>
      </div>

      <div className="flex space-x-2 justify-center">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="w-10 h-12 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-xl font-bold animate-pulse">_</div>
        ))}
      </div>

      <div className="text-amber-500 text-[10px] font-bold uppercase animate-pulse">
        Security scan in progress...
      </div>
    </div>
  );
};

export default OTPScreen;
