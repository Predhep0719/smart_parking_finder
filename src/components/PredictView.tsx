import React, { useState, useMemo } from 'react';
import { ParkingRecord } from '../data/types';
import { RandomForestRegressor } from '../data/mlEngine';
import { Sparkles, Cpu, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react';

interface PredictViewProps {
  records: ParkingRecord[];
  model: RandomForestRegressor;
}

export const PredictView: React.FC<PredictViewProps> = ({ records, model }) => {
  // Extract distinct vocabularies from dataset
  const states = useMemo(() => Array.from(new Set(records.map((r) => r.state))).sort(), [records]);
  const types = useMemo(() => Array.from(new Set(records.map((r) => r.propertyType))).sort(), [records]);
  const statuses = useMemo(() => Array.from(new Set(records.map((r) => r.status))).sort(), [records]);
  const ownerships = useMemo(() => Array.from(new Set(records.map((r) => r.ownership))).sort(), [records]);

  // Form states with defaults from top frequency
  const [selectedState, setSelectedState] = useState<string>('TX');
  const [selectedCity, setSelectedCity] = useState<string>('AUSTIN');
  const [selectedType, setSelectedType] = useState<string>('BUILDING');
  const [selectedStatus, setSelectedStatus] = useState<string>('ACTIVE');
  const [selectedOwnership, setSelectedOwnership] = useState<string>('LEASED');

  // Dynamic cities matching chosen state
  const availableCities = useMemo(() => {
    const matching = records.filter((r) => r.state === selectedState);
    const unique = Array.from(new Set(matching.map((r) => r.city))).sort();
    return unique.length > 0 ? unique : Array.from(new Set(records.map((r) => r.city))).sort();
  }, [records, selectedState]);

  // Prediction result state
  const [predictionOutput, setPredictionOutput] = useState<{
    predictedSpaces: number;
    confidenceLow: number;
    confidenceHigh: number;
    explanation: string;
    evaluatedAt: string;
    inputs: {
      city: string;
      state: string;
      status: string;
      propertyType: string;
      ownership: string;
    };
  } | null>(null);

  const [loading, setLoading] = useState(false);

  // Auto-align city when state changes if current city not in new state
  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    const stateCities = records.filter((r) => r.state === newState).map((r) => r.city);
    if (!stateCities.includes(selectedCity) && stateCities.length > 0) {
      setSelectedCity(stateCities[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const result = model.predictSingle({
        city: selectedCity,
        state: selectedState,
        status: selectedStatus,
        propertyType: selectedType,
        ownership: selectedOwnership,
      });

      setPredictionOutput({
        ...result,
        evaluatedAt: new Date().toLocaleTimeString(),
        inputs: {
          city: selectedCity,
          state: selectedState,
          status: selectedStatus,
          propertyType: selectedType,
          ownership: selectedOwnership,
        },
      });
      setLoading(false);
    }, 150);
  };

  const handleReset = () => {
    setSelectedState('TX');
    setSelectedCity('AUSTIN');
    setSelectedType('BUILDING');
    setSelectedStatus('ACTIVE');
    setSelectedOwnership('LEASED');
    setPredictionOutput(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-lg font-bold text-white tracking-tight">Predict Total Parking Capacity</h2>
        <p className="text-xs text-slate-400">
          Run inference through the trained Random Forest model to calculate estimated structural parking capacity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <div className="p-6 rounded-xl bg-[#0f172a] border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Facility Input Parameters</h3>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Default</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Bldg State
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    required
                  >
                    {states.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Bldg City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    required
                  >
                    {availableCities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {availableCities.length} cities in {selectedState}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Property Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    required
                  >
                    {types.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Building Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    required
                  >
                    {statuses.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Ownership Model
                  </label>
                  <select
                    value={selectedOwnership}
                    onChange={(e) => setSelectedOwnership(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    required
                  >
                    {ownerships.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? 'Evaluating Model Trees...' : 'Compute Predicted Total Parking Capacity'}</span>
                </button>
              </div>
            </form>

            <div className="p-3.5 rounded-lg bg-slate-900/50 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <strong>Pipeline Process:</strong> Categorical features are encoded via One-Hot mappings; the city smoothed mean is evaluated across 25 bagging trees; outputs are averaged and clamped to valid non-negative values.
            </div>
          </div>
        </div>

        {/* Prediction Results Display */}
        <div className="lg:col-span-5">
          {predictionOutput ? (
            <div className="p-6 rounded-xl bg-[#0f172a] border border-cyan-500/40 space-y-5 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
                  Model Output
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {predictionOutput.evaluatedAt}
                </span>
              </div>

              <div>
                <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
                  Predicted Total Parking Capacity
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black font-mono text-cyan-400 tracking-tight">
                    {predictionOutput.predictedSpaces}
                  </span>
                  <span className="text-sm text-slate-300 font-medium">total spaces</span>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-1.5">
                  Empirical ensemble range: <strong className="text-white">{predictionOutput.confidenceLow}</strong> - <strong className="text-white">{predictionOutput.confidenceHigh}</strong> spaces
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1.5 text-xs">
                <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Evaluated Features
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Location:</span>
                  <span className="font-semibold text-white">{predictionOutput.inputs.city}, {predictionOutput.inputs.state}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Property Category:</span>
                  <span className="text-white">{predictionOutput.inputs.propertyType} ({predictionOutput.inputs.status})</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Tenure:</span>
                  <span className="text-cyan-300 font-medium">{predictionOutput.inputs.ownership}</span>
                </div>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                <strong className="text-white block font-medium mb-1">Reasoning & Context:</strong>
                <p className="text-slate-400 mb-0">{predictionOutput.explanation}</p>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Project Constraint:</strong> This value represents <strong>structural parking capacity</strong>. It does not measure how many spaces are vacant at this exact second.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-[#0f172a] border border-slate-800 h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-white">Awaiting Prediction Inputs</h4>
              <p className="text-xs max-w-xs leading-relaxed text-slate-400">
                Select your facility attributes in the parameter form and run inference to compute the predicted capacity footprint.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
