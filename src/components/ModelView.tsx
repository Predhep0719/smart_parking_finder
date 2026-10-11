import React, { useState } from 'react';
import { ModelMetrics, ValidationItem } from '../data/types';
import { 
  Cpu, 
  HelpCircle, 
  ShieldAlert, 
  CheckCircle, 
  Activity,
  Layers,
  Search
} from 'lucide-react';

interface ModelViewProps {
  metrics: ModelMetrics;
  validationItems: ValidationItem[];
}

export const ModelView: React.FC<ModelViewProps> = ({
  metrics,
  validationItems,
}) => {
  const [filterError, setFilterError] = useState<'all' | 'close' | 'medium' | 'large'>('all');
  const [searchVal, setSearchVal] = useState('');

  // Accuracy bands
  const totalTest = validationItems.length;
  const within10 = validationItems.filter((v) => v.absoluteError <= 10).length;
  const within25 = validationItems.filter((v) => v.absoluteError <= 25).length;
  const within50 = validationItems.filter((v) => v.absoluteError <= 50).length;

  const pct10 = totalTest > 0 ? ((within10 / totalTest) * 100).toFixed(1) : '0';
  const pct25 = totalTest > 0 ? ((within25 / totalTest) * 100).toFixed(1) : '0';
  const pct50 = totalTest > 0 ? ((within50 / totalTest) * 100).toFixed(1) : '0';

  const filteredValidation = validationItems.filter((v) => {
    if (filterError === 'close' && v.absoluteError > 15) return false;
    if (filterError === 'medium' && (v.absoluteError <= 15 || v.absoluteError > 40)) return false;
    if (filterError === 'large' && v.absoluteError <= 40) return false;

    if (searchVal.trim()) {
      const q = searchVal.toLowerCase();
      return (
        v.city.toLowerCase().includes(q) ||
        v.state.toLowerCase().includes(q) ||
        v.propertyType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Machine Learning Model Performance</h2>
          <p className="text-xs text-slate-400">
            Holdout test evaluation of Scikit-Learn Random Forest Regressor ({metrics.trainCount} train / {metrics.testCount} test).
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/60">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>RandomForest (n_trees={metrics.nEstimators}, max_depth={metrics.maxDepth})</span>
        </div>
      </div>

      {/* 4 Regression Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
            <span>Mean Absolute Error</span>
            <span className="font-mono text-cyan-400">MAE</span>
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">±{metrics.mae}</div>
          <div className="text-[10px] text-slate-400 mt-1">Average parking spot deviation</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
            <span>Root Mean Squared Error</span>
            <span className="font-mono text-slate-400">RMSE</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{metrics.rmse}</div>
          <div className="text-[10px] text-slate-400 mt-1">Penalizes large outlier mistakes</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
            <span>Mean Squared Error</span>
            <span className="font-mono text-slate-400">MSE</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{metrics.mse.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-1">Quadratic regression loss</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
            <span>R² Determination</span>
            <span className="font-mono text-cyan-400">R²</span>
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">{metrics.r2}</div>
          <div className="text-[10px] text-slate-400 mt-1">Variance explained by features</div>
        </div>
      </div>

      {/* Metric Explanation Panel */}
      <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Why Regression Metrics (Not Classification Accuracy)?</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1.5">
            <strong className="text-white block font-medium">Why percentage "accuracy" is scientifically incorrect here:</strong>
            <p className="text-slate-400 mb-0">
              In classification (e.g., Cat vs Dog), an outcome is either 100% correct or 100% wrong. In parking capacity regression, the target variable is a continuous integer (0 to 1,688 spaces). If a lot actually holds 100 spaces and the model estimates 95 spaces, it made an error of only 5 spaces—a close prediction. Evaluating this as "0% accuracy" would be absurd. Regression uses distance metrics (MAE, RMSE, R²).
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1.5">
            <strong className="text-white block font-medium">Metric Interpretation in Plain Language:</strong>
            <ul className="text-slate-400 space-y-1 pl-4 list-disc mb-0">
              <li><strong>MAE ({metrics.mae}):</strong> On average, the model's estimate is within ~{metrics.mae} parking spaces of the actual ground truth.</li>
              <li><strong>RMSE ({metrics.rmse}):</strong> Heavy outlier lot sizes (e.g., lots with 1,500+ spaces) expand RMSE above MAE.</li>
              <li><strong>R² ({metrics.r2}):</strong> Shows the proportion of parking capacity variability accounted for by property type, state, status, and tenure.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Accuracy Interval Bands */}
      <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
          Holdout Test Set Error Bands (n={totalTest})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-emerald-500/30 text-center">
            <div className="text-xl font-bold text-emerald-400 font-mono">{pct10}%</div>
            <div className="text-xs text-white font-medium mt-1">Within ±10 Spaces</div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">{within10} of {totalTest} test sites</div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-cyan-500/30 text-center">
            <div className="text-xl font-bold text-cyan-400 font-mono">{pct25}%</div>
            <div className="text-xs text-white font-medium mt-1">Within ±25 Spaces</div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">{within25} of {totalTest} test sites</div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-center">
            <div className="text-xl font-bold text-white font-mono">{pct50}%</div>
            <div className="text-xs text-white font-medium mt-1">Within ±50 Spaces</div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">{within50} of {totalTest} test sites</div>
          </div>
        </div>
      </div>

      {/* Actual vs Predicted Validation Table */}
      <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">Actual vs Predicted Validation Table</h3>
            <p className="text-xs text-slate-400">Comparing true dataset targets against Random Forest regression outputs</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setFilterError('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${filterError === 'all' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-white'}`}
              >
                All ({validationItems.length})
              </button>
              <button
                onClick={() => setFilterError('close')}
                className={`px-2.5 py-1 rounded-md transition-colors ${filterError === 'close' ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-slate-400 hover:text-white'}`}
              >
                Close (≤15)
              </button>
              <button
                onClick={() => setFilterError('large')}
                className={`px-2.5 py-1 rounded-md transition-colors ${filterError === 'large' ? 'bg-amber-500/20 text-amber-300 font-medium' : 'text-slate-400 hover:text-white'}`}
              >
                Outliers (&gt;40)
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Ownership</th>
                  <th className="py-2.5 px-3 text-right">Actual Spaces</th>
                  <th className="py-2.5 px-3 text-right text-cyan-300">Predicted Capacity</th>
                  <th className="py-2.5 px-3 text-right">Absolute Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredValidation.map((v) => {
                  let errorColor = 'text-emerald-400';
                  if (v.absoluteError > 40) errorColor = 'text-rose-400';
                  else if (v.absoluteError > 15) errorColor = 'text-amber-400';

                  return (
                    <tr key={v.id} className="hover:bg-slate-800/30">
                      <td className="py-2 px-3 font-medium text-white">{v.city}, {v.state}</td>
                      <td className="py-2 px-3 text-slate-400">{v.propertyType}</td>
                      <td className="py-2 px-3 text-slate-400">{v.ownership}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-white">{v.actual}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-cyan-400">{v.predicted}</td>
                      <td className={`py-2 px-3 text-right font-mono font-medium ${errorColor}`}>
                        ±{v.absoluteError}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong>Validation Caveat:</strong> Model predictions reflect typical historical space allocations. They represent structural sizing expectations rather than guaranteed exact blueprints.
          </span>
        </div>
      </div>
    </div>
  );
};
