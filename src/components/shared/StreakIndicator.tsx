import React from 'react';
import { Flame } from 'lucide-react';

interface StreakIndicatorProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
}

export const StreakIndicator: React.FC<StreakIndicatorProps> = ({ streak, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  return (
    <div
      className={`inline-flex items-center font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-md ${sizeClasses[size]}`}
      title={`${streak} day voting streak`}
    >
      <Flame size={iconSizes[size]} className="text-amber-500 fill-amber-500 animate-pulse" />
      <span>{streak}d streak</span>
    </div>
  );
};
