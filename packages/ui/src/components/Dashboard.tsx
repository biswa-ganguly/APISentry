import React, { useState, useMemo } from 'react';
import { AnalysisResult } from '@apisentry/types';
import { Header } from './Header';
import { MetricsGrid } from './MetricsGrid';
import { EndpointList, SelectedEndpoint } from './EndpointList';
import { IssueCard, ISSUE_TYPE_STYLES } from './IssueCard';

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
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const tagCounts = useMemo(() => {
    if (!result) return {};
    const counts: Record<string, number> = {};
    for (const issue of result.issues) {
      counts[issue.type] = (counts[issue.type] || 0) + 1;
    }
    return counts;
  }, [result]);

  const displayedIssues = useMemo(() => {
    if (!result) return [];
    return result.issues.filter(issue => {
      if (selectedTag && issue.type !== selectedTag) return false;
      if (!selectedEndpoint) return true;
      const consumerMatch = issue.consumer && issue.consumer.path === selectedEndpoint.path;
      const providerMatch = issue.provider && issue.provider.path === selectedEndpoint.path;
      const messageMatch = issue.message.includes(selectedEndpoint.path);
      return consumerMatch || providerMatch || messageMatch;
    });
  }, [result, selectedEndpoint, selectedTag]);

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

  const hasActiveFilters = Boolean(selectedEndpoint || selectedTag);

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
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setSelectedEndpoint(null);
                      setSelectedTag(null);
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-200 underline font-normal cursor-pointer"
                  >
                    Reset filters ({result.issues.length})
                  </button>
                )}
                <span className="text-xs font-semibold text-gray-400">
                  {displayedIssues.length} {hasActiveFilters ? 'filtered' : ''} issues
                </span>
              </div>
            </div>

            {/* Tag Filter Bar */}
            {Object.keys(tagCounts).length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0 border-b border-white/10 pb-3">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`font-mono text-xs px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap border ${
                    !selectedTag
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  ALL ({result.issues.length})
                </button>
                {Object.keys(tagCounts).map(type => {
                  const styleInfo = ISSUE_TYPE_STYLES[type] || {
                    badge: 'bg-gray-500/20 text-gray-300 border-gray-500/40',
                    label: type
                  };
                  const isSelected = selectedTag === type;
                  const count = tagCounts[type];

                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedTag(isSelected ? null : type)}
                      className={`font-mono text-xs px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap border ${styleInfo.badge} ${
                        isSelected
                          ? 'ring-2 ring-white/60 shadow-lg scale-[1.03] font-extrabold'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {type} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            {displayedIssues.length === 0 ? (
              <div className="py-16 text-center text-emerald-400 flex flex-col items-center flex-1 justify-center">
                <div className="text-5xl mb-3">{hasActiveFilters ? '🔍' : '🎉'}</div>
                <h3 className="text-xl font-extrabold text-white">
                  {hasActiveFilters
                    ? 'No contract issues match the active filter criteria.'
                    : 'All API contracts match perfectly!'}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {hasActiveFilters
                    ? 'Click "Reset filters" or select another tag/endpoint.'
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

