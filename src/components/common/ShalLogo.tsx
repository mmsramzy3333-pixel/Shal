import React from 'react';
import { useApp } from '../../context/AppContext';

export const SHAL_LOGO_IMAGE_PATH = '/assets/aistudio/Artboard_6_67181bbc.png';

interface ShalLogoProps {
  variant?: 'full' | 'icon' | 'mark' | 'badge';
  theme?: 'dark' | 'light' | 'white';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
}

export const ShalLogo: React.FC<ShalLogoProps> = ({
  variant = 'full',
  theme = 'light',
  size = 'md',
  className = '',
  showSubtitle = false,
}) => {
  let customLogo = SHAL_LOGO_IMAGE_PATH;
  let customNameAr = 'شال';
  let customNameEn = 'SHAL';

  try {
    const app = useApp();
    if (app?.customAssets?.brandLogoUrl) customLogo = app.customAssets.brandLogoUrl;
    if (app?.customAssets?.brandNameAr) customNameAr = app.customAssets.brandNameAr;
    if (app?.customAssets?.brandNameEn) customNameEn = app.customAssets.brandNameEn;
  } catch {
    // Standalone fallback
  }

  const iconSizes = {
    xs: 'h-6 w-6 rounded-md',
    sm: 'h-8 w-8 rounded-lg',
    md: 'h-10 w-10 rounded-xl',
    lg: 'h-13 w-13 rounded-2xl',
    xl: 'h-16 w-16 rounded-2xl',
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  // Uses the user's Artboard 6.png image or customized logo URL
  const renderIcon = () => (
    <div
      className={`relative flex items-center justify-center shrink-0 overflow-hidden shadow-xs ring-1 ring-black/10 bg-[#e4ded5] ${iconSizes[size]}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <image
          href={customLogo}
          xlinkHref={customLogo}
          x="0"
          y="0"
          width="100"
          height="100"
          preserveAspectRatio="xMidYMid slice"
        />
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{renderIcon()}</div>;
  }

  const isDarkBg = theme === 'dark' || theme === 'white';

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {renderIcon()}
      <div className="flex flex-col leading-tight select-none">
        <div className="flex items-center gap-1.5 font-extrabold tracking-tight">
          <span
            className={`${textSizes[size]} font-black ${
              isDarkBg ? 'text-[#FAF7F2]' : 'text-[#24291F]'
            }`}
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            {customNameAr}
          </span>
          <span className="text-[#BDAF9C] font-light text-xs">|</span>
          <span
            className={`${textSizes[size]} font-bold tracking-wider ${
              isDarkBg ? 'text-[#D4C7B7]' : 'text-[#4C5540]'
            }`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {customNameEn}
          </span>
          <span
            className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
              isDarkBg
                ? 'bg-white/15 text-[#FAF7F2] border-[#BDAF9C]/40'
                : 'bg-[#4C5540]/10 text-[#4C5540] border-[#4C5540]/25'
            }`}
          >
            AGENCY
          </span>
        </div>
        {showSubtitle && (
          <p
            className={`text-[10px] font-medium ${
              isDarkBg ? 'text-[#E9E1D6]/80' : 'text-[#4C5540]/80'
            }`}
          >
            وكالة شال للحلول الرقمية والتسويق
          </p>
        )}
      </div>
    </div>
  );
};

// Generates employee avatar embedding the official Artboard 6.png logo and employee number badge
export const getShalEmployeeAvatar = (employeeNum: string, roleColor: string = '#4C5540') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 120 120" width="120" height="120">
    <defs>
      <clipPath id="circleClip">
        <rect width="120" height="120" rx="30" />
      </clipPath>
    </defs>
    <rect width="120" height="120" rx="30" fill="#24291F" />
    <image href="/assets/aistudio/Artboard_6_67181bbc.png" xlink:href="/assets/aistudio/Artboard_6_67181bbc.png" x="0" y="0" width="120" height="120" preserveAspectRatio="xMidYMid slice" clip-path="url(#circleClip)" />
    <!-- Employee Number Badge overlay -->
    <rect x="22" y="88" width="76" height="24" rx="12" fill="${roleColor}" stroke="#E9E1D6" stroke-width="2" />
    <text x="60" y="104" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle">#${employeeNum}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
