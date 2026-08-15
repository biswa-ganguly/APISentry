import React from 'react';
import { AnalysisResult } from '@apisentry/types';

export interface MetricsGridProps {
  metrics: AnalysisResult['metrics'];
  errorsCount: number;
  warningsCount: number;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics, errorsCount, warningsCount }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-7">
      <div className="bg-gray-900/70 border border-white/10 p-4 rounded-xl backdrop-blur-md flex flex-col gap-1">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Files Analyzed</span>
        <span className="text-3xl font-extrabold text-white">{metrics.filesDiscovered}</span>
      </div>

      <div className="bg-gray-900/70 border border-white/10 p-4 rounded-xl backdrop-blur-md flex flex-col gap-1">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Frontend Callers</span>
        <span className="text-3xl font-extrabold text-white">{metrics.consumersDetected}</span>
      </div>

      <div className="bg-gray-900/70 border border-white/10 p-4 rounded-xl backdrop-blur-md flex flex-col gap-1">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Backend Endpoints</span>
        <span className="text-3xl font-extrabold text-white">{metrics.providersDetected}</span>
      </div>

      <div className="bg-gray-900/70 border border-white/10 p-4 rounded-xl backdrop-blur-md flex flex-col gap-1">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Contract Errors</span>
        <span className="text-3xl font-extrabold text-rose-500">{errorsCount}</span>
      </div>

      <div className="bg-gray-900/70 border border-white/10 p-4 rounded-xl backdrop-blur-md flex flex-col gap-1">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Contract Warnings</span>
        <span className="text-3xl font-extrabold text-amber-500">{warningsCount}</span>
      </div>
    </div>
  );
};
