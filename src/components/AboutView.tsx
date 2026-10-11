import React from 'react';
import { 
  FileText, 
  Workflow, 
  Cpu, 
  Terminal, 
  Layers, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  Laptop
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-lg font-bold text-white tracking-tight">About Project & Academic Documentation</h2>
        <p className="text-xs text-slate-400">
          Smart College Parking Space Finder · Data Science & Machine Learning Mini Project
        </p>
      </div>

      {/* Problem & Aim */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            1. Problem Statement
          </div>
          <h3 className="text-sm font-bold text-white">Campus Parking Congestion & Unplanned Scale</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            University administrators and campus town planners frequently face vehicle overcrowding, erratic bay requirements, and guesswork in facility construction. Without empirical machine learning benchmarks, expanding institutional facilities either over-allocates precious land or creates severe spillover traffic into neighborhood streets.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            2. Project Aim & Objectives
          </div>
          <h3 className="text-sm font-bold text-white">Empirical Capacity Modeling & Optimization</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            To build a production-grade data science application that parses historical institutional facility records, trains a multi-tree <strong>Random Forest Regressor</strong>, benchmarks total parking footprint across building classifications and tenures, and provides planners with an interactive inference tool.
          </p>
        </div>
      </div>

      {/* ML Pipeline Architecture */}
      <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Workflow className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">3. Machine Learning Architecture & Workflow</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
            <span className="font-mono text-cyan-400 text-[11px] font-bold">Step 1</span>
            <h4 className="font-semibold text-white">Data Cleansing</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Standardized uppercase strings, stripped whitespace, zero-loss imputation, non-negative target boundary enforcement.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
            <span className="font-mono text-cyan-400 text-[11px] font-bold">Step 2</span>
            <h4 className="font-semibold text-white">Feature Encoding</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Scikit-learn <code>OneHotEncoder(handle_unknown='ignore')</code> avoiding leakage, plus Bayesian smoothed target frequency for cities.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
            <span className="font-mono text-cyan-400 text-[11px] font-bold">Step 3</span>
            <h4 className="font-semibold text-white">Ensemble Modeling</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <code>RandomForestRegressor</code> (100 bootstrap trees, depth=12) with MSE split optimization capturing non-linear interactions.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
            <span className="font-mono text-cyan-400 text-[11px] font-bold">Step 4</span>
            <h4 className="font-semibold text-white">Regression Evaluation</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Evaluated on 20% holdout test set with MAE, MSE, RMSE, and R² variance explained (classification accuracy avoided).
            </p>
          </div>
        </div>
      </div>

      {/* Dataset & Tech Stack */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Dataset Attributes (Parking Data.csv)</h3>
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
            <li><strong>Total Record Count:</strong> 1,312 clean rows</li>
            <li><strong>Target Variable (y):</strong> <code>Total Parking Spaces</code> (0 to 1,688)</li>
            <li><strong>Location Features:</strong> <code>Bldg City</code> (274 cities), <code>Bldg State</code> (10 states)</li>
            <li><strong>Status:</strong> <code>Bldg Status</code> (ACTIVE, DECOMMISSIONED, EXCESS)</li>
            <li><strong>Facility Classification:</strong> <code>Property Type</code> (BUILDING, STRUCTURE, LAND)</li>
            <li><strong>Tenure Model:</strong> <code>Owned/Leased</code> (OWNED, LEASED)</li>
          </ul>
        </div>

        <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Full Technology Stack</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Machine Learning</span>
              <strong className="text-white">Scikit-Learn, NumPy</strong>
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Backend Framework</span>
              <strong className="text-white">Python 3.10+, Flask</strong>
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Frontend UI</span>
              <strong className="text-white">React 19 + Tailwind CSS</strong>
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Storage</span>
              <strong className="text-white">Direct CSV (No DB needed)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Limitations vs Future Work */}
      <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white">4. Project Limitations vs Future IoT Extensions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <AlertCircle className="w-4 h-4" />
              <span>Current Boundaries</span>
            </div>
            <p className="text-slate-300 leading-relaxed mb-0">
              Our model provides <em>capacity sizing expectations</em>. It cannot predict how many cars are parked at 10:15 AM today because tabular historical files lack timestamped telemetry.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Future Real-Time Extensions</span>
            </div>
            <p className="text-slate-300 leading-relaxed mb-0">
              Future college phases can integrate ultrasonic lot sensors, YOLO edge camera feeds, or RFID gate barrier logs into the calculation: <code>Available = Total_Capacity - Occupied</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Windows College Submission Guide */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 to-[#0f1d38] border border-slate-700 space-y-3">
        <div className="flex items-center gap-2">
          <Laptop className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">College Deliverables & Windows Instructions</h3>
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <a
            href="/smart_college_parking_project.zip"
            download="smart_college_parking_project.zip"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-xs"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Download Full Python Project (.zip)</span>
          </a>
          <a
            href="/Parking Data.csv"
            download="Parking Data.csv"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors border border-slate-700"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download Parking Data.csv</span>
          </a>
        </div>

        <div className="p-3 rounded-lg bg-black/60 border border-slate-800 font-mono text-xs text-cyan-300 space-y-1 overflow-x-auto">
          <div>:: Run on Windows (in python_college_project folder):</div>
          <div className="text-white">run_windows.bat</div>
          <div className="text-slate-500">:: Or manually:</div>
          <div className="text-white">python -m venv venv</div>
          <div className="text-white">venv\Scripts\activate</div>
          <div className="text-white">pip install -r requirements.txt</div>
          <div className="text-white">python app.py</div>
        </div>
      </div>
    </div>
  );
};
