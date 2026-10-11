import React, { useState } from 'react';
import { Menu, FileSpreadsheet, Download, FolderArchive } from 'lucide-react';
import { DatasetStats } from '../data/types';
import { DownloadModal } from './DownloadModal';

interface HeaderProps {
  stats: DatasetStats;
  onOpenMobile: () => void;
  activeTabTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  onOpenMobile,
  activeTabTitle,
}) => {
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  return (
    <>
      <header className="h-16 px-4 lg:px-8 bg-[#0d1527]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobile}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm lg:text-base font-bold text-white tracking-tight">
              {activeTabTitle}
            </h1>
            <div className="text-[11px] text-slate-400 hidden sm:block">
              Smart College Parking Space Finder · Random Forest Regression
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* Quick dataset ticker */}
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-md bg-slate-900/60 border border-slate-800/80 text-slate-300 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-400">
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
              Parking Data.csv
            </span>
            <span className="text-slate-600">·</span>
            <span>{stats.totalRecords} records</span>
            <span className="text-slate-600">·</span>
            <span className="text-cyan-300">{stats.uniqueCities} cities</span>
          </div>

          {/* Prominent Download Button */}
          <button
            onClick={() => setDownloadModalOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Files</span>
          </button>
        </div>
      </header>

      {/* Download Modal */}
      <DownloadModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
      />
    </>
  );
};
