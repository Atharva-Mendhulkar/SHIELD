import React from 'react';

interface ComponentProps {
  sessionId?: string;
  userId?: string;
}

export const AlertFeed: React.FC<ComponentProps> = ({ sessionId, userId }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <h3 className="text-lg font-bold text-slate-100">AlertFeed</h3>
      <p className="text-slate-400 text-sm mt-2">Session: {sessionId || 'None'} | User: {userId || 'None'}</p>
    </div>
  );
};

export default AlertFeed;
