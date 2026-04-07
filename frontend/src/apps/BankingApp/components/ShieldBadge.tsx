import React from 'react';
import { Shield } from 'lucide-react';

interface ShieldBadgeProps {
  status?: 'active' | 'warning' | 'blocked';
}

export const ShieldBadge: React.FC<ShieldBadgeProps> = ({ status = 'active' }) => {
  const statusConfig = {
    active: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-500', label: 'Protected' },
    warning: { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-500', label: 'Checking...' },
    blocked: { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-500', label: 'Frozen' },
  };

  const config = statusConfig[status];

  return (
    <div style={{animation: status === 'active' ? 'pulse-gold 3s infinite' : 'none'}} className={`absolute top-4 right-4 z-10 flex items-center space-x-2 px-3 py-1 rounded-full border ${config.bg} ${config.border}`}>
      {status === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>}
      {status === 'blocked' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>}
      <Shield className={`w-3 h-3 ${config.text}`} />
      <span className={`text-[10px] font-bold uppercase tracking-widest ${config.text}`}>{config.label}</span>
    </div>
  );
};

export default ShieldBadge;
