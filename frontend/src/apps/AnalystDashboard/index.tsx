import React from 'react';
import { UserProfilePanel } from './panels/UserProfilePanel';
import { ScorePanel } from './panels/ScorePanel';
import { AlertFeed } from './panels/AlertFeed';
import { AnomalyList } from './panels/AnomalyList';
import { SessionTimeline } from './panels/SessionTimeline';
import { ShieldSidebar } from './panels/ShieldSidebar';

interface AnalystDashboardProps {
  sessionId?: string;
  userId?: string;
}

export const AnalystDashboard: React.FC<AnalystDashboardProps> = ({
  sessionId,
  userId = '1'
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-500">SHIELD Operations Center</h1>
          <p className="text-slate-400 mt-2">Real-time behavioral anomaly detection</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: User Profile */}
          <div className="lg:col-span-1">
            <UserProfilePanel userId={userId} />
          </div>

          {/* Center: Score Panel (main visualization) */}
          <div className="lg:col-span-2">
            <ScorePanel sessionId={sessionId} />
          </div>

          {/* Right: Alert Feed */}
          <div className="lg:col-span-1">
            <AlertFeed sessionId={sessionId} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Anomaly List */}
          <div className="lg:col-span-2">
            <AnomalyList sessionId={sessionId} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ShieldSidebar />
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-6">
          <SessionTimeline sessionId={sessionId} />
        </div>
      </div>
    </div>
  );
};

export default AnalystDashboard;
