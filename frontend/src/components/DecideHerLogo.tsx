import React from 'react';

interface DecideHerLogoProps {
  className?: string;
  showText?: boolean;
  withBackground?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'color';
}

export const DecideHerLogo: React.FC<DecideHerLogoProps> = ({
  className = '',
  showText = true,
  withBackground = true,
  size = 'md',
  variant = 'dark',
}) => {
  // Dimension presets calibrated for visual balance in horizontal lockup
  const sizeMap = {
    sm: {
      markWidth: 38,
      markHeight: 30,
      titleSize: 'text-[17px]',
      gap: 'gap-2.5',
      pad: 'px-3 py-2',
    },
    md: {
      markWidth: 48,
      markHeight: 38,
      titleSize: 'text-[21px]',
      gap: 'gap-3',
      pad: 'px-3.5 py-2.5',
    },
    lg: {
      markWidth: 62,
      markHeight: 50,
      titleSize: 'text-[26px]',
      gap: 'gap-3.5',
      pad: 'px-4.5 py-3',
    },
    xl: {
      markWidth: 84,
      markHeight: 68,
      titleSize: 'text-[34px]',
      gap: 'gap-4.5',
      pad: 'px-5.5 py-4',
    },
  };

  const currentSize = sizeMap[size];

  // Text colors based on background
  const isDark = variant === 'dark';
  const decideColor = withBackground ? 'text-[#700E22]' : isDark ? 'text-white' : 'text-[#700E22]';

  return (
    <div
      className={`inline-flex items-center ${currentSize.gap} ${
        withBackground
          ? `bg-white rounded-xl ${currentSize.pad} border border-stone-200/90 shadow-xs`
          : ''
      } ${className} select-none`}
    >
      {/* SVG Icon Mark from horizontal lockup */}
      <svg
        width={currentSize.markWidth}
        height={currentSize.markHeight}
        viewBox="0 0 120 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-label="DecideHer Logo Mark"
      >
          <defs>
            {/* Face & Hair Gradient: Deep Crimson at neck to Radiant Orange at face */}
            <linearGradient id="dhFaceGrad" x1="65" y1="82" x2="88" y2="35" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#700E22" />
              <stop offset="25%" stopColor="#9E1428" />
              <stop offset="55%" stopColor="#D9381E" />
              <stop offset="85%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>

            {/* Inner Flame Gradient */}
            <linearGradient id="dhInnerFlame" x1="60" y1="70" x2="72" y2="25" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#800E24" />
              <stop offset="50%" stopColor="#C92A1D" />
              <stop offset="100%" stopColor="#E64A19" />
            </linearGradient>

            {/* Top Node (Amber/Yellow-Orange) */}
            <radialGradient id="dhTopNode" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="45%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </radialGradient>

            {/* Left Node (Ruby/Burgundy - slightly luminous on dark for crisp contrast) */}
            <radialGradient id="dhLeftNode" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor={isDark ? '#C01D38' : '#A81B38'} />
              <stop offset="60%" stopColor={isDark ? '#8A112B' : '#700E22'} />
              <stop offset="100%" stopColor={isDark ? '#5C0617' : '#4A0614'} />
            </radialGradient>

            {/* Bottom Node (Radiant Orange) */}
            <radialGradient id="dhBottomNode" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="55%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#C2410C" />
            </radialGradient>
          </defs>

          {/* 1. Left Neural Branches with Circuit Nodes */}
          {/* Middle-Left Branch (Burgundy) */}
          <path
            d="M55.5 45.5 C49 41 43 37 38.5 34"
            stroke={isDark ? '#A81B38' : '#700E22'}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <circle cx="38.5" cy="34" r="5.6" fill="url(#dhLeftNode)" />

          {/* Top Branch (Vertical Amber/Yellow) */}
          <path
            d="M55.5 48.5 L55.5 22"
            stroke="#EA580C"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <circle cx="55.5" cy="22" r="6.2" fill="url(#dhTopNode)" />

          {/* Bottom-Left Branch (Orange) */}
          <path
            d="M57 58 C50 54 45 51 42 48.5"
            stroke="#EA580C"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <circle cx="42" cy="48.5" r="5.2" fill="url(#dhBottomNode)" />

          {/* 2. Woman's Profile Silhouette and Flame Hair */}
          {/* Base Face & Hair Contour */}
          <path
            d="M65 80
               C61 70 58.5 56 60.5 40
               C62 29 66 22 72.5 17
               C70 24 67.5 32 68.5 37
               C73 30 78 28 81 29
               C82.5 31 82 34 83 35.5
               C84 35 85.5 34.5 85.5 34
               C84.5 36 83 37.5 83 39
               C83 40.5 86 43 88 44
               C85 45.5 83.5 46.5 83.5 47
               C85 48.5 86 49.5 86 50
               C84.5 51 84 51.5 84 51.5
               C85.5 52 86 53 86 53
               C84 54 84.5 55 86.5 56
               C85 58 83 59 79 61
               C73 64 68 70 65 80 Z"
            fill="url(#dhFaceGrad)"
          />

          {/* Inner Flame Layer behind the cream strand */}
          <path
            d="M65 80
               C61 70 58.5 56 60.5 40
               C62 29 66 22 72.5 17
               C71 27 68 39 70 50
               C71 58 69 70 65 80 Z"
            fill="url(#dhInnerFlame)"
          />

          {/* Primary Cream / Ivory Strand */}
          <path
            d="M65 64
               C64.5 55 65.5 44 68.5 34
               C70.5 27 72 21 73 17
               C75.5 24 76.5 32 75.5 38
               C74.5 45 71 54 67 60
               C65.5 62 65 63 65 64 Z"
            fill="#FDF1DB"
          />

          {/* Inner Flame Slices inside the Cream Strand creating flowing dynamic locks */}
          <path
            d="M66.5 55
               C67.5 46 69.5 37 72.8 28
               C72 32 70.8 38 70 44
               C69.2 49 68 53 66.5 55 Z"
            fill="url(#dhInnerFlame)"
          />
          <path
            d="M69 42
               C71 34 73 26 74.5 20
               C74.8 24 74 30 73 35
               C72.2 38 70.5 41 69 42 Z"
            fill="url(#dhFaceGrad)"
          />
        </svg>

        {/* Wordmark: Decide + Her */}
        {showText && (
          <div className={`font-black tracking-tight ${currentSize.titleSize} flex items-center leading-none`}>
            <span className={decideColor}>Decide</span>
            <span className="text-[#EA580C]">Her</span>
          </div>
        )}
    </div>
  );
};
