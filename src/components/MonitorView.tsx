import React, { useState } from 'react';
import { 
  Activity, 
  Radio, 
  ShieldAlert, 
  Car, 
  RotateCcw,
  Sliders
} from 'lucide-react';

export const MonitorView: React.FC = () => {
  const [totalCapacity, setTotalCapacity] = useState<number>(120);
  const [occupiedSpaces, setOccupiedSpaces] = useState<number>(78);

  const safeTotal = Math.max(1, totalCapacity);
  const safeOccupied = Math.max(0, Math.min(safeTotal, occupiedSpaces));
  const availableSpaces = Math.max(0, safeTotal - safeOccupied);
  const occupancyPercentage = Number(((safeOccupied / safeTotal) * 100).toFixed(1));

  // Determine occupancy state & color
  let statusBadge = {
    label: 'Normal Flow',
    color: 'text-emerald-400',
    barColor: 'from-emerald-500 to-teal-500',
    desc: 'Ample parking capacity available.',
  };
  if (occupancyPercentage >= 90) {
    statusBadge = {
      label: 'Lot Nearly Full',
      color: 'text-rose-400',
      barColor: 'from-rose-500 to-red-600',
      desc: 'Critical congestion threshold reached.',
    };
  } else if (occupancyPercentage >= 70) {
    statusBadge = {
      label: 'High Occupancy',
      color: 'text-amber-400',
      barColor: 'from-amber-500 to-orange-500',
      desc: 'Approaching peak campus rush.',
    };
  }

  // Generate visual parking grid (up to 40 representative slots)
  const maxSlotsToShow = 40;
  const ratio = safeTotal > maxSlotsToShow ? maxSlotsToShow / safeTotal : 1;
  const slotsToDraw = Math.min(safeTotal, maxSlotsToShow);
  const occupiedSlotsCount = Math.round(safeOccupied * ratio);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Parking Occupancy Monitor (Sandbox Demo)
          </h2>
          <p className="text-xs text-slate-400">
            Interactive software demonstration of real-time lot occupancy mathematics.
          </p>
        </div>

        {/* Obligatory academic disclaimer badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
          <span>Simulation — Not Connected to Live Sensors</span>
        </div>
      </div>

      {/* Prominent Educational Warning */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white block font-medium mb-0.5">Academic Project Boundary & Integrity Note:</strong>
          Our primary dataset (<code>Parking Data.csv</code>) contains historical records of <strong>total structural capacity</strong>. It is scientifically impossible for static historical datasets to know which car entered or exited five minutes ago. Real-time open space vacancy requires physical sensor hardware. This module models the mathematical software tier that consumes sensor telemetry.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Simulator Controls */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-xl bg-[#0f172a] border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Simulation Controls</h3>
              </div>
              <button
                onClick={() => {
                  setTotalCapacity(120);
                  setOccupiedSpaces(78);
                }}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Demo</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Total Facility Capacity</span>
                  <span className="font-mono text-cyan-400 font-bold">{safeTotal} spaces</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="5"
                  value={safeTotal}
                  onChange={(e) => {
                    const newTotal = parseInt(e.target.value, 10);
                    setTotalCapacity(newTotal);
                    if (occupiedSpaces > newTotal) setOccupiedSpaces(newTotal);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                  <span>10 min</span>
                  <span>1,000 max</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Simulated Occupied Spaces</span>
                  <span className="font-mono text-amber-400 font-bold">{safeOccupied} vehicles</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={safeTotal}
                  step="1"
                  value={safeOccupied}
                  onChange={(e) => setOccupiedSpaces(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                  <span>0 empty</span>
                  <span>{safeTotal} maximum full</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOccupiedSpaces((prev) => Math.max(0, prev - 5))}
                  className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 font-medium border border-slate-800 transition-colors"
                >
                  -5 Vehicles Depart
                </button>
                <button
                  type="button"
                  onClick={() => setOccupiedSpaces((prev) => Math.min(safeTotal, prev + 5))}
                  className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 font-medium border border-slate-800 transition-colors"
                >
                  +5 Vehicles Enter
                </button>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed font-mono">
                <code>Available = Total_Capacity ({safeTotal}) - Occupied ({safeOccupied}) = {availableSpaces}</code>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Display */}
        <div className="lg:col-span-7">
          <div className="p-6 rounded-xl bg-[#0f172a] border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Facility Telemetry Indicator
              </span>
              <span className={`text-xs font-bold ${statusBadge.color}`}>
                ● {statusBadge.label}
              </span>
            </div>

            {/* 3 Large Value Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                  Total Capacity
                </div>
                <div className="text-3xl font-black font-mono text-white">{safeTotal}</div>
                <div className="text-[10px] text-slate-400 mt-1">Structural bays</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/20 text-center">
                <div className="text-[11px] font-medium text-amber-400 uppercase tracking-wider mb-1">
                  Occupied
                </div>
                <div className="text-3xl font-black font-mono text-amber-400">{safeOccupied}</div>
                <div className="text-[10px] text-slate-400 mt-1">{occupancyPercentage}% filled</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/30 text-center">
                <div className="text-[11px] font-medium text-cyan-400 uppercase tracking-wider mb-1">
                  Available
                </div>
                <div className="text-3xl font-black font-mono text-cyan-400">{availableSpaces}</div>
                <div className="text-[10px] text-slate-400 mt-1">Open to park</div>
              </div>
            </div>

            {/* Progress Gauge */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Occupancy Utilization</span>
                <span className="font-mono font-bold text-white">{occupancyPercentage}%</span>
              </div>
              <div className="h-3.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className={`h-full bg-gradient-to-r ${statusBadge.barColor} rounded-full transition-all duration-200`}
                  style={{ width: `${Math.min(100, Math.max(2, occupancyPercentage))}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400 text-right">{statusBadge.desc}</div>
            </div>

            {/* Visual Mini Parking Slot Grid */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Representative Lot Matrix ({slotsToDraw} bay sample)</span>
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-amber-400 font-mono">
                    <span className="w-2 h-2 rounded-xs bg-amber-400"></span> Occupied
                  </span>
                  <span className="flex items-center gap-1 text-cyan-400 font-mono">
                    <span className="w-2 h-2 rounded-xs bg-cyan-400"></span> Available
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-10 gap-1.5 p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                {Array.from({ length: slotsToDraw }).map((_, i) => {
                  const isOccupied = i < occupiedSlotsCount;
                  return (
                    <div
                      key={i}
                      title={isOccupied ? `Slot ${i + 1}: Occupied` : `Slot ${i + 1}: Available`}
                      className={`h-6 rounded-xs flex items-center justify-center text-[10px] font-mono transition-colors ${
                        isOccupied
                          ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                          : 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                      }`}
                    >
                      <Car className="w-3 h-3" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
