import React from 'react';
import { 
  LayoutDashboard, 
  Database, 
  Cpu, 
  BarChart3, 
  Sparkles, 
  Activity, 
  Info,
  CarFront
} from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'dataset' 
  | 'model' 
  | 'factors' 
  | 'predict' 
  | 'monitor' 
  | 'about';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      desc: 'Dataset metrics & overview',
    },
    {
      id: 'dataset',
      label: 'Dataset Analysis',
      icon: <Database className="w-4 h-4" />,
      desc: 'EDA, filters & export',
    },
    {
      id: 'model',
      label: 'Model Performance',
      icon: <Cpu className="w-4 h-4" />,
      desc: 'MAE, RMSE, R² validation',
    },
    {
      id: 'factors',
      label: 'Factor Analysis',
      icon: <BarChart3 className="w-4 h-4" />,
      desc: 'Feature associations',
    },
    {
      id: 'predict',
      label: 'Predict Capacity',
      icon: <Sparkles className="w-4 h-4" />,
      desc: 'ML inference engine',
    },
    {
      id: 'monitor',
      label: 'Parking Monitor',
      icon: <Activity className="w-4 h-4" />,
      desc: 'Telemetry simulation demo',
    },
    {
      id: 'about',
      label: 'About Project',
      icon: <Info className="w-4 h-4" />,
      desc: 'Academic architecture',
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0c1427] border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out
        lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand header */}
        <div className="h-16 px-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <CarFront className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                Smart Parking <span className="text-cyan-400">ML</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">College DS Project</div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </div>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 group
                  ${isActive 
                    ? 'bg-cyan-500/10 text-cyan-300 font-medium border border-cyan-500/30 shadow-xs' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent'}
                `}
              >
                <span className={`transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium leading-none mb-1">{item.label}</div>
                  <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Academic context box */}
        <div className="p-4 m-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300">
          <div className="text-cyan-400 font-medium mb-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            Scope Notice
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px] mb-0">
            Predicts <strong>structural capacity</strong> using historical records. Live spot vacancy requires dedicated hardware sensors.
          </p>
        </div>
      </aside>
    </>
  );
};
