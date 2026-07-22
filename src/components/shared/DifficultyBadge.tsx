import React from 'react';
import { Difficulty } from '../../types';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  size?: 'sm' | 'md';
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty, size = 'md' }) => {
  const getColors = () => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60';
      case 'INTERMEDIATE':
        return 'bg-amber-950/80 text-amber-400 border-amber-800/60';
      case 'ADVANCED':
        return 'bg-purple-950/80 text-purple-400 border-purple-800/60';
      case 'EXPERT':
        return 'bg-rose-950/80 text-rose-400 border-rose-800/60';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const px = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold tracking-wider uppercase border rounded ${px} ${getColors()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {difficulty}
    </span>
  );
};
