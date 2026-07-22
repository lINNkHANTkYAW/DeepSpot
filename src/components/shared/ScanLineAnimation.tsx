import React from 'react';

interface ScanLineAnimationProps {
  onComplete?: () => void;
}

export const ScanLineAnimation: React.FC<ScanLineAnimationProps> = ({ onComplete }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {/* Electric Teal Scan Line Sweep */}
      <div 
        className="absolute top-0 bottom-0 w-2 bg-[#00E5B4] animate-scanline shadow-[0_0_25px_#00E5B4,0_0_50px_#00E5B4]"
        onAnimationEnd={onComplete}
      />
      {/* Subtle trailing gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00E5B4]/10 to-transparent pointer-events-none animate-scanline" />
    </div>
  );
};
