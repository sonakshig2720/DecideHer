import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { InvestmentTable } from './components/InvestmentTable';
import { DepartmentAndBlockers } from './components/DepartmentAndBlockers';
import { AIAdvisorPanel } from './components/AIAdvisorPanel';
import { InitiativeDetailModal } from './components/InitiativeDetailModal';
import { ExportSummaryModal } from './components/ExportSummaryModal';
import { DecideHerLogo } from './components/DecideHerLogo';
import {
  INITIATIVE_CLUSTERS,
  DEPARTMENT_DATA,
  BLOCKER_DATA,
  PORTFOLIO_METRICS,
} from './data/dashboardData';
import { InitiativeCluster } from './types';
import { X, Sparkles } from 'lucide-react';

export default function App() {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedBlocker, setSelectedBlocker] = useState<string | null>(null);
  // Default to showing all current initiatives in the compact table
  const [showAllInitiatives, setShowAllInitiatives] = useState(true);
  const [selectedInitiative, setSelectedInitiative] = useState<InitiativeCluster | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAdvisorDrawerOpen, setIsAdvisorDrawerOpen] = useState(false);

  // Filtered initiatives logic
  const filteredInitiatives = useMemo(() => {
    let list = [...INITIATIVE_CLUSTERS];

    // Filter from metric cards
    if (selectedFilter === 'spans3PlusDepts') {
      list = list.filter((item) => item.spans3PlusDepts);
    } else if (selectedFilter === 'existingSystems') {
      list = list.filter(
        (item) =>
          item.ownedSystemMatch !== null &&
          !item.ownedSystemMatch.toLowerCase().includes('none')
      );
    } else if (selectedFilter === 'needEvidence') {
      list = list.filter((item) => item.needsMoreEvidence);
    }

    // Filter by department
    if (selectedDepartment) {
      list = list.filter(
        (item) =>
          item.departments.includes(selectedDepartment) ||
          item.departments.includes('All') ||
          (selectedDepartment === 'Quality & Legal' &&
            (item.departments.includes('Legal') || item.departments.includes('Quality & Legal')))
      );
    }

    // Filter by blocker
    if (selectedBlocker) {
      list = list.filter((item) => item.primaryBlocker === selectedBlocker);
    }

    // If explicit top 6 mode is requested and no filters
    if (!showAllInitiatives && !selectedFilter && !selectedDepartment && !selectedBlocker) {
      return list.slice(0, 6);
    }

    return list;
  }, [selectedFilter, selectedDepartment, selectedBlocker, showAllInitiatives]);

  const clearAllFilters = () => {
    setSelectedFilter(null);
    setSelectedDepartment(null);
    setSelectedBlocker(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const activeFilterCount =
    (selectedFilter ? 1 : 0) +
    (selectedDepartment ? 1 : 0) +
    (selectedBlocker ? 1 : 0);

  return (
    <div id="decideher-app" className="flex h-screen w-full bg-[#FAF8F5] text-stone-800 overflow-hidden font-sans">
      {/* 2. Main Content Canvas */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Mobile Header Bar */}
        <div className="lg:hidden flex items-center justify-between p-3 bg-[#2A050E] text-white border-b border-[#460D1A] no-print">
          <div className="flex items-center gap-2.5">
            <DecideHerLogo size="sm" variant="dark" withBackground={true} />
          </div>

          <button
            onClick={() => setIsAdvisorDrawerOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#700E22] text-xs font-semibold text-white border border-[#EA580C]/40 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" />
            <span>AI Advisor</span>
          </button>
        </div>

        {/* Executive Header with Download 1-Page PDF action */}
        <Header
          metrics={PORTFOLIO_METRICS}
          onExportClick={() => setIsExportModalOpen(true)}
          onPrintClick={handlePrint}
        />

        {/* Dashboard Workspace */}
        <div className="dashboard-print-container p-3 sm:p-4 lg:p-5 space-y-3 max-w-[1700px] w-full mx-auto">
          {/* Top Metric Cards (47 Improvement reports, 11 AI opportunities, 4 Span 3+ departments, 3 Existing systems, 2 Need evidence) */}
          <MetricCards
            metrics={PORTFOLIO_METRICS}
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
          />

          {/* Recommended Investment Portfolio Table */}
          <div className="w-full">
            <InvestmentTable
              initiatives={filteredInitiatives}
              allInitiativesCount={INITIATIVE_CLUSTERS.length}
              showAll={showAllInitiatives}
              setShowAll={setShowAllInitiatives}
              onSelectInitiative={setSelectedInitiative}
              activeFilter={activeFilterCount > 0 ? `${activeFilterCount} active` : null}
              onClearFilter={clearAllFilters}
              reportsCount={PORTFOLIO_METRICS.reports}
            />
          </div>

          {/* Diagnostic Row: Ideas by Department tile sitting next to Primary Blocker */}
          <div className="w-full">
            <DepartmentAndBlockers
              departments={DEPARTMENT_DATA}
              blockers={BLOCKER_DATA}
              selectedDepartment={selectedDepartment}
              onSelectDepartment={setSelectedDepartment}
              selectedBlocker={selectedBlocker}
              onSelectBlocker={setSelectedBlocker}
              metrics={PORTFOLIO_METRICS}
            />
          </div>
        </div>
      </main>

      {/* 3. Right AI Advisor Column (Visible on ultra-wide / 2xl desktop or collapsible slide drawer) */}
      <aside
        id="desktop-ai-advisor-panel"
        className="hidden 2xl:block w-84 shrink-0 h-screen sticky top-0 border-l border-stone-200 bg-white shadow-xs p-4 no-print"
      >
        <AIAdvisorPanel />
      </aside>

      {/* Floating trigger button for AI advisor on screens without permanent right bar */}
      <div className="2xl:hidden fixed bottom-5 right-5 z-30 no-print">
        <button
          id="floating-advisor-toggle-btn"
          onClick={() => setIsAdvisorDrawerOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#700E22] hover:bg-[#580B1B] text-white font-bold text-xs shadow-lg shadow-[#700E22]/30 transition-all hover:scale-105 active:scale-95 border border-[#EA580C]/40"
        >
          <Sparkles className="w-4 h-4 text-[#F5A623]" />
          <span>Ask AI Advisor</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#EA580C] text-white uppercase">
            Beta
          </span>
        </button>
      </div>

      {/* Slide-over Drawer for AI Advisor on tablet/laptop/mobile */}
      {isAdvisorDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/50 backdrop-blur-xs no-print">
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-[#FBE0E5] flex items-center justify-between bg-[#FFF8F6]">
              <div className="flex items-center gap-2">
                <DecideHerLogo size="sm" variant="color" />
                <span className="text-xs font-bold text-stone-700">AI Advisor</span>
              </div>
              <button
                onClick={() => setIsAdvisorDrawerOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-200 text-stone-500 hover:text-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 p-3 overflow-hidden">
              <AIAdvisorPanel />
            </div>
          </div>
        </div>
      )}

      {/* 4. Modals */}
      <InitiativeDetailModal
        initiative={selectedInitiative}
        onClose={() => setSelectedInitiative(null)}
      />

      <ExportSummaryModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onTriggerPrint={handlePrint}
      />
    </div>
  );
}
