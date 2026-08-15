import React from 'react';

export interface HeaderProps {
  logoBase64?: string;
  selectedPreset: string;
  onPresetChange: (preset: string) => void;
  onScan: () => void;
  isScanning?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  logoBase64,
  selectedPreset,
  onPresetChange,
  onScan,
  isScanning = false
}) => {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-white/10 bg-[#0B0F17]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-3.5">
        {logoBase64 ? (
          <img src={logoBase64} className="w-11 h-11 rounded-xl shadow-[0_0_16px_rgba(6,182,212,0.5)] object-cover" alt="APISentry" />
        ) : (
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center font-extrabold text-white text-lg shadow-[0_0_16px_rgba(6,182,212,0.5)]">
            AS
          </div>
        )}
        <div className="flex flex-col">
          <h1 className="text-xl font-extrabold tracking-tight text-white">APISentry Dashboard</h1>
          <span className="text-xs font-medium text-gray-400">Real-time Static API Contract Guard</span>
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        <select
          value={selectedPreset}
          onChange={(e) => onPresetChange(e.target.value)}
          className="bg-gray-800/90 text-gray-100 border border-white/10 px-3.5 py-2 rounded-lg text-sm font-semibold outline-none cursor-pointer hover:border-white/20 transition-all"
        >
          <option value="">📁 Current IDE Workspace</option>
          <option value="fixtures/request-mismatch">⚡ Preset: Request Field Mismatch</option>
          <option value="fixtures/nested-router">⚡ Preset: Nested Express Router</option>
          <option value="fixtures/missing-endpoint">⚡ Preset: Missing Endpoint</option>
          <option value="fixtures/method-mismatch">⚡ Preset: Method Mismatch</option>
          <option value="fixtures/valid-express-react">⚡ Preset: Valid Express + React</option>
          <option value="fixtures/zod-validation">⚡ Preset: Zod Validation</option>
          <option value="fixtures/response-mismatch">⚡ Preset: Response Mismatch</option>
        </select>

        <button
          onClick={onScan}
          disabled={isScanning}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm px-5 py-2.5 rounded-lg shadow-[0_4px_14px_rgba(6,182,212,0.3)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.5)] transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isScanning && (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          )}
          <span>Analyze Workspace Now</span>
        </button>
      </div>
    </header>
  );
};
