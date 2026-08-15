import React, { useState } from 'react';
import { ApiConsumer, ApiProvider } from '@apisentry/types';

export interface SelectedEndpoint {
  method: string;
  path: string;
}

export interface EndpointListProps {
  consumers: ApiConsumer[];
  providers: ApiProvider[];
  selectedEndpoint?: SelectedEndpoint | null;
  onSelectEndpoint?: (endpoint: SelectedEndpoint | null) => void;
}

export const EndpointList: React.FC<EndpointListProps> = ({
  consumers,
  providers,
  selectedEndpoint,
  onSelectEndpoint
}) => {
  const [filter, setFilter] = useState('');

  const getMethodBadgeClass = (method?: string) => {
    switch ((method || 'GET').toUpperCase()) {
      case 'GET': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'POST': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'PUT': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'DELETE': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const filteredConsumers = consumers.filter(c =>
    `${c.method || 'GET'} ${c.path}`.toLowerCase().includes(filter.toLowerCase())
  );
  const filteredProviders = providers.filter(p =>
    `${p.method || 'GET'} ${p.path}`.toLowerCase().includes(filter.toLowerCase())
  );

  const handleItemClick = (method: string, path: string) => {
    if (!onSelectEndpoint) return;
    const normMethod = (method || 'GET').toUpperCase();
    if (selectedEndpoint && selectedEndpoint.method.toUpperCase() === normMethod && selectedEndpoint.path === path) {
      onSelectEndpoint(null);
    } else {
      onSelectEndpoint({ method: normMethod, path });
    }
  };

  return (
    <div className="bg-gray-900/70 border border-white/10 rounded-xl p-5 backdrop-blur-md flex flex-col gap-4 min-w-0 flex-1 h-full min-h-0 overflow-hidden">
      <div className="flex items-center justify-between font-extrabold text-base shrink-0">
        <span>Discovered Endpoints</span>
        <span className="text-xs font-semibold text-gray-400">{consumers.length + providers.length} items</span>
      </div>

      <input
        type="text"
        placeholder="Filter endpoints..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="bg-black/35 border border-white/10 text-gray-200 px-3.5 py-2 rounded-lg text-sm outline-none focus:border-cyan-500 w-full shrink-0"
      />

      {selectedEndpoint && (
        <div className="flex items-center justify-between bg-cyan-950/50 border border-cyan-500/40 rounded-lg px-3 py-2 text-xs text-cyan-300 shrink-0">
          <span className="truncate min-w-0 flex-1">
            Filtered: <strong className="font-mono text-cyan-200">{selectedEndpoint.method} {selectedEndpoint.path}</strong>
          </span>
          <button
            onClick={() => onSelectEndpoint && onSelectEndpoint(null)}
            className="ml-2 font-bold text-cyan-400 hover:text-cyan-200 underline shrink-0 cursor-pointer"
          >
            Reset
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto pr-1">
        {filteredConsumers.map((c, i) => {
          const method = (c.method || 'GET').toUpperCase();
          const isSelected = selectedEndpoint?.method.toUpperCase() === method && selectedEndpoint?.path === c.path;

          return (
            <div
              key={`c-${i}`}
              onClick={() => handleItemClick(method, c.path)}
              title={`${method} ${c.path} (Click to filter issues)`}
              className={`group p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 min-w-0 ${
                isSelected
                  ? 'bg-cyan-950/60 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'bg-white/[0.02] hover:bg-gray-800/80 border-white/5 hover:border-cyan-500/40'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                <span className={`font-mono font-extrabold text-[10px] px-1.5 py-0.5 rounded shrink-0 uppercase ${getMethodBadgeClass(method)}`}>
                  {method}
                </span>
                <span className={`font-mono font-medium text-xs truncate flex-1 min-w-0 ${isSelected ? 'text-cyan-200 font-bold' : 'text-gray-200 group-hover:text-white'}`}>
                  {c.path}
                </span>
              </div>
              <span className="shrink-0 text-[10px] font-semibold text-gray-400 bg-gray-800/80 px-2 py-0.5 rounded-md border border-gray-700/60 uppercase tracking-wider">
                Frontend
              </span>
            </div>
          );
        })}

        {filteredProviders.map((p, i) => {
          const method = (p.method || 'GET').toUpperCase();
          const isSelected = selectedEndpoint?.method.toUpperCase() === method && selectedEndpoint?.path === p.path;

          return (
            <div
              key={`p-${i}`}
              onClick={() => handleItemClick(method, p.path)}
              title={`${method} ${p.path} (Click to filter issues)`}
              className={`group p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 min-w-0 ${
                isSelected
                  ? 'bg-cyan-950/60 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'bg-white/[0.02] hover:bg-gray-800/80 border-white/5 hover:border-emerald-500/40'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                <span className={`font-mono font-extrabold text-[10px] px-1.5 py-0.5 rounded shrink-0 uppercase ${getMethodBadgeClass(method)}`}>
                  {method}
                </span>
                <span className={`font-mono font-medium text-xs truncate flex-1 min-w-0 ${isSelected ? 'text-emerald-200 font-bold' : 'text-gray-200 group-hover:text-white'}`}>
                  {p.path}
                </span>
              </div>
              <span className="shrink-0 text-[10px] font-semibold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60 uppercase tracking-wider">
                Backend
              </span>
            </div>
          );
        })}

        {filteredConsumers.length === 0 && filteredProviders.length === 0 && (
          <div className="text-center py-6 text-xs text-gray-500">
            No endpoints matching filter
          </div>
        )}
      </div>
    </div>
  );
};

