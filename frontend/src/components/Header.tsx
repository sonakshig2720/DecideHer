import React from 'react';
import { Download, Printer, FileText, CheckCircle2 } from 'lucide-react';
import { DecideHerLogo } from './DecideHerLogo';
import { PortfolioMetrics } from '../types';

interface HeaderProps {
  metrics: PortfolioMetrics;
  onExportClick: () => void;
  onPrintClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ metrics, onExportClick, onPrintClick }) => {
  const handleDirectPrint = () => {
    if (onPrintClick) {
      onPrintClick();
    } else {
      window.print();
    }
  };

  return (
    <header id="executive-header" className="py-2.5 sm:py-3 px-4 lg:px-6 border-b border-[#F0ECE9] bg-white/90 backdrop-blur-sm">
      {/* Dedicated Print-Only Header Banner (visible only in downloaded/printed 1-page output) */}
      <div className="hidden print:flex items-center justify-between pb-2 mb-1.5 border-b border-stone-200">
        <DecideHerLogo size="sm" variant="color" />
        <div className="text-right">
          <div className="text-xs font-bold text-stone-900">
            Executive AI Investment Portfolio (1-Page Brief)
          </div>
          <div className="text-[10px] text-stone-500">
            DecideHer • {metrics.reports} Verified Improvement Submissions
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5">
        {/* Left Title & Scope */}
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span
              id="view-category-badge"
              className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider text-[#700E22] bg-[#FDF2F4] px-2 py-0.5 rounded-md border border-[#FBE0E5] uppercase"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
              Executive view • 1-Page Summary
            </span>
            <span className="text-[10px] text-stone-400 font-medium">
              Live anonymized pipeline
            </span>
          </div>

          <h1
            id="main-dashboard-title"
            className="text-lg sm:text-xl font-black text-stone-900 tracking-tight leading-snug"
          >
            Turn employee ideas into smart AI investments
          </h1>
          <p
            id="main-dashboard-subtitle"
            className="text-[11px] text-stone-600 font-normal mt-0.2"
          >
            From <span className="font-bold text-stone-800">{metrics.reports} input reports</span> to a prioritized, evidence-backed transformation roadmap.
          </p>
        </div>

        {/* Right Actions & Download Buttons */}
        <div className="flex items-center flex-wrap gap-2.5 shrink-0 no-print">
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-stone-500 font-medium bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-stone-400">Updated:</span> live pipeline output
          </div>

          {/* Download 1-Page PDF / Print Button */}
          <button
            id="download-1page-btn"
            onClick={handleDirectPrint}
            title="Download or print the entire executive dashboard formatted strictly to 1 page"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#700E22] hover:bg-[#580B1B] text-white text-xs font-bold transition-all shadow-sm hover:shadow active:scale-95 border border-[#4D0A18]"
          >
            <Printer className="w-3.5 h-3.5 text-[#F5A623]" />
            <span>Download 1-Page PDF</span>
          </button>

          {/* Export Summary Modal Button */}
          <button
            id="export-summary-btn"
            onClick={onExportClick}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-all shadow-xs active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Export Brief</span>
          </button>
        </div>
      </div>
    </header>
  );
};
