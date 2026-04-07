import React, { useState } from 'react';
import { Lock } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 800);
  };

  return (
    <div className="h-full flex flex-col justify-center p-8 space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-slate-400 text-sm">Secure entry to your personal banking.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Customer ID</label>
          <input
            type="text"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            placeholder="XXXX-XXXX"
            defaultValue="ATHARVA01"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Password</label>
          <input
            type="password"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            placeholder="••••••••"
            defaultValue="password123"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-slate-950 font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center"
        >
          {isLoading ? 'Signing In...' : 'Sign In'} <Lock className="ml-2 w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default LoginScreen;
