import React from 'react';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  Archive, 
  Terminal, 
  CheckCircle2, 
  FileCode,
  FolderArchive
} from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div 
        className="w-full max-w-xl rounded-2xl bg-[#0f172a] border border-cyan-500/30 shadow-2xl p-6 relative space-y-5 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Download Project Files</h3>
              <p className="text-xs text-slate-400">Everything needed to run or submit your college Data Science mini project</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Download: Full Python Flask College Project ZIP */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900 border border-cyan-500/40 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-300">
                <FolderArchive className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Complete Python College Project</span>
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    .ZIP ARCHIVE
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Includes <code>app.py</code>, <code>ml_pipeline.py</code>, <code>Parking Data.csv</code>, <code>templates/</code>, <code>run_windows.bat</code> & <code>requirements.txt</code>
                </div>
              </div>
            </div>
          </div>

          <a
            href="/smart_college_parking_project.zip"
            download="smart_college_parking_project.zip"
            className="w-full py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer text-center"
          >
            <Archive className="w-4 h-4" />
            <span>Download Full Project ZIP (~29 KB)</span>
          </a>
        </div>

        {/* Individual File Downloads */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Individual Files
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Raw Dataset */}
            <a
              href="/Parking Data.csv"
              download="Parking Data.csv"
              className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    Parking Data.csv
                  </div>
                  <div className="text-[10px] text-slate-400">Original 1,312 row dataset</div>
                </div>
              </div>
              <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </a>

            {/* Python Batch Runner */}
            <a
              href="/smart_college_parking_project.zip"
              download="smart_college_parking_project.zip"
              className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    run_windows.bat
                  </div>
                  <div className="text-[10px] text-slate-400">1-click Windows runner</div>
                </div>
              </div>
              <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </a>
          </div>
        </div>

        {/* 3 Step Windows Quick Guide */}
        <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="font-semibold text-white flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>How to run on Windows after downloading:</span>
          </div>
          <ol className="list-decimal pl-4 space-y-1 text-slate-400 text-[11px] leading-relaxed">
            <li>Extract the downloaded <code>smart_college_parking_project.zip</code> to a folder.</li>
            <li>Double-click <strong><code>run_windows.bat</code></strong> (or run <code>pip install -r requirements.txt && python app.py</code> in Command Prompt).</li>
            <li>Open your browser at <strong><code>http://127.0.0.1:5000</code></strong>.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
