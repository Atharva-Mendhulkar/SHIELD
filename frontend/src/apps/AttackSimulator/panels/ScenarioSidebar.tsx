import React from 'react';

interface ComponentProps {
  scenarioId?: number;
  scoreProgression?: number[];
  isRunning?: boolean;
  selectedScenario?: number | null;
  onScenarioSelect?: (id: number) => void;
  onRun?: () => void;
  sessionId?: string;
  result?: any;
}

export const ScenarioSidebar: React.FC<ComponentProps> = (props) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <h3 className="text-lg font-bold text-slate-100">ScenarioSidebar</h3>
      <p className="text-slate-400 text-sm mt-2">Component loaded successfully</p>
    </div>
  );
};

export default ScenarioSidebar;
