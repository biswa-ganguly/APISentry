import React, { useState } from 'react';
import { ApiConsumer, ApiProvider } from '@apisentry/types';

export interface EndpointListProps {
  consumers: ApiConsumer[];
  providers: ApiProvider[];
}

export const EndpointList: React.FC<EndpointListProps> = ({ consumers, providers }) => {
  const [filter, setFilter] = useState('');

  const getMethodBadgeClass = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-emerald-500/15 text-emerald-400';
      case 'POST': return 'bg-blue-500/15 text-blue-400';
      case 'PUT': return 'bg-amber-500/15 text-amber-400';
      case 'DELETE': return 'bg-rose-500/15 text-rose-400';
      default: return 'bg-gray-500/15 text-gray-400';
    }
  };

  const filteredConsumers = consumers.filter(c => `${c.method} ${c.path}`.toLowerCase().includes(filter.toLowerCase()));
  const filteredProviders = providers.filter(p => `${p.method} ${p.path}`.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="bg-gray-900/70 border border-white/10 rounded-xl p-5 backdrop-blur-md flex flex-col gap-4">
      <div className="flex items-center justify-between font-extrabold text-base">
        <span>Discovered Endpoints</span>
        <span className="text-xs font-semibold text-gray-400">{consumers.length + providers.length} items</span>
      </div>

      <input
        type="text"
        placeholder="Filter endpoints..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="bg-black/35 border border-white/10 text-gray-200 px-3.5 py-2 rounded-lg text-sm outline-none focus:border-cyan-500 w-full"
      />

      <div className="flex flex-col gap-2 max-h-[620px] overflow-y-auto pr-1">
        {filteredConsumers.map((c, i) => (
          <div key={`c-${i}`} className="p-3 rounded-lg bg-white/[0.02] hover:bg-gray-800/80 border border-transparent hover:border-white/10 transition-all flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`font-mono font-extrabold text-[11px] px-2 py-0.5 rounded ${getMethodBadgeClass(c.method)}`}>{c.method}</span>
              <span className="font-mono font-semibold text-xs text-gray-200">{c.path}</span>
            </div>
            <span className="text-[11px] font-semibold text-gray-400">Frontend</span>
          </div>
        ))}

        {filteredProviders.map((p, i) => (
          <div key={`p-${i}`} className="p-3 rounded-lg bg-white/[0.02] hover:bg-gray-800/80 border border-transparent hover:border-white/10 transition-all flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`font-mono font-extrabold text-[11px] px-2 py-0.5 rounded ${getMethodBadgeClass(p.method)}`}>{p.method}</span>
              <span className="font-mono font-semibold text-xs text-gray-200">{p.path}</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-300">Backend</span>
          </div>
        ))}
      </div>
    </div>
  );
};
