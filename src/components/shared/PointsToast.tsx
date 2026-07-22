import React, { useEffect } from 'react';
import { Award, CheckCircle2, Sparkles, XCircle } from 'lucide-react';

interface PointsToastProps {
  isCorrect: boolean;
  points: number;
  streak: number;
  onClose: () => void;
}

export const PointsToast: React.FC<PointsToastProps> = ({ isCorrect, points, streak, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-2xl backdrop-blur-md ${
          isCorrect
            ? 'bg-[#16181F]/95 border-[#00E5B4] text-[#F0F2F7] shadow-[0_0_20px_rgba(0,229,180,0.3)]'
            : 'bg-[#16181F]/95 border-rose-500/50 text-rose-200'
        }`}
      >
        {isCorrect ? (
          <div className="p-2 rounded-full bg-[#00E5B4]/20 text-[#00E5B4]">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          <div className="p-2 rounded-full bg-rose-500/20 text-rose-400">
            <XCircle className="w-5 h-5" />
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 font-display font-bold text-sm">
            <span>{isCorrect ? 'Correct Analysis!' : 'Learning Moment!'}</span>
            {isCorrect && points > 0 && (
              <span className="font-mono bg-[#00E5B4]/20 text-[#00E5B4] px-2 py-0.5 rounded text-xs">
                +{points} PTS
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            {isCorrect
              ? `Pattern recognized! Current streak: 🔥 ${streak} days`
              : 'Review the forensic breakdown below to train your eye.'}
          </p>
        </div>
      </div>
    </div>
  );
};
