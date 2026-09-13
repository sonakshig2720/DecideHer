import React from 'react';
import { Download, Printer } from 'lucide-react';
import { DecideHerLogo } from './DecideHerLogo';
import { TopNavigation } from './TopNavigation';
import { PortfolioMetrics } from '../types';

interface HeaderProps {
  metrics: PortfolioMetrics;
  showAllInitiatives: boolean;
  onExportClick: () => void;
  onPrintClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  metrics,
  showAllInitiatives,
  onExportClick,
  onPrintClick,
}) => {
  const topOpportunityCount = Math.min(5, metrics.opportunities);
  const dashboardTitle = showAllInitiatives
    ? 'All AI opportunities for Sonaki GmbH'
    : `Top ${topOpportunityCount} AI opportunities for Sonaki GmbH`;

  const handleDirectPrint = () => {
    if (onPrintClick) {
      onPrintClick();
    } else {
      window.print();
    }
  };

  return (
    <header
      id="executive-header"
      className="border-b border-[#F0ECE9] bg-white sticky top-0 z-30 shadow-2xs"
    >
      {/* Dedicated Print-Only Header Banner */}
      <div className="hidden print:flex items-center justify-between p-4 border-b border-stone-200">
        <DecideHerLogo size="sm" variant="color" withBackground={true} />
        <div className="text-right">
          <div className="text-xs font-bold text-stone-900">
            {dashboardTitle}
          </div>
          <div className="text-[10px] text-stone-500">
            {metrics.reports} input reports to a prioritised, cross-functional transformation roadmap
          </div>
        </div>
      </div>

      <TopNavigation activePage="dashboard" />

      {/* Dashboard-only tools remain below the shared navigation bar. */}
      <div className="bg-white py-2 px-4 lg:px-6 border-b border-stone-200 flex items-center justify-end gap-2 shadow-xs no-print">
        <div className="flex items-center flex-wrap justify-end gap-2 shrink-0">
          {/* Download 1-Page PDF / Print Button */}
          <button
            id="download-1page-btn"
            onClick={handleDirectPrint}
            title="Download or print the entire executive dashboard formatted strictly to 1 page"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#F5A623] hover:bg-[#E09612] text-stone-900 text-xs font-bold transition-all shadow-xs hover:shadow active:scale-95 border border-[#D97706]"
          >
            <Printer className="w-3.5 h-3.5 text-stone-900" />
            <span>Download 1-Page PDF</span>
          </button>

          {/* Export Summary Modal Button */}
          <button
            id="export-summary-btn"
            onClick={onExportClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-all shadow-2xs active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Export Brief</span>
          </button>
        </div>
      </div>

      {/* 2. Full-Width Headline Running Across the Top of the Page */}
      <div
        id="headline-across-top-of-page"
        className="px-4 lg:px-6 py-3.5 sm:py-4 bg-[#FAF8F6] border-t border-stone-100"
      >
        <div className="max-w-[1780px] mx-auto">
          <h1
            id="main-dashboard-title"
            className="text-xl sm:text-2xl lg:text-3xl font-black text-stone-900 tracking-tight leading-snug"
          >
            {dashboardTitle}
          </h1>
          <p
            id="main-dashboard-subtitle"
            className="text-xs sm:text-sm text-stone-600 font-medium mt-0.5"
          >
            {metrics.reports} input reports to a prioritised, cross-functional transformation roadmap
          </p>
        </div>
      </div>
    </header>
  );
};
