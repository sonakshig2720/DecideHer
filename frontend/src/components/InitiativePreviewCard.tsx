import React from 'react';
import {
  Cpu,
  Database,
  ExternalLink,
  Layers,
  Sparkles,
  Users,
  Workflow,
} from 'lucide-react';
import { InitiativeCluster } from '../types';
import { getOpportunityTitle } from '../utils/opportunityTitle';

interface InitiativePreviewCardProps {
  initiative: InitiativeCluster | null;
  onOpenFullModal: () => void;
}

export const InitiativePreviewCard: React.FC<InitiativePreviewCardProps> = ({
  initiative,
  onOpenFullModal,
}) => {
  if (!initiative) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-6 text-center text-stone-500">
        Select an opportunity from the investment portfolio to view its preview
      </div>
    );
  }

  const getRatingBadge = (val: 'High' | 'Medium' | 'Low') => {
    switch (val) {
      case 'High':
        return (
          <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
            Medium
          </span>
        );
      case 'Low':
        return (
          <span className="rounded border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700">
            Low
          </span>
        );
      default:
        return <span>{val}</span>;
    }
  };

  const blockerDimension = initiative.reports[0]?.rootCauseDerived?.toLowerCase() ?? 'process';
  let BlockerIcon = Workflow;
  let blockerLabel = 'Process';
  let blockerIconColor = 'text-[#4A0415]';
  if (blockerDimension.includes('technology')) {
    BlockerIcon = Cpu;
    blockerLabel = 'Technology';
    blockerIconColor = 'text-[#EA580C]';
  } else if (blockerDimension.includes('people')) {
    BlockerIcon = Users;
    blockerLabel = 'People';
    blockerIconColor = 'text-[#700E22]';
  } else if (blockerDimension.includes('data')) {
    BlockerIcon = Database;
    blockerLabel = 'Data';
    blockerIconColor = 'text-[#D97706]';
  }

  return (
    <div
      id="top-opportunity-preview-screen"
      className="rounded-2xl border-2 border-[#047857] bg-gradient-to-br from-white via-[#F7FFF9] to-[#ECFDF5] p-4 shadow-[0_14px_34px_rgba(4,120,87,0.16)] ring-1 ring-emerald-100 sm:p-5"
    >
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12 lg:gap-6">
        <div className="flex h-full flex-col justify-between space-y-3 lg:col-span-4">
          <div>
            <div className="mb-2 flex items-center justify-between gap-2 flex-wrap">
              <button
                id="top-opportunity-badge-btn"
                onClick={onOpenFullModal}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#047857] bg-[#064E3B] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#A7F3D0] shadow-2xs transition-colors hover:bg-[#022c22]"
                title="Open opportunity details"
              >
                <Sparkles className="h-3 w-3 text-[#6EE7B7]" />
                <span>Top Opportunity</span>
              </button>

              {initiative.spans3PlusDepts && (
                <span className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <Layers className="h-3 w-3" />
                  Cross-functional
                </span>
              )}
            </div>

            <h3 className="text-base font-black leading-snug text-[#047857] sm:text-xl">
              {getOpportunityTitle(initiative)}
            </h3>

            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-stone-500">
              <span className="font-semibold text-stone-700">Depts:</span>
              <span className="truncate">{initiative.departments.join(', ')}</span>
              <span>•</span>
              <span className="font-semibold text-stone-700">{initiative.useCasesCount} use cases</span>
            </div>
          </div>

          <div className="pt-1">
            <button
              id="preview-deep-dive-btn"
              onClick={onOpenFullModal}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#065F46] bg-[#047857] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#065F46] active:scale-95"
            >
              <span>Deep Dive</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Readiness is intentionally positioned before the blocker section. */}
        <div className="flex h-full flex-col justify-between space-y-2.5 lg:col-span-4">
          <div className="rounded-xl border border-emerald-200/90 bg-white/90 p-3">
            <div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-stone-600">
              Organizational Alignment
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <div className="rounded-lg border border-stone-200 bg-white p-1.5 text-center shadow-2xs">
                <div className="mb-0.5 flex items-center justify-center gap-1 text-[10px] font-bold text-stone-600">
                  <Cpu className="h-3 w-3 text-[#EA580C]" /><span>Tech</span>
                </div>
                {getRatingBadge(initiative.readinessBreakdown.technology)}
              </div>
              <div className="rounded-lg border border-stone-200 bg-white p-1.5 text-center shadow-2xs">
                <div className="mb-0.5 flex items-center justify-center gap-1 text-[10px] font-bold text-stone-600">
                  <Users className="h-3 w-3 text-[#700E22]" /><span>People</span>
                </div>
                {getRatingBadge(initiative.readinessBreakdown.people)}
              </div>
              <div className="rounded-lg border border-stone-200 bg-white p-1.5 text-center shadow-2xs">
                <div className="mb-0.5 flex items-center justify-center gap-1 text-[10px] font-bold text-stone-600">
                  <Database className="h-3 w-3 text-[#D97706]" /><span>Data</span>
                </div>
                {getRatingBadge(initiative.readinessBreakdown.data)}
              </div>
              <div className="rounded-lg border border-stone-200 bg-white p-1.5 text-center shadow-2xs">
                <div className="mb-0.5 flex items-center justify-center gap-1 text-[10px] font-bold text-stone-600">
                  <Workflow className="h-3 w-3 text-[#4A0415]" /><span>Process</span>
                </div>
                {getRatingBadge(initiative.readinessBreakdown.process)}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200/80 bg-[#FFFDF9] p-3">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-900">
              <Database className="h-3.5 w-3.5 shrink-0 text-amber-600" />
              <span>Owned System Match</span>
            </div>
            <div className="truncate text-xs font-bold leading-snug text-stone-900">
              {initiative.ownedSystemMatch || 'None identified'}
            </div>
            <p className="mt-1 text-[10px] leading-tight text-stone-500">
              Identified via internal enterprise IT audit and tools licensing
            </p>
          </div>
        </div>

        <div className="flex h-full flex-col justify-between space-y-2.5 lg:col-span-4">
          <div className="rounded-xl border border-amber-200/80 bg-[#FFFDF9] p-3">
            <div className="mb-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-900">
                <BlockerIcon className={`h-3.5 w-3.5 shrink-0 ${blockerIconColor}`} />
                <span>Primary Concern</span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-white px-2 py-0.5 text-[9px] font-bold text-amber-800">
                <BlockerIcon className={`h-3 w-3 ${blockerIconColor}`} />
                {blockerLabel}
              </span>
            </div>
            <div className="text-xs font-bold leading-snug text-amber-950">
              {initiative.primaryBlocker}
            </div>
            <p className="mt-1 text-[10px] leading-tight text-amber-700/80">
              Core obstacle preventing internal team resolution
            </p>
          </div>

          <div className="grid grid-cols-3 gap-1.5 rounded-lg border border-stone-200/60 bg-white/90 p-2 text-center">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-stone-500">Impact</div>
              <div className="mt-0.5">{getRatingBadge(initiative.impact)}</div>
            </div>
            <div className="border-x border-stone-200">
              <div className="text-[9px] font-bold uppercase tracking-wider text-stone-500">Readiness</div>
              <div className="mt-0.5">{getRatingBadge(initiative.readiness)}</div>
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-stone-500">Evidence</div>
              <div className="mt-0.5">{getRatingBadge(initiative.evidence)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
