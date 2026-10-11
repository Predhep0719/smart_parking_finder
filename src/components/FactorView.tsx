import React, { useState } from 'react';
import { ParkingRecord, FactorAggregation } from '../data/types';
import { analyzeFactor } from '../data/mlEngine';
import { BarChart3, Info, AlertTriangle } from 'lucide-react';

interface FactorViewProps {
  records: ParkingRecord[];
}

export const FactorView: React.FC<FactorViewProps> = ({ records }) => {
  const [activeFactor, setActiveFactor] = useState<'propertyType' | 'status' | 'ownership' | 'state'>('propertyType');

  const factorData: FactorAggregation[] = React.useMemo(() => {
    return analyzeFactor(records, activeFactor);
  }, [records, activeFactor]);

  const factorTitles = {
    propertyType: 'Property Type (Building vs Structure vs Land)',
    status: 'Building Status (Active vs Decommissioned vs Excess)',
    ownership: 'Ownership Model (Owned vs Leased)',
    state: 'Geographic State Distribution',
  };

  const maxAvgSpaces = Math.max(...factorData.map((f) => f.avgSpaces), 1);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Factor & Feature Association Analysis</h2>
          <p className="text-xs text-slate-400">
            Empirical breakdown of how total parking capacity varies across facility properties.
          </p>
        </div>

        {/* Factor Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveFactor('propertyType')}
            className={`px-3 py-1.5 rounded-md transition-colors ${activeFactor === 'propertyType' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-white'}`}
          >
            Property Type
          </button>
          <button
            onClick={() => setActiveFactor('ownership')}
            className={`px-3 py-1.5 rounded-md transition-colors ${activeFactor === 'ownership' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-white'}`}
          >
            Owned vs Leased
          </button>
          <button
            onClick={() => setActiveFactor('status')}
            className={`px-3 py-1.5 rounded-md transition-colors ${activeFactor === 'status' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-white'}`}
          >
            Building Status
          </button>
          <button
            onClick={() => setActiveFactor('state')}
            className={`px-3 py-1.5 rounded-md transition-colors ${activeFactor === 'state' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-white'}`}
          >
            State
          </button>
        </div>
      </div>

      {/* Scientific Methodology Notice */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white block font-medium mb-0.5">Empirical Association vs Causal Claims:</strong>
          These tables and charts reveal observed correlations and facility scale patterns across institutional properties. Differences in average parking capacity reflect zoning density, institutional mission, and urban location rather than a single causal factor. Categories with low record counts ($n &lt; 15$) should be interpreted with statistical caution.
        </div>
      </div>

      {/* Comparative Visual Bars */}
      <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">{factorTitles[activeFactor]}</h3>
          <span className="text-xs text-slate-400 font-mono">Sorted by sample frequency</span>
        </div>

        <div className="space-y-4 pt-1">
          {factorData.map((item) => {
            const barWidth = Math.max(3, Math.round((item.avgSpaces / maxAvgSpaces) * 100));
            const share = ((item.recordCount / records.length) * 100).toFixed(1);
            const isSmallSample = item.recordCount < 15;

            return (
              <div key={item.category} className="p-3.5 rounded-lg bg-slate-900/50 border border-slate-800/80 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{item.category}</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      (n={item.recordCount} · {share}%)
                    </span>
                    {isSmallSample && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-400">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Low sample size</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-right font-mono">
                    <span className="text-slate-400 text-[11px]">
                      Max: <strong className="text-white">{item.maxSpaces}</strong>
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Min: <strong className="text-white">{item.minSpaces}</strong>
                    </span>
                    <span className="text-cyan-400 font-bold text-sm">
                      Mean: {item.avgSpaces} spaces
                    </span>
                  </div>
                </div>

                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aggregate Data Table */}
      <div className="rounded-xl bg-[#0f172a] border border-slate-800 overflow-hidden">
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Detailed Descriptive Statistics</h4>
          <span className="text-xs text-slate-400">{factorData.length} distinct groups</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4 text-right">Records (n)</th>
                <th className="py-2.5 px-4 text-right">Total Spaces</th>
                <th className="py-2.5 px-4 text-right text-cyan-400">Average Capacity</th>
                <th className="py-2.5 px-4 text-right">Max Capacity</th>
                <th className="py-2.5 px-4 text-right">Min Capacity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {factorData.map((item) => (
                <tr key={item.category} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-4 font-semibold text-white">
                    {item.category}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-300">{item.recordCount}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">{item.totalSpaces.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-cyan-400">{item.avgSpaces}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-white">{item.maxSpaces}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">{item.minSpaces}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
