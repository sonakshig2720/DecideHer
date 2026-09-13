import React, { useState } from 'react';
import { DepartmentSummary, BlockerSummary } from '../types';
import { PortfolioMetrics } from '../types';
import { ShieldAlert, Info, RotateCcw } from 'lucide-react';

interface DepartmentAndBlockersProps {
  departments: DepartmentSummary[];
  blockers: BlockerSummary[];
  selectedDepartment: string | null;
  onSelectDepartment: (deptName: string | null) => void;
  onSelectBlocker: (blocker: string | null) => void;
  selectedBlocker: string | null;
  metrics: PortfolioMetrics;
}

export const DepartmentAndBlockers: React.FC<DepartmentAndBlockersProps> = ({
  departments,
  blockers,
  selectedDepartment,
  onSelectDepartment,
  onSelectBlocker,
  selectedBlocker,
  metrics,
}) => {
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);
  const totalUseCases = departments.reduce((acc, d) => acc + d.count, 0);
  const secondaryBlockers = blockers
    .filter((blocker) => blocker.blocker !== metrics.primaryBlocker.blocker && blocker.count > 0)
    .sort((left, right) => right.count - left.count)
    .slice(0, 2);
  const rootCauseGaps = (Object.entries(metrics.rootCauseGap) as Array<[string, number]>)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 2);

  // Active department for center readout (hovered takes precedence, then selected)
  const activeDeptName = hoveredDept || selectedDepartment;
  const activeDept = departments.find((d) => d.name === activeDeptName);

  // Donut geometry calculations
  // Compact donut dimensions so it sits gracefully next to the interactive department legend
  const size = 148;
  const cx = size / 2;
  const cy = size / 2;
  const baseR = 58;
  const baseRInner = 38;

  // Calculate arc sectors
  let cumulativeAngle = -Math.PI / 2; // start at top (12 o'clock)
  const gapAngle = 0.04; // clean gap between slices

  const slices = departments.map((dept) => {
    const fraction = dept.count / totalUseCases;
    const angleSpan = fraction * 2 * Math.PI;
    const startAngle = cumulativeAngle + gapAngle / 2;
    const endAngle = cumulativeAngle + angleSpan - gapAngle / 2;
    cumulativeAngle += angleSpan;

    const isHovered = hoveredDept === dept.name;
    const isSelected = selectedDepartment === dept.name;
    const isHighlighted = isHovered || isSelected;

    const R = isHighlighted ? baseR + 4 : baseR;
    const r = isHighlighted ? baseRInner - 2 : baseRInner;

    const x1 = cx + R * Math.cos(startAngle);
    const y1 = cy + R * Math.sin(startAngle);
    const x2 = cx + R * Math.cos(endAngle);
    const y2 = cy + R * Math.sin(endAngle);
    const x3 = cx + r * Math.cos(endAngle);
    const y3 = cy + r * Math.sin(endAngle);
    const x4 = cx + r * Math.cos(startAngle);
    const y4 = cy + r * Math.sin(startAngle);

    const largeArc = angleSpan > Math.PI ? 1 : 0;

    const pathData = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)} A ${r} ${r} 0 ${largeArc} 0 ${x4.toFixed(2)} ${y4.toFixed(2)} Z`;

    return {
      ...dept,
      pathData,
      isHighlighted,
      isSelected,
    };
  });

  return (
    <div id="department-and-blockers-row" className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-stretch">
      {/* 1. Ideas by department tile */}
      <div
        id="department-use-cases-card"
        className="bg-white rounded-xl border border-[#EFEBE8] shadow-xs p-3.5 flex flex-col justify-between"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div>
            <h2 className="text-sm font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <span>Ideas by department</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                {totalUseCases} use cases
              </span>
            </h2>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Distribution of ideas across {departments.length} departments
            </p>
          </div>
          {selectedDepartment && (
            <button
              onClick={() => onSelectDepartment(null)}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-[#700E22] hover:text-[#EA580C] transition-colors bg-[#FDF2F4] hover:bg-[#FBE0E5] px-2 py-0.5 rounded-md border border-[#FBE0E5]"
            >
              <RotateCcw className="w-3 h-3" />
              Reset filter
            </button>
          )}
        </div>

        {/* Donut Chart & Legend Side-by-Side */}
        <div className="my-2.5 flex flex-col sm:flex-row items-center gap-3.5">
          {/* Donut graphic with centered readout */}
          <div className="relative shrink-0 flex items-center justify-center">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="overflow-visible select-none"
            >
              <g>
                {slices.map((slice) => (
                  <path
                    key={slice.name}
                    d={slice.pathData}
                    fill={slice.color}
                    className="cursor-pointer transition-all duration-200 hover:opacity-90"
                    style={{
                      filter: slice.isHighlighted
                        ? 'drop-shadow(0 3px 5px rgba(0,0,0,0.18))'
                        : 'none',
                      opacity:
                        activeDeptName && !slice.isHighlighted ? 0.45 : 1,
                    }}
                    onMouseEnter={() => setHoveredDept(slice.name)}
                    onMouseLeave={() => setHoveredDept(null)}
                    onClick={() =>
                      onSelectDepartment(
                        selectedDepartment === slice.name ? null : slice.name
                      )
                    }
                  />
                ))}
              </g>
            </svg>

            {/* Centered Statistics Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
              {activeDept ? (
                <>
                  <span
                    className="text-lg font-black tracking-tight leading-none"
                    style={{ color: activeDept.color }}
                  >
                    {activeDept.count}
                  </span>
                  <span className="text-[10px] font-bold text-stone-900 leading-tight max-w-[70px] truncate mt-0.5">
                    {activeDept.name}
                  </span>
                  <span className="text-[9px] font-medium text-stone-500">
                    {activeDept.percentage}%
                  </span>
                </>
              ) : (
                <>
                  <span className="text-lg font-black text-stone-900 tracking-tight leading-none">
                    {totalUseCases}
                  </span>
                  <span className="text-[10px] font-bold text-stone-700">
                    Total
                  </span>
                  <span className="text-[9px] text-stone-400">
                    {departments.length} depts
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Department Interactive Legend: 2 columns of 4 departments */}
          <div id="department-legend-grid" className="grid grid-cols-2 gap-1.5 flex-1 w-full">
            {departments.map((dept) => {
              const isSelected = selectedDepartment === dept.name;
              const isHovered = hoveredDept === dept.name;
              const isDimmed = activeDeptName && !isSelected && !isHovered;

              return (
                <button
                  key={dept.name}
                  id={`dept-legend-${dept.name.toLowerCase().replace(/\s+/g, '-')}`}
                  onMouseEnter={() => setHoveredDept(dept.name)}
                  onMouseLeave={() => setHoveredDept(null)}
                  onClick={() =>
                    onSelectDepartment(isSelected ? null : dept.name)
                  }
                  className={`flex items-center justify-between px-2 py-1 rounded-md text-left transition-all border ${
                    isSelected
                      ? 'bg-[#FDF2F4] border-[#700E22] ring-1 ring-[#700E22] shadow-xs'
                      : isHovered
                      ? 'bg-stone-100 border-stone-300'
                      : 'bg-[#FAF8F6] border-stone-200/70 hover:bg-stone-50'
                  } ${isDimmed ? 'opacity-50' : 'opacity-100'}`}
                >
                  <div className="flex items-center gap-1.5 min-w-0 pr-1">
                    <span
                      className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: dept.color }}
                    />
                    <span className="text-[11px] font-semibold text-stone-800 truncate">
                      {dept.name}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 shrink-0 text-right">
                    <span className="text-[11px] font-bold text-stone-900">
                      {dept.count}
                    </span>
                    <span className="text-[9px] text-stone-400">
                      ({dept.percentage}%)
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info note */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500">
          <span>Click any slice or department to filter portfolio</span>
          {selectedDepartment && (
            <span className="text-[#700E22] font-bold">
              Filtered: {selectedDepartment}
            </span>
          )}
        </div>
      </div>

      {/* 2. Primary Blocker tile sitting right next to Ideas by Department */}
      <div
        id="blocker-insights-card"
        className="bg-gradient-to-br from-[#FFF8F6] via-[#FFFDFD] to-white rounded-xl border border-[#FBE0E5] shadow-xs p-3.5 flex flex-col justify-between"
      >
        {/* Card Header */}
        <div>
          <div className="flex items-center gap-2 pb-2 border-b border-[#FBE0E5]/60">
            <div className="w-7 h-7 rounded-lg bg-[#FDF2F4] text-[#700E22] flex items-center justify-center shrink-0 shadow-xs border border-[#FBE0E5]">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#700E22]">
                Primary Bottleneck Finding
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 leading-tight">
                Primary blocker: {metrics.primaryBlocker.count} reports cite &quot;{metrics.primaryBlocker.blocker}&quot;
              </h3>
            </div>
          </div>

          {/* Finding Core Text */}
          <p className="text-[11px] text-stone-700 leading-relaxed mt-2 font-normal">
            In <span className="font-bold text-stone-900">{metrics.primaryBlocker.percentage}% of submissions</span>, the leading reported constraint is &quot;{metrics.primaryBlocker.blocker}&quot;.{' '}
            <span className="font-semibold text-[#700E22] bg-[#FDF2F4] px-1 py-0.5 rounded border border-[#FBE0E5]">
              Evidence and ownership must be checked before selecting technology
            </span>
            —automating a process that lacks organizational agreement simply amplifies misalignment.
          </p>
        </div>

        {/* Breakdown of all 6 blockers */}
        <div className="my-2 pt-2 border-t border-[#FBE0E5]/70">
          <div className="text-[10px] font-bold text-stone-800 mb-1 flex items-center justify-between">
            <span>Reported blockers across {metrics.reports} submissions:</span>
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
                  onClick={() => onSelectBlocker(isSelected ? null : b.blocker)}
                  className={`flex items-center justify-between px-2 py-1 rounded-md border text-left transition-all ${
                    isSelected
                      ? 'bg-[#FDF2F4] border-[#700E22] text-[#700E22] font-bold shadow-xs'
                      : 'bg-white/95 border-stone-200/80 text-stone-700 hover:bg-white hover:border-stone-300'
                  }`}
                >
                  <span className="text-[10px] truncate leading-tight mr-1">
                    {b.blocker}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-stone-100 text-stone-800 shrink-0">
                    {b.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary takeaway callout */}
        <div className="flex items-center gap-1.5 text-[10px] text-stone-600 bg-white p-2 rounded-lg border border-[#FBE0E5]">
          <Info className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />
          <span>
            {secondaryBlockers.length
              ? <>Secondary bottlenecks: {secondaryBlockers.map((item, index) => <React.Fragment key={item.blocker}>{index > 0 ? ' and ' : ''}<span className="font-semibold text-stone-800">{item.count} reports</span> cite &quot;{item.blocker}&quot;</React.Fragment>)}.</>
              : <>No secondary blocker has been reported.</>}
          </span>
        </div>
        <div className="mt-1.5 flex items-start gap-1.5 text-[10px] text-stone-600 bg-white p-2 rounded-lg border border-[#FBE0E5]">
          <Info className="w-3.5 h-3.5 text-[#700E22] shrink-0 mt-0.5" />
          <span>
            <span className="font-bold text-stone-800">Root-cause gap:</span>{' '}
            {rootCauseGaps.length
              ? rootCauseGaps.map(([gap, count], index) => <React.Fragment key={gap}>{index > 0 ? '; ' : ''}{count} report{count === 1 ? '' : 's'}: {gap}</React.Fragment>)
              : 'No mismatch between stated and derived root causes.'}
          </span>
        </div>
      </div>
    </div>
  );
};
