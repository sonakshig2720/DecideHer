import React from 'react';
import { FileText, Network, GitMerge, Database, AlertCircle } from 'lucide-react';
import { PortfolioMetrics } from '../types';

interface MetricCardsProps {
  metrics: PortfolioMetrics;
  selectedFilter: string | null;
  onSelectFilter: (filter: string | null) => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  metrics,
  selectedFilter,
  onSelectFilter,
}) => {
  const cards = [
    {
      id: 'all_reports',
      icon: FileText,
      iconBg: 'bg-[#FDF2F4] text-[#700E22] border-[#FBE0E5]',
      value: metrics.reports,
      title: 'Improvement reports',
      subtitle: `from ${metrics.departments} departments`,
      filterKey: 'all',
    },
    {
      id: 'ai_opportunities',
      icon: Network,
      iconBg: 'bg-[#FFF7ED] text-[#EA580C] border-[#FFEDD5]',
      value: metrics.opportunities,
      title: 'AI opportunities',
      subtitle: '(consolidated themes)',
      filterKey: 'all',
    },
    {
      // "4 Span 3+ departments"
      id: 'span_departments',
      icon: GitMerge,
      iconBg: 'bg-[#FEFCE8] text-[#D97706] border-[#FEF08A]',
      value: metrics.crossFunctional,
      title: 'Span 3+ departments',
      subtitle: '(cross-functional clusters)',
      filterKey: 'spans3PlusDepts',
      highlightBadge: 'Cross-functional',
    },
    {
      id: 'existing_systems',
      icon: Database,
      iconBg: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
      value: metrics.existingSystems,
      title: 'May use existing systems',
      subtitle: '(e.g. CRM, ERP, M365)',
      filterKey: 'existingSystems',
    },
    {
      id: 'need_evidence',
      icon: AlertCircle,
      iconBg: 'bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2]',
      value: metrics.needEvidence,
      title: 'Need more evidence',
      subtitle: '(investigate next)',
      filterKey: 'needEvidence',
    },
  ];

  return (
    <div
      id="metric-cards-row"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = selectedFilter === card.filterKey;

        return (
          <div
            key={card.id}
            id={`metric-card-${card.id}`}
            onClick={() => {
              if (card.filterKey === 'all') {
                onSelectFilter(null);
              } else {
                onSelectFilter(isSelected ? null : card.filterKey);
              }
            }}
            className={`relative p-3 sm:p-3.5 rounded-xl border bg-white transition-all cursor-pointer select-none hover:shadow-sm ${
              isSelected
                ? 'border-[#700E22] ring-2 ring-[#700E22]/20 shadow-sm bg-[#FFFDFE]'
                : 'border-[#EFEBE8] hover:border-[#D5CDC7]'
            }`}
          >
            {card.highlightBadge && (
              <span className="absolute top-2 right-2 text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                {card.highlightBadge}
              </span>
            )}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${card.iconBg}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-black text-stone-900 leading-none tracking-tight">
                  {card.value}
                </div>
                <div className="text-[11px] sm:text-xs font-bold text-stone-800 mt-1 leading-none truncate">
                  {card.title}
                </div>
                <div className="text-[10px] text-stone-500 font-normal leading-tight mt-0.5 truncate">
                  {card.subtitle}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
