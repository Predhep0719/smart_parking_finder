import React, { useState, useMemo } from 'react';
import { ParkingRecord, DatasetStats } from '../data/types';
import { 
  Download, 
  Search, 
  Filter, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface DatasetViewProps {
  records: ParkingRecord[];
  stats: DatasetStats;
}

export const DatasetView: React.FC<DatasetViewProps> = ({ records, stats }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedOwnership, setSelectedOwnership] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;

  // Vocabularies
  const states = useMemo(() => Array.from(new Set(records.map((r) => r.state))).sort(), [records]);
  const types = useMemo(() => Array.from(new Set(records.map((r) => r.propertyType))).sort(), [records]);
  const statuses = useMemo(() => Array.from(new Set(records.map((r) => r.status))).sort(), [records]);
  const ownerships = useMemo(() => Array.from(new Set(records.map((r) => r.ownership))).sort(), [records]);
  
  // Available cities dependent on state or all
  const cities = useMemo(() => {
    let pool = records;
    if (selectedState !== 'ALL') {
      pool = pool.filter((r) => r.state === selectedState);
    }
    return Array.from(new Set(pool.map((r) => r.city))).sort();
  }, [records, selectedState]);

  // Filter pipeline
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedState !== 'ALL' && r.state !== selectedState) return false;
      if (selectedCity !== 'ALL' && r.city !== selectedCity) return false;
      if (selectedType !== 'ALL' && r.propertyType !== selectedType) return false;
      if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;
      if (selectedOwnership !== 'ALL' && r.ownership !== selectedOwnership) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCity = r.city.toLowerCase().includes(q);
        const matchesState = r.state.toLowerCase().includes(q);
        const matchesType = r.propertyType.toLowerCase().includes(q);
        if (!matchesCity && !matchesState && !matchesType) return false;
      }
      return true;
    });
  }, [records, selectedState, selectedCity, selectedType, selectedStatus, selectedOwnership, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / rowsPerPage));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRecords.slice(start, start + rowsPerPage);
  }, [filteredRecords, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedState('ALL');
    setSelectedCity('ALL');
    setSelectedType('ALL');
    setSelectedStatus('ALL');
    setSelectedOwnership('ALL');
    setCurrentPage(1);
  };

  const handleExportCsv = () => {
    const headers = ['Bldg City', 'Bldg State', 'Bldg Status', 'Property Type', 'Total Parking Spaces', 'Owned/Leased'];
    const rows = filteredRecords.map((r) => [
      `"${r.city}"`,
      `"${r.state}"`,
      `"${r.status}"`,
      `"${r.propertyType}"`,
      r.totalSpaces,
      `"${r.ownership}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Filtered_Parking_Data_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header and export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Dataset Analysis & Explorer</h2>
          <p className="text-xs text-slate-400">
            Exploratory data analysis (EDA), data cleaning inspection, and filtered tabular subset export.
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export Filtered CSV ({filteredRecords.length})</span>
        </button>
      </div>

      {/* Dataset Health & Quality Checks */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-400">Data Cleansing</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">{stats.totalRecords} Rows</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Whitespace stripped, types cast</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-400">Missing Values</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">0 Nulls</div>
          <div className="text-[10px] text-slate-400 mt-0.5">100% complete records</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-400">Shared Tuples</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">{stats.duplicateCount} Duplicate Signatures</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Repeated campus complexes</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-400">Target Bounds</span>
            <span className="text-[10px] text-cyan-400 font-mono">Continuous</span>
          </div>
          <div className="text-xl font-bold text-cyan-400 font-mono">0 - {stats.maxSpaces}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Min to max parking spaces</div>
        </div>
      </div>

      {/* Feature Metadata Summary */}
      <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
          Feature Schema & Data Dictionary
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2 font-medium">Column Name</th>
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium">Data Type</th>
                <th className="pb-2 font-medium">Unique Count</th>
                <th className="pb-2 font-medium">Missing</th>
                <th className="pb-2 font-medium">Preprocessing Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2.5 font-mono text-cyan-300">Bldg City</td>
                <td className="py-2.5 text-slate-400">Predictor (X)</td>
                <td className="py-2.5 font-mono text-slate-400">string</td>
                <td className="py-2.5 font-mono">{stats.uniqueCities}</td>
                <td className="py-2.5 text-emerald-400 font-mono">0 (0%)</td>
                <td className="py-2.5 text-slate-400">Upper-cased, trimmed, smoothed target encoding</td>
              </tr>
              <tr>
                <td className="py-2.5 font-mono text-cyan-300">Bldg State</td>
                <td className="py-2.5 text-slate-400">Predictor (X)</td>
                <td className="py-2.5 font-mono text-slate-400">string</td>
                <td className="py-2.5 font-mono">{stats.uniqueStates}</td>
                <td className="py-2.5 text-emerald-400 font-mono">0 (0%)</td>
                <td className="py-2.5 text-slate-400">Standardized uppercase, One-Hot encoded</td>
              </tr>
              <tr>
                <td className="py-2.5 font-mono text-cyan-300">Bldg Status</td>
                <td className="py-2.5 text-slate-400">Predictor (X)</td>
                <td className="py-2.5 font-mono text-slate-400">string</td>
                <td className="py-2.5 font-mono">{stats.uniqueStatuses}</td>
                <td className="py-2.5 text-emerald-400 font-mono">0 (0%)</td>
                <td className="py-2.5 text-slate-400">ACTIVE, EXCESS, DECOMMISSIONED (One-Hot)</td>
              </tr>
              <tr>
                <td className="py-2.5 font-mono text-cyan-300">Property Type</td>
                <td className="py-2.5 text-slate-400">Predictor (X)</td>
                <td className="py-2.5 font-mono text-slate-400">string</td>
                <td className="py-2.5 font-mono">{stats.uniquePropertyTypes}</td>
                <td className="py-2.5 text-emerald-400 font-mono">0 (0%)</td>
                <td className="py-2.5 text-slate-400">BUILDING, STRUCTURE, LAND (One-Hot)</td>
              </tr>
              <tr>
                <td className="py-2.5 font-mono text-cyan-300">Owned/Leased</td>
                <td className="py-2.5 text-slate-400">Predictor (X)</td>
                <td className="py-2.5 font-mono text-slate-400">string</td>
                <td className="py-2.5 font-mono">{stats.uniqueOwnerships}</td>
                <td className="py-2.5 text-emerald-400 font-mono">0 (0%)</td>
                <td className="py-2.5 text-slate-400">OWNED, LEASED (One-Hot binary)</td>
              </tr>
              <tr>
                <td className="py-2.5 font-mono text-amber-300 font-bold">Total Parking Spaces</td>
                <td className="py-2.5 text-amber-400 font-semibold">Target (y)</td>
                <td className="py-2.5 font-mono text-slate-400">int64</td>
                <td className="py-2.5 font-mono">Continuous</td>
                <td className="py-2.5 text-emerald-400 font-mono">0 (0%)</td>
                <td className="py-2.5 text-slate-400">Cleaned non-negative integers (min 0, max 1,688)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter Bar Controls */}
      <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by city, state, type..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 w-full md:w-auto justify-between md:justify-end">
            <span>
              Showing <strong className="text-white font-mono">{filteredRecords.length}</strong> of {records.length} records
            </span>
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 transition-colors text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-1">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-medium block mb-1">State</label>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedCity('ALL');
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500"
            >
              <option value="ALL">All States ({states.length})</option>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-medium block mb-1">City</label>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500"
            >
              <option value="ALL">All Cities ({cities.length})</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-medium block mb-1">Property Type</label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500"
            >
              <option value="ALL">All Types ({types.length})</option>
              {types.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-medium block mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500"
            >
              <option value="ALL">All Statuses ({statuses.length})</option>
              {statuses.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-medium block mb-1">Ownership</label>
            <select
              value={selectedOwnership}
              onChange={(e) => {
                setSelectedOwnership(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500"
            >
              <option value="ALL">All Ownerships ({ownerships.length})</option>
              {ownerships.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dataset Records Table */}
      <div className="rounded-xl bg-[#0f172a] border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-medium">
                <th className="py-3 px-4"># ID</th>
                <th className="py-3 px-4">Bldg City</th>
                <th className="py-3 px-4">Bldg State</th>
                <th className="py-3 px-4">Bldg Status</th>
                <th className="py-3 px-4">Property Type</th>
                <th className="py-3 px-4">Owned/Leased</th>
                <th className="py-3 px-4 text-right">Total Parking Spaces</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-slate-400 text-[11px]">{r.id}</td>
                    <td className="py-2.5 px-4 font-medium text-white">{r.city}</td>
                    <td className="py-2.5 px-4 font-mono text-cyan-300">{r.state}</td>
                    <td className="py-2.5 px-4 text-slate-400">{r.status}</td>
                    <td className="py-2.5 px-4 text-slate-300">{r.propertyType}</td>
                    <td className="py-2.5 px-4">
                      <span className={r.ownership === 'OWNED' ? 'text-blue-400 font-medium' : 'text-slate-400'}>
                        {r.ownership}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-cyan-400">
                      {r.totalSpaces}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No records found matching the active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-3 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Page <span className="font-mono text-white">{currentPage}</span> of{' '}
              <span className="font-mono text-white">{totalPages}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
