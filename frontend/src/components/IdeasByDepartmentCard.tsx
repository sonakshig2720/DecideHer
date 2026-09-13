import React, { useState } from 'react';
import { DepartmentSummary } from '../types';

interface IdeasByDepartmentCardProps {
  departments: DepartmentSummary[];
  selectedDepartment: string | null;
  onSelectDepartment: (deptName: string | null) => void;
}

export const IdeasByDepartmentCard: React.FC<IdeasByDepartmentCardProps> = ({
  departments,
  selectedDepartment,
  onSelectDepartment,
}) => {
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);
  const totalUseCases = departments.reduce((acc, d) => acc + d.count, 0);

  const activeDeptName = hoveredDept || selectedDepartment;
  const activeDept = departments.find((d) => d.name === activeDeptName);

  // Donut geometry calculations
  const size = 136;
  const cx = size / 2;
  const cy = size / 2;
  const baseR = 54;
  const baseRInner = 36;

  let cumulativeAngle = -Math.PI / 2;
  const gapAngle = 0.04;

  const slices = departments.map((dept) => {
    const fraction = dept.count / totalUseCases;
    const angleSpan = fraction * 2 * Math.PI;
    const startAngle = cumulativeAngle + gapAngle / 2;
    const endAngle = cumulativeAngle + angleSpan - gapAngle / 2;
    cumulativeAngle += angleSpan;

    const isHovered = hoveredDept === dept.name;
    const isSelected = selectedDepartment === dept.name;
    const isHighlighted = isHovered || isSelected;

    const R = isHighlighted ? baseR + 3 : baseR;
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
    <div
      id="department-use-cases-card"
      className="bg-white rounded-xl border border-[#EFEBE8] shadow-xs p-3.5 flex flex-col justify-between"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <span>Ideas by department</span>
            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-stone-100 text-stone-700">
              {totalUseCases} use cases
            </span>
          </h3>
          <p className="text-[10px] text-stone-500 mt-0.5">
            Cross-functional distribution across {departments.length} operational departments
          </p>
        </div>
        {selectedDepartment && (
          <button
            onClick={() => onSelectDepartment(null)}
            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#700E22] hover:text-[#EA580C] transition-colors bg-[#FDF2F4] hover:bg-[#FBE0E5] px-2 py-0.5 rounded-md border border-[#FBE0E5]"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Main Content: Donut + Legend */}
      <div className="py-2 flex flex-col sm:flex-row items-center gap-4">
        {/* SVG Donut */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {slices.map((slice) => (
              <path
                key={slice.name}
                d={slice.pathData}
                fill={slice.color}
                className="cursor-pointer transition-all duration-150"
                style={{
                  filter: slice.isHighlighted
                    ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))'
                    : 'none',
                }}
                onMouseEnter={() => setHoveredDept(slice.name)}
                onMouseLeave={() => setHoveredDept(null)}
                onClick={() =>
                  onSelectDepartment(slice.isSelected ? null : slice.name)
                }
              />
            ))}
          </svg>

          {/* Center readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {activeDept ? (
              <>
                <span className="text-xs font-black text-stone-900 leading-tight">
                  {activeDept.count}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-stone-500 max-w-[50px] truncate">
                  {activeDept.name}
                </span>
                <span className="text-[8px] font-bold text-[#EA580C]">
                  {activeDept.percentage}%
                </span>
              </>
            ) : (
              <>
                <span className="text-sm font-black text-stone-900 leading-none">
                  {totalUseCases}
                </span>
                <span className="text-[9px] font-medium text-stone-400 mt-0.5">
                  Submissions
                </span>
              </>
            )}
          </div>
        </div>

        {/* Department Chips */}
        <div className="grid grid-cols-2 gap-1.5 flex-1 w-full">
          {departments.map((dept) => {
            const isSelected = selectedDepartment === dept.name;
            const isHovered = hoveredDept === dept.name;
            const isDimmed = activeDeptName && !isSelected && !isHovered;

            return (
              <button
                key={dept.name}
                id={`dept-chip-${dept.name.toLowerCase().replace(/\s+/g, '-')}`}
                onMouseEnter={() => setHoveredDept(dept.name)}
                onMouseLeave={() => setHoveredDept(null)}
                onClick={() =>
                  onSelectDepartment(isSelected ? null : dept.name)
                }
                className={`flex items-center justify-between px-2 py-1 rounded-md text-left transition-all border ${
                  isSelected
                    ? 'bg-[#FDF2F4] border-[#700E22] ring-1 ring-[#700E22] shadow-2xs'
                    : isHovered
                    ? 'bg-stone-100 border-stone-300'
                    : 'bg-[#FAF8F6] border-stone-200/70 hover:bg-stone-50'
                } ${isDimmed ? 'opacity-50' : 'opacity-100'}`}
              >
                <div className="flex items-center gap-1.5 min-w-0 pr-1">
                  <span
                    className="w-2 h-2 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: dept.color }}
                  />
                  <span className="text-[10px] font-semibold text-stone-800 truncate">
                    {dept.name}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 shrink-0 text-right">
                  <span className="text-[10px] font-bold text-stone-900">
                    {dept.count}
                  </span>
                  <span className="text-[8px] text-stone-400">
                    ({dept.percentage}%)
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
