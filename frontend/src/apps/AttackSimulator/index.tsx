import React, { useState } from 'react';
import { ScenarioSidebar } from './panels/ScenarioSidebar';
import { OrbVisualization } from './panels/OrbVisualization';
import { DetectionTable } from './panels/DetectionTable';
import { FeatureInspector } from './panels/FeatureInspector';
import { LegacyContrast } from './panels/LegacyContrast';

interface AttackSimulatorProps {
  userId?: string;
}

export const AttackSimulator: React.FC<AttackSimulatorProps> = ({ userId = '1' }) => {
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [detectionResults, setDetectionResults] = useState<any>(null);

  const handleScenarioSelect = (scenarioId: number) => {
    setSelectedScenario(scenarioId);
    setDetectionResults(null);
  };

  const handleRunScenario = async () => {
    if (!selectedScenario) return;

    setIsRunning(true);
    try {
      // This will be connected to the backend API
      // For now, simulate the API call
      // const response = await fetch(`/api/scenarios/${selectedScenario}/run`, {
      //   method: 'POST',
      //   body: JSON.stringify({ user_id: userId }),
      // });
      // const data = await response.json();
      // setDetectionResults(data);

      // Temporary mock
      setDetectionResults({
        scenario_id: selectedScenario,
        score_progression: [91, 74, 58, 44, 27],
        final_score: 27,
        action: 'BLOCK_AND_FREEZE',
        detection_time_s: 28,
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-emerald-500">Attack Simulator</h1>
          <p className="text-slate-400 mt-2">Demo mode: Test behavioral detection against known attack patterns</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Scenario Sidebar */}
          <div className="lg:col-span-1">
            <ScenarioSidebar
              selectedScenario={selectedScenario}
              onScenarioSelect={handleScenarioSelect}
              onRun={handleRunScenario}
              isRunning={isRunning}
            />
          </div>

          {/* Main Visualization */}
          <div className="lg:col-span-3">
            {selectedScenario && (
              <div className="space-y-6">
                <OrbVisualization
                  scenarioId={selectedScenario}
                  scoreProgression={detectionResults?.score_progression || [91]}
                  isRunning={isRunning}
                />

                {detectionResults && (
                  <>
                    <DetectionTable result={detectionResults} />
                    <LegacyContrast result={detectionResults} />
                  </>
                )}
              </div>
            )}

            {!selectedScenario && (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
                <p className="text-slate-400">Select a scenario to begin.</p>
              </div>
            )}
          </div>
        </div>

        {/* Feature Inspector - Full Width */}
        {detectionResults && (
          <div className="mt-6">
            <FeatureInspector sessionId={`scenario_${selectedScenario}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AttackSimulator;
