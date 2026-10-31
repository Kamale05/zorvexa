import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  onClick,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs rounded-xl',
    md: 'w-9 h-9 text-sm rounded-xl',
    lg: 'w-12 h-12 text-base rounded-2xl',
    xl: 'w-16 h-16 text-lg rounded-2xl',
    '2xl': 'w-24 h-24 text-2xl rounded-3xl',
  };

  const svgSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9',
    '2xl': 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-4xl',
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 select-none cursor-pointer group ${className}`}
      id="zorvexa-logo"
    >
      {/* 3D Glossy Blue Z Logo Box */}
      <div
        className={`${iconSizes[size]} relative bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#0284C7] p-[1.5px] transition-all duration-300 group-hover:scale-105 shadow-[0_4px_20px_rgba(37,99,235,0.4)] flex items-center justify-center shrink-0 overflow-hidden`}
      >
        <div className="w-full h-full rounded-[inherit] bg-gradient-to-b from-[#0B1528] to-[#050B17] flex items-center justify-center relative overflow-hidden">
          {/* Internal 3D ambient glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.4),transparent_65%)]" />

          {/* 3D Stylized Z Monogram SVG matching reference */}
          <svg
            viewBox="0 0 48 48"
            fill="none"
            className={`${svgSizes[size]} relative z-10 drop-shadow-[0_2px_8px_rgba(56,189,248,0.6)]`}
          >
            <defs>
              <linearGradient id="zTopFacet" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
              <linearGradient id="zDiagFacet" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="50%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
              <linearGradient id="zBottomFacet" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E40AF" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>
            </defs>

            {/* Top horizontal arm */}
            <path
              d="M10 11 C10 9.3 11.3 8 13 8 L35 8 C36.7 8 38 9.3 38 11 L38 14 C38 15.1 37.1 16 36 16 L18 16 L10 11 Z"
              fill="url(#zTopFacet)"
            />

            {/* Powerful 3D Diagonal slash */}
            <path
              d="M37 12 L15 34 L21 34 L40 15 C40.8 14.2 40.2 12.8 39 12.8 L37 12 Z"
              fill="url(#zDiagFacet)"
              opacity="0.95"
            />
            <path
              d="M36 14 L14 36 C13.2 36.8 13.8 38 15 38 L36 38 C37.1 38 38 37.1 38 36 L38 33 L20 33 L36 14 Z"
              fill="url(#zBottomFacet)"
            />
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={`${textSizes[size]} font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5`}
          >
            Zorvexa
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse" />
          </span>
        </div>
      )}
    </div>
  );
};
