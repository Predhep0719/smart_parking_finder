import React, { useState, useMemo } from 'react';
import { parseParkingData, RandomForestRegressor } from './data/mlEngine';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { DatasetView } from './components/DatasetView';
import { ModelView } from './components/ModelView';
import { FactorView } from './components/FactorView';
import { PredictView } from './components/PredictView';
import { MonitorView } from './components/MonitorView';
import { AboutView } from './components/AboutView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Parse CSV and train Random Forest model once
  const { records, stats } = useMemo(() => {
    return parseParkingData();
  }, []);

  const { model, metrics, validationItems } = useMemo(() => {
    const rf = new RandomForestRegressor(25, 7, 42);
    const { metrics, validationItems } = rf.fit(records);
    return { model: rf, metrics, validationItems };
  }, [records]);

  const tabTitles: Record<NavTab, string> = {
    dashboard: 'Project Dashboard & Capacity Overview',
    dataset: 'Dataset Analysis & Exploration',
    model: 'Machine Learning Model Performance',
    factors: 'Feature & Factor Association Analysis',
    predict: 'Predict Total Parking Capacity',
    monitor: 'Parking Occupancy Monitor (Sandbox)',
    about: 'About Project & Academic Documentation',
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex">
      {/* Sidebar navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main body area offset for sidebar on lg screens */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Header
          stats={stats}
          onOpenMobile={() => setMobileOpen(true)}
          activeTabTitle={tabTitles[currentTab]}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              records={records}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'dataset' && (
            <DatasetView
              records={records}
              stats={stats}
            />
          )}

          {currentTab === 'model' && (
            <ModelView
              metrics={metrics}
              validationItems={validationItems}
            />
          )}

          {currentTab === 'factors' && (
            <FactorView
              records={records}
            />
          )}

          {currentTab === 'predict' && (
            <PredictView
              records={records}
              model={model}
            />
          )}

          {currentTab === 'monitor' && (
            <MonitorView />
          )}

          {currentTab === 'about' && (
            <AboutView />
          )}
        </main>
      </div>
    </div>
  );
}
