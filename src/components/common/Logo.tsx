import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-lg',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none cursor-pointer group ${className}`} id="zorvexa-logo">
      <div
        className={`${iconSizes[size]} relative rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black transition-all duration-200 group-hover:scale-105 flex items-center justify-center shrink-0 border border-zinc-800 dark:border-zinc-200 shadow-sm`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-4 h-4 sm:w-5 sm:h-5 stroke-current"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 4h16L8 20h12" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={`${textSizes[size]} font-black tracking-tight text-zinc-900 dark:text-zinc-100`}
          >
            Zorvexa
          </span>
        </div>
      )}
    </div>
  );
};

