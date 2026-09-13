import React from 'react';
import { BlockerSummary, PortfolioMetrics } from '../types';
import { ShieldAlert, AlertOctagon, Filter } from 'lucide-react';

interface PrimaryBottleneckCardProps {
  blockers: BlockerSummary[];
  metrics: PortfolioMetrics;
  selectedBlocker: string | null;
  onSelectBlocker: (blocker: string | null) => void;
}

export const PrimaryBottleneckCard: React.FC<PrimaryBottleneckCardProps> = ({
  blockers,
  metrics,
  selectedBlocker,
  onSelectBlocker,
}) => {
  const primary = metrics.primaryBlocker;

  return (
    <div
      id="primary-bottleneck-finding-card"
      className="bg-gradient-to-b from-[#FFF8F6] via-[#FFFDFD] to-white rounded-xl border border-[#FBE0E5] shadow-xs p-4 flex flex-col justify-between h-full"
    >
      <div>
        {/* Header & Core Statistic */}
        <div className="pb-3 border-b border-[#FBE0E5]/70">
          <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#700E22] bg-[#FDF2F4] px-2 py-0.5 rounded border border-[#FBE0E5]">
              <ShieldAlert className="w-3 h-3 text-[#EA580C]" />
              Primary Bottleneck Finding
            </span>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              {primary.count} of {metrics.reports} reports ({primary.percentage}%)
            </span>
          </div>

          <h2 className="text-sm sm:text-base font-bold text-stone-900 leading-snug">
            Primary blocker: {primary.count} reports cite &quot;{primary.blocker}&quot;
          </h2>

          <div className="mt-2 p-2 rounded-lg bg-white border border-rose-200/80 text-xs text-stone-700 flex items-start gap-2">
            <AlertOctagon className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
            <div className="text-[11px] leading-snug">
              <span className="font-bold text-stone-900">Executive takeaway:</span>{' '}
              {primary.significance || 'Validate ownership and evidence before software deployment.'}
            </div>
          </div>
        </div>

        {/* Narrative Finding */}
        <div className="py-2.5 text-xs text-stone-600 leading-relaxed space-y-1.5">
          <p>
            In <strong className="text-stone-900">{primary.percentage}% of employee submissions</strong>, the leading reported constraint is{' '}
            <span className="text-[#700E22] font-semibold">
              &quot;{primary.blocker}&quot;
            </span>
            . Resolve or validate this constraint before committing to an AI investment.
          </p>
        </div>
      </div>

      {/* Blocker Breakdown & Filter Controls */}
      <div className="pt-2 border-t border-stone-100">
        <div className="flex items-center justify-between text-[10px] font-bold text-stone-600 mb-2">
          <span className="flex items-center gap-1">
            <Filter className="w-3 h-3 text-stone-400" />
            <span>Filter portfolio by reported blocker:</span>
          </span>
          {selectedBlocker && (
            <button
              onClick={() => onSelectBlocker(null)}
              className="text-[10px] text-[#700E22] hover:underline font-bold"
            >
              Clear filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {blockers.map((b) => {
            const isSelected = selectedBlocker === b.blocker;
            return (
              <button
                key={b.blocker}
                id={`top-blocker-chip-${b.blocker.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onSelectBlocker(isSelected ? null : b.blocker)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                  isSelected
                    ? 'bg-[#700E22] text-white border-[#700E22] shadow-xs scale-102'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-[#EA580C]/50 hover:bg-[#FFFDFD]'
                }`}
              >
                <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                  {b.count}
                </span>
                <span className={`text-[9px] truncate w-full leading-tight font-medium ${isSelected ? 'text-rose-100' : 'text-stone-500'}`}>
                  {b.blocker}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
