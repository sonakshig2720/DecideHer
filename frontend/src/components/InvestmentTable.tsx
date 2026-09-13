import React from 'react';
import { InitiativeCluster, ImpactBand, ReadinessBand, EvidenceBand, DecisionType } from '../types';
import { ArrowRight, ChevronRight, Layers, Sparkles, Filter } from 'lucide-react';

interface InvestmentTableProps {
  initiatives: InitiativeCluster[];
  allInitiativesCount: number;
  showAll: boolean;
  setShowAll: (show: boolean) => void;
  onSelectInitiative: (initiative: InitiativeCluster) => void;
  activeFilter: string | null;
  onClearFilter: () => void;
  reportsCount: number;
}

export const InvestmentTable: React.FC<InvestmentTableProps> = ({
  initiatives,
  allInitiativesCount,
  showAll,
  setShowAll,
  onSelectInitiative,
  activeFilter,
  onClearFilter,
  reportsCount,
}) => {
  // Pill badge color mapping for Impact, Readiness, and Evidence:
  // High <Green> | Medium <Yellow> | Low <light red>
  const getRatingBadge = (val: ImpactBand | ReadinessBand | EvidenceBand) => {
    switch (val) {
      case 'High':
        return (
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 min-w-[62px]">
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 min-w-[62px]">
            Medium
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 min-w-[62px]">
            Low
          </span>
        );
      default:
        return <span>{val}</span>;
    }
  };

  // Decision badge styling matching the DecideHer dashboard design
  const getDecisionBadge = (decision: DecisionType) => {
    switch (decision) {
      case 'REDESIGN':
        return (
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-orange-100/80 text-orange-800 border border-orange-300 min-w-[84px] shadow-xs">
            REDESIGN
          </span>
        );
      case 'BUILD':
        return (
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-emerald-100/90 text-emerald-800 border border-emerald-300 min-w-[84px] shadow-xs">
            BUILD
          </span>
        );
      case 'CONSOLIDATE':
        return (
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-indigo-100/90 text-indigo-800 border border-indigo-300 min-w-[84px] shadow-xs">
            CONSOLIDATE
          </span>
        );
      case 'BUY':
        return (
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-sky-100/90 text-sky-800 border border-sky-300 min-w-[84px] shadow-xs">
            BUY
          </span>
        );
      case 'INVESTIGATE':
        return (
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-amber-100/90 text-amber-800 border border-amber-300 min-w-[84px] shadow-xs">
            INVESTIGATE
          </span>
        );
      case 'AVOID':
        return (
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-rose-100/90 text-rose-800 border border-rose-300 min-w-[84px] shadow-xs">
            AVOID
          </span>
        );
      default:
        return <span>{decision}</span>;
    }
  };

  return (
    <div
      id="recommended-investment-portfolio-card"
      className="bg-white rounded-xl border border-[#EFEBE8] shadow-sm overflow-hidden"
    >
      {/* Header bar */}
      <div className="p-3 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-stone-900 tracking-tight">
              Recommended investment portfolio
            </h2>
            {activeFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FDF2F4] text-[#700E22] border border-[#FBE0E5]">
                <Filter className="w-2.5 h-2.5" />
                <span>Filtered ({initiatives.length})</span>
                <button
                  onClick={onClearFilter}
                  className="ml-1 hover:text-stone-950 font-bold"
                  title="Clear filter"
                >
                  ×
                </button>
              </span>
            )}
          </div>
          <p className="text-[10px] text-stone-500 mt-0.2">
            Evaluated by Impact, Readiness and Evidence across {reportsCount} submissions.
          </p>
        </div>

        <button
          id="view-roadmap-toggle-btn"
          onClick={() => setShowAll(!showAll)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#700E22] hover:text-[#EA580C] self-start sm:self-auto shrink-0 transition-colors no-print"
        >
          <span>{showAll ? 'Show top 6 recommendations' : `View full roadmap (${allInitiativesCount})`}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table container */}
      <div className="overflow-x-auto">
        <table
          id="portfolio-initiatives-table"
          className="w-full text-left border-collapse text-xs"
        >
          <thead>
            <tr className="border-b border-stone-200 bg-[#FAF8F6] text-stone-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-1.5 px-3 w-8 text-center">#</th>
              <th className="py-1.5 px-3 min-w-[190px]">Initiative / theme</th>
              <th className="py-1.5 px-3 min-w-[160px]">Departments</th>
              <th className="py-1.5 px-2.5 text-center min-w-[75px]"># Use cases</th>
              {/* The requested 3 columns: Impact, Readiness, Evidence */}
              <th className="py-1.5 px-2.5 text-center min-w-[80px]">Impact</th>
              <th className="py-1.5 px-2.5 text-center min-w-[80px]">Readiness</th>
              <th className="py-1.5 px-2.5 text-center min-w-[80px]">Evidence</th>
              <th className="py-1.5 px-2 w-7 no-print"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {initiatives.map((item) => (
              <tr
                key={item.id}
                id={`initiative-row-${item.id}`}
                onClick={() => onSelectInitiative(item)}
                className="hover:bg-[#FCF9F7] cursor-pointer transition-colors group"
              >
                {/* Index # */}
                <td className="py-1.5 px-3 font-bold text-stone-600 text-center text-xs">
                  {item.id}
                </td>

                {/* Initiative / theme name */}
                <td className="py-1.5 px-3">
                  <div className="font-bold text-stone-900 group-hover:text-[#700E22] transition-colors text-xs leading-snug">
                    {item.name}
                  </div>
                  {item.spans3PlusDepts && (
                    <div className="flex items-center gap-1 text-[9px] text-[#B45309] font-bold mt-0.5">
                      <Layers className="w-2.5 h-2.5" />
                      <span>Span 3+ departments</span>
                    </div>
                  )}
                </td>

                {/* Departments pills */}
                <td className="py-1.5 px-3">
                  <div className="flex flex-wrap items-center gap-1">
                    {item.departments.map((dept, idx) => (
                      <span
                        key={idx}
                        className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                          dept === 'All'
                            ? 'bg-[#FDF2F4] text-[#700E22] border border-[#FBE0E5]'
                            : dept.startsWith('+')
                            ? 'bg-stone-100 text-stone-600 border border-stone-200'
                            : 'bg-stone-50 text-stone-700 border border-stone-200/80'
                        }`}
                      >
                        {dept}
                      </span>
                    ))}
                  </div>
                </td>

                {/* # Use cases */}
                <td className="py-1.5 px-2.5 text-center font-extrabold text-stone-800 text-xs">
                  {item.useCasesCount}
                </td>

                {/* Impact: High <Green> | Medium <Yellow> | Low <light red> */}
                <td className="py-1.5 px-2.5 text-center">
                  {getRatingBadge(item.impact)}
                </td>

                {/* Readiness: High <Green> | Medium <Yellow> | Low <light red> */}
                <td className="py-1.5 px-2.5 text-center">
                  {getRatingBadge(item.readiness)}
                </td>

                {/* Evidence: High <Green> | Medium <Yellow> | Low <light red> */}
                <td className="py-1.5 px-2.5 text-center">
                  {getRatingBadge(item.evidence)}
                </td>

                {/* Right arrow inspect */}
                <td className="py-1.5 px-2 text-right no-print">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-[#700E22] transition-colors" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer helper note */}
      <div className="py-2 px-4 bg-stone-50/50 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500 no-print">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#700E22]" />
          <span>Formulaic scoring of {reportsCount} reports (Impact ≥22 High, Readiness = lowest of 4 dimensions).</span>
        </div>
        <span className="font-medium text-stone-600">Click row to inspect</span>
      </div>
    </div>
  );
};
