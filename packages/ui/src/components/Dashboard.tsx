import React, { useState, useMemo } from 'react';
import { AnalysisResult } from '@apisentry/types';
import { Header } from './Header';
import { MetricsGrid } from './MetricsGrid';
import { EndpointList, SelectedEndpoint } from './EndpointList';
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
  const [selectedEndpoint, setSelectedEndpoint] = useState<SelectedEndpoint | null>(null);

  const displayedIssues = useMemo(() => {
    if (!result) return [];
    if (!selectedEndpoint) return result.issues;
    return result.issues.filter(issue => {
      const consumerMatch = issue.consumer && issue.consumer.path === selectedEndpoint.path;
      const providerMatch = issue.provider && issue.provider.path === selectedEndpoint.path;
      const messageMatch = issue.message.includes(selectedEndpoint.path);
      return consumerMatch || providerMatch || messageMatch;
    });
  }, [result, selectedEndpoint]);

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
    <div className="flex flex-col h-screen overflow-hidden">
      <Header
        logoBase64={logoBase64}
        selectedPreset={selectedPreset}
        onPresetChange={onPresetChange}
        onScan={onScan}
        isScanning={isScanning}
      />

      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 md:p-6 flex flex-col gap-5 min-h-0 overflow-hidden">
        <MetricsGrid
          metrics={result.metrics}
          errorsCount={errorsCount}
          warningsCount={warningsCount}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 flex-1 min-h-0 overflow-hidden">
          <EndpointList
            consumers={result.consumers}
            providers={result.providers}
            selectedEndpoint={selectedEndpoint}
            onSelectEndpoint={setSelectedEndpoint}
          />

          <div className="bg-gray-900/70 border border-white/10 rounded-xl p-5 backdrop-blur-md flex flex-col gap-4 min-w-0 h-full min-h-0 overflow-hidden">
            <div className="flex items-center justify-between font-extrabold text-base shrink-0">
              <span>Contract Issues & Correct Schemas</span>
              <div className="flex items-center gap-2">
                {selectedEndpoint && (
                  <button
                    onClick={() => setSelectedEndpoint(null)}
                    className="text-xs text-cyan-400 hover:text-cyan-200 underline font-normal cursor-pointer"
                  >
                    Show all ({result.issues.length})
                  </button>
                )}
                <span className="text-xs font-semibold text-gray-400">
                  {displayedIssues.length} {selectedEndpoint ? 'matching' : ''} issues
                </span>
              </div>
            </div>

            {displayedIssues.length === 0 ? (
              <div className="py-16 text-center text-emerald-400 flex flex-col items-center flex-1 justify-center">
                <div className="text-5xl mb-3">{selectedEndpoint ? '🔍' : '🎉'}</div>
                <h3 className="text-xl font-extrabold text-white">
                  {selectedEndpoint
                    ? `No contract issues found for ${selectedEndpoint.method} ${selectedEndpoint.path}`
                    : 'All API contracts match perfectly!'}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedEndpoint
                    ? 'Click "Show all" or select another endpoint from the sidebar.'
                    : 'No breaking changes detected between frontend callers and backend endpoints.'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5 flex-1 min-h-0 overflow-y-auto pr-1">
                {displayedIssues.map((issue, idx) => (
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

