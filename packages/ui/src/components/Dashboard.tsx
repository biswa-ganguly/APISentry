import React from 'react';
import { AnalysisResult } from '@apisentry/types';
import { Header } from './Header';
import { MetricsGrid } from './MetricsGrid';
import { EndpointList } from './EndpointList';
import { IssueCard } from './IssueCard';

export interface DashboardProps {
  result: AnalysisResult | null;
  logoBase64?: string;
  selectedPreset: string;
  onPresetChange: (preset: string) => void;
  onScan: () => void;
  isScanning?: boolean;
  onOpenFile?: (filePath: string, line: number, column: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  result,
  logoBase64,
  selectedPreset,
  onPresetChange,
  onScan,
  isScanning = false,
  onOpenFile
}) => {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-gray-900/50 rounded-2xl border border-white/10 m-6">
        <div className="text-4xl mb-3">🛡️</div>
        <h2 className="text-2xl font-extrabold text-white mb-2">APISentry Dashboard</h2>
        <p className="text-sm text-gray-400 max-w-md mb-6">Analyze your workspace to catch breaking API contract mismatches between frontend calls and backend Express handlers.</p>
        <button
          onClick={onScan}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm px-6 py-3 rounded-lg shadow-lg hover:shadow-cyan-500/30 transition-all"
        >
          Start Workspace Scan
        </button>
      </div>
    );
  }

  const errorsCount = result.issues.filter(i => i.severity === 'error').length;
  const warningsCount = result.issues.filter(i => i.severity === 'warning').length;

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        logoBase64={logoBase64}
        selectedPreset={selectedPreset}
        onPresetChange={onPresetChange}
        onScan={onScan}
        isScanning={isScanning}
      />

      <main className="flex-1 max-w-[1400px] w-full mx-auto p-6 md:p-8 flex flex-col gap-6">
        <MetricsGrid
          metrics={result.metrics}
          errorsCount={errorsCount}
          warningsCount={warningsCount}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
          <EndpointList
            consumers={result.consumers}
            providers={result.providers}
          />

          <div className="bg-gray-900/70 border border-white/10 rounded-xl p-5 backdrop-blur-md flex flex-col gap-4">
            <div className="flex items-center justify-between font-extrabold text-base">
              <span>Contract Issues & Correct Schemas</span>
              <span className="text-xs font-semibold text-gray-400">{result.issues.length} issues</span>
            </div>

            {result.issues.length === 0 ? (
              <div className="py-16 text-center text-emerald-400 flex flex-col items-center">
                <div className="text-5xl mb-3">🎉</div>
                <h3 className="text-xl font-extrabold text-white">All API contracts match perfectly!</h3>
                <p className="text-sm text-gray-400 mt-1">No breaking changes detected between frontend callers and backend endpoints.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {result.issues.map((issue, idx) => (
                  <IssueCard key={idx} issue={issue} onOpenFile={onOpenFile} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
