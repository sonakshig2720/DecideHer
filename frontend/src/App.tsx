import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { PrimaryBottleneckCard } from './components/PrimaryBottleneckCard';
import { InvestmentTable } from './components/InvestmentTable';
import { InitiativePreviewCard } from './components/InitiativePreviewCard';
import { MetricCards } from './components/MetricCards';
import { IdeasByDepartmentCard } from './components/IdeasByDepartmentCard';
import { AIAdvisorPanel } from './components/AIAdvisorPanel';
import { InitiativeDetailModal } from './components/InitiativeDetailModal';
import { ExportSummaryModal } from './components/ExportSummaryModal';
import {
  INITIATIVE_CLUSTERS,
  DEPARTMENT_DATA,
  BLOCKER_DATA,
  PORTFOLIO_METRICS,
} from './data/dashboardData';
import { InitiativeCluster } from './types';
import { Sparkles, X } from 'lucide-react';

type AppView = 'home' | 'dashboard';

const initialView = (): AppView => {
  return new URLSearchParams(window.location.search).get('view') === 'dashboard'
    ? 'dashboard'
    : 'home';
};

export default function App() {
  const [currentView] = useState<AppView>(initialView);

  // Dashboard-specific navigation & filter states
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedBlocker, setSelectedBlocker] = useState<string | null>(null);
  const [showAllInitiatives, setShowAllInitiatives] = useState(false);

  // Top opportunity preview selection (defaults to the highest-ranked opportunity)
  const [previewInitiative, setPreviewInitiative] = useState<InitiativeCluster | null>(
    INITIATIVE_CLUSTERS[0] ?? null
  );
  // Detailed modal deep-dive
  const [selectedInitiative, setSelectedInitiative] = useState<InitiativeCluster | null>(null);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAdvisorDrawerOpen, setIsAdvisorDrawerOpen] = useState(false);

  // Filtered initiatives logic for the dashboard
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
      list = list.filter((item) => {
        if (item.primaryBlocker.toLowerCase().includes(selectedBlocker.toLowerCase())) {
          return true;
        }
        if (item.blockerDistribution && item.blockerDistribution[selectedBlocker]) {
          return true;
        }
        return false;
      });
    }

    if (!showAllInitiatives && !selectedFilter && !selectedDepartment && !selectedBlocker) {
      return list.slice(0, 5);
    }

    return list;
  }, [selectedFilter, selectedDepartment, selectedBlocker, showAllInitiatives]);

  // Ensure active preview initiative points to a valid item or top of filtered list
  const activePreview = useMemo(() => {
    if (previewInitiative && filteredInitiatives.some((i) => i.id === previewInitiative.id)) {
      return previewInitiative;
    }
    return filteredInitiatives[0] ?? INITIATIVE_CLUSTERS[0] ?? null;
  }, [filteredInitiatives, previewInitiative]);

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

  // If current view is Home page
  if (currentView === 'home') {
    return (
      <HomePage
        metrics={PORTFOLIO_METRICS}
      />
    );
  }

  // Otherwise, render the Executive Dashboard view
  return (
    <div id="decideher-dashboard" className="min-h-screen w-full bg-[#FAF8F5] text-stone-800 font-sans flex flex-col">
      {/* 1. Header with Left Hand Navigation as a small dropdown, Headline running across top of page, and actions */}
      <Header
        metrics={PORTFOLIO_METRICS}
        showAllInitiatives={showAllInitiatives}
        onExportClick={() => setIsExportModalOpen(true)}
        onPrintClick={handlePrint}
      />

      {/* 2. Main Executive Dashboard Workspace */}
      <main className="flex-1 w-full max-w-[1780px] mx-auto p-3 sm:p-4 lg:p-5 space-y-4">
        {/* Step 1: highlighted top opportunity */}
        <div id="top-initiative-section">
          <InitiativePreviewCard
            initiative={activePreview}
            onOpenFullModal={() => activePreview && setSelectedInitiative(activePreview)}
          />
        </div>

        {/* Step 2: Recommended Investment Portfolio + Bottleneck Tile side-by-side (swapped placement) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
          {/* Left: Recommended Investment Portfolio Table */}
          <div className="xl:col-span-7 2xl:col-span-8 flex flex-col">
            <InvestmentTable
              initiatives={filteredInitiatives}
              allInitiativesCount={INITIATIVE_CLUSTERS.length}
              showAll={showAllInitiatives}
              setShowAll={setShowAllInitiatives}
              selectedInitiativeId={activePreview?.id}
              onSelectInitiative={(initiative) => setPreviewInitiative(initiative)}
              activeFilter={activeFilterCount > 0 ? `${activeFilterCount} active` : null}
              onClearFilter={clearAllFilters}
              reportsCount={PORTFOLIO_METRICS.reports}
            />
          </div>

          {/* Right: Primary Bottleneck finding tile (moved into the grid position beside table) */}
          <div className="xl:col-span-5 2xl:col-span-4 flex flex-col">
            <PrimaryBottleneckCard
              blockers={BLOCKER_DATA}
              metrics={PORTFOLIO_METRICS}
              selectedBlocker={selectedBlocker}
              onSelectBlocker={setSelectedBlocker}
            />
          </div>
        </div>

        {/* Step 3: Top five horizontal tiles + Department distribution at bottom of page */}
        <div className="space-y-3 pt-1 border-t border-stone-200/60">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Diagnostic &amp; Summary Overview ({PORTFOLIO_METRICS.reports} Employee Submissions)
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-[10px] font-bold text-[#700E22] hover:underline"
              >
                Clear all active filters ({activeFilterCount})
              </button>
            )}
          </div>

          {/* The top five horizontal tiles at bottom */}
          <MetricCards
            metrics={PORTFOLIO_METRICS}
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
          />

          {/* Department distribution donut and breakdown */}
          <div className="pt-1">
            <IdeasByDepartmentCard
              departments={DEPARTMENT_DATA}
              selectedDepartment={selectedDepartment}
              onSelectDepartment={setSelectedDepartment}
            />
          </div>
        </div>
      </main>

      {/* Floating trigger button for AI advisor */}
      <div className="fixed bottom-5 right-5 z-30 no-print">
        <button
          id="floating-advisor-toggle-btn"
          onClick={() => setIsAdvisorDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#700E22] hover:bg-[#580B1B] text-white font-bold text-xs shadow-lg shadow-[#700E22]/30 transition-all hover:scale-105 active:scale-95 border border-[#EA580C]/40"
        >
          <Sparkles className="w-4 h-4 text-[#F5A623]" />
          <span>Ask AI Advisor</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#EA580C] text-white uppercase">
            Sonaki
          </span>
        </button>
      </div>

      {/* Slide-over Drawer for AI Advisor */}
      {isAdvisorDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/50 backdrop-blur-xs no-print">
          <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col border-l border-stone-200 animate-in slide-in-from-right duration-200">
            <div className="p-3.5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#700E22] text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#F5A623]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">
                    Sonaki Transformation Advisor
                  </div>
                  <div className="text-[10px] text-stone-500">
                    Grounded on {PORTFOLIO_METRICS.reports} employee reports &amp;{' '}
                    {Math.min(5, PORTFOLIO_METRICS.opportunities)} top opportunities
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsAdvisorDrawerOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AIAdvisorPanel />
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal for Selected Initiative */}
      {selectedInitiative && (
        <InitiativeDetailModal
          initiative={selectedInitiative}
          onClose={() => setSelectedInitiative(null)}
        />
      )}

      <ExportSummaryModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onTriggerPrint={handlePrint}
      />
    </div>
  );
}
