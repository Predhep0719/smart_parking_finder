import React from 'react';
import { ParkingRecord, DatasetStats } from '../data/types';
import { 
  Building2, 
  MapPin, 
  Layers, 
  TrendingUp, 
  Car, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface DashboardViewProps {
  stats: DatasetStats;
  records: ParkingRecord[];
  onNavigate: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  records,
  onNavigate,
}) => {
  // Aggregate state counts
  const stateCounts: { [state: string]: number } = {};
  records.forEach((r) => {
    stateCounts[r.state] = (stateCounts[r.state] || 0) + 1;
  });
  const topStates = Object.entries(stateCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Property type aggregations
  const propertyTypes: { [type: string]: { count: number; totalSpaces: number } } = {};
  records.forEach((r) => {
    if (!propertyTypes[r.propertyType]) {
      propertyTypes[r.propertyType] = { count: 0, totalSpaces: 0 };
    }
    propertyTypes[r.propertyType].count++;
    propertyTypes[r.propertyType].totalSpaces += r.totalSpaces;
  });

  // Ownership aggregations
  const ownershipMap: { [own: string]: { count: number; totalSpaces: number } } = {};
  records.forEach((r) => {
    if (!ownershipMap[r.ownership]) {
      ownershipMap[r.ownership] = { count: 0, totalSpaces: 0 };
    }
    ownershipMap[r.ownership].count++;
    ownershipMap[r.ownership].totalSpaces += r.totalSpaces;
  });

  // Capacity range distribution
  const capacityBuckets = [
    { label: '0 Spaces (None)', count: records.filter((r) => r.totalSpaces === 0).length },
    { label: '1 - 25 Spaces', count: records.filter((r) => r.totalSpaces >= 1 && r.totalSpaces <= 25).length },
    { label: '26 - 100 Spaces', count: records.filter((r) => r.totalSpaces > 25 && r.totalSpaces <= 100).length },
    { label: '101 - 300 Spaces', count: records.filter((r) => r.totalSpaces > 100 && r.totalSpaces <= 300).length },
    { label: '300+ Spaces', count: records.filter((r) => r.totalSpaces > 300).length },
  ];
  const maxBucketCount = Math.max(...capacityBuckets.map((b) => b.count));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-[#0f1d38] via-[#102042] to-[#0c1933] border border-cyan-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-cyan-500/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-cyan-400 mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Historical Institutional Capacity Analysis</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
            Smart College Parking Space Analytics & Predictor
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            Analysis of 1,312 property records predicting total structural parking spaces based on property category, tenure, and location. Built for college Data Science evaluations using Scikit-Learn Random Forest Regression.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('predict')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Predict Capacity</span>
            </button>
            <button
              onClick={() => onNavigate('model')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors border border-slate-700"
            >
              <span>View Model Evaluation (MAE & R²)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            Total Records
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats.totalRecords}</div>
          <div className="text-[10px] text-slate-400 mt-1">Clean verified rows</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            Avg Spaces
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">{stats.avgSpaces}</div>
          <div className="text-[10px] text-slate-400 mt-1">Median: {stats.medianSpaces} spaces</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            Max Capacity
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats.maxSpaces}</div>
          <div className="text-[10px] text-slate-400 mt-1">Single largest lot</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            Min Capacity
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats.minSpaces}</div>
          <div className="text-[10px] text-slate-400 mt-1">{stats.zeroSpaceCount} zero-space sites</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            Unique Cities
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats.uniqueCities}</div>
          <div className="text-[10px] text-slate-400 mt-1">Across {stats.uniqueStates} states</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            Property Types
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats.uniquePropertyTypes}</div>
          <div className="text-[10px] text-slate-400 mt-1">Building, Struct, Land</div>
        </div>
      </div>

      {/* Distribution Charts & Comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Parking Capacity Distribution Histogram */}
        <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Capacity Scale Distribution</h3>
              <p className="text-xs text-slate-400">Frequency of facility parking sizes across the dataset</p>
            </div>
            <span className="text-xs font-mono text-cyan-400">{stats.totalSpaces.toLocaleString()} total spaces</span>
          </div>

          <div className="space-y-3 pt-2">
            {capacityBuckets.map((bucket, i) => {
              const pct = ((bucket.count / stats.totalRecords) * 100).toFixed(1);
              const barWidth = Math.max(4, Math.round((bucket.count / maxBucketCount) * 100));
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{bucket.label}</span>
                    <span className="text-slate-400 font-mono">
                      {bucket.count} <span className="text-slate-500">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Skewness: Heavy right-tail distribution</span>
            <span>Standard Deviation: ±{stats.stdDev}</span>
          </div>
        </div>

        {/* Property Type Comparison */}
        <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Property Type Comparison</h3>
              <p className="text-xs text-slate-400">Total sites vs average parking spaces allocated</p>
            </div>
            <button
              onClick={() => onNavigate('factors')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              <span>Factor Analysis</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {Object.entries(propertyTypes).map(([type, data]) => {
              const avg = Math.round(data.totalSpaces / data.count);
              const pctOfSites = ((data.count / stats.totalRecords) * 100).toFixed(1);
              return (
                <div key={type} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{type}</span>
                      <span className="text-xs text-slate-400">({data.count} facilities · {pctOfSites}%)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Avg: </span>
                      <span className="text-sm font-bold text-cyan-400 font-mono">{avg}</span>
                      <span className="text-xs text-slate-400"> spaces</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(5, (avg / 150) * 100))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="text-xs text-slate-300 font-medium mb-1">Tenure Comparison (Owned vs Leased):</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(ownershipMap).map(([own, data]) => {
                const avg = Math.round(data.totalSpaces / data.count);
                return (
                  <div key={own} className="p-2.5 rounded bg-slate-900/40 border border-slate-800 text-slate-300">
                    <div className="text-slate-400 text-[11px]">{own}</div>
                    <div className="font-mono text-sm font-bold text-white mt-0.5">{data.count} <span className="text-slate-400 font-normal text-xs">sites</span></div>
                    <div className="text-[11px] text-cyan-400 font-mono mt-0.5">Mean: {avg} spaces</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Geographic Breakdown & Academic Notice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Top Geographic States</h3>
              <p className="text-xs text-slate-400">Highest volume of campus and facility properties in dataset</p>
            </div>
            <span className="text-xs text-slate-400">{stats.uniqueStates} states total</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {topStates.map(([state, count]) => {
              const share = ((count / stats.totalRecords) * 100).toFixed(1);
              return (
                <div key={state} className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">{state}</span>
                    <span className="text-xs text-cyan-400 font-mono font-medium">{count} sites</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{share}% share</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#0f172a] border border-cyan-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Scientific Project Boundary</span>
            </div>
            <h4 className="text-sm font-bold text-white mb-2">Capacity Modeling vs Vacancy</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              This application models <strong>facility parking capacity scale</strong> using multi-factor tabular regression.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              It does <em>not</em> claim to sense live vacant spots from static CSV files. Real-time vacancy requires live IoT gates or camera counters.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigate('monitor')}
              className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1.5"
            >
              <span>Explore Sensor Simulation Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
