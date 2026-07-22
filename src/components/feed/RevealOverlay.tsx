import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Share2,
  Flag,
  Info,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { Post, ForensicTell } from '../../types';

interface RevealOverlayProps {
  post: Post;
  userVote?: {
    voteLabel?: string;
    voteSlot?: string;
    isCorrect: boolean;
    pointsAwarded: number;
  };
  onReportClick: () => void;
  onRequestAiHintRefresh?: () => void;
  isAiLoading?: boolean;
}

export const RevealOverlay: React.FC<RevealOverlayProps> = ({
  post,
  userVote,
  onReportClick,
  onRequestAiHintRefresh,
  isAiLoading = false,
}) => {
  const [selectedTell, setSelectedTell] = useState<ForensicTell | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isTypeA = post.postType === 'TYPE_A';
  const trueLabel = post.trueLabel || 'REAL';
  const fakeSlot = post.fakeSlot || 'SLOT_A';

  return (
    <div className="mt-4 p-4 rounded-xl bg-[#16181F] border border-[#00E5B4]/30 space-y-4 animate-in fade-in duration-300">
      {/* Result Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#2A2D38]">
        <div className="flex items-center gap-2.5">
          {userVote?.isCorrect ? (
            <div className="flex items-center gap-2 text-[#22C55E] font-display font-bold text-base">
              <CheckCircle2 className="w-5 h-5 fill-[#22C55E] text-[#0E0F13]" />
              <span>CORRECT DETECTION</span>
              <span className="font-mono text-xs bg-[#22C55E]/15 px-2 py-0.5 rounded border border-[#22C55E]/30">
                +{userVote.pointsAwarded} PTS
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-rose-400 font-display font-bold text-base">
              <XCircle className="w-5 h-5 fill-rose-500 text-[#0E0F13]" />
              <span>LEARNING MOMENT</span>
              <span className="font-mono text-xs text-zinc-400">
                Truth: {isTypeA ? trueLabel : `Option ${fakeSlot === 'SLOT_A' ? 'A' : 'B'} was Fake`}
              </span>
            </div>
          )}
        </div>

        {/* Share & Report */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1E2029] hover:bg-zinc-800 text-zinc-300 text-xs font-mono border border-[#2A2D38] transition"
          >
            <Share2 size={13} />
            {copied ? 'Link Copied!' : 'Share Challenge'}
          </button>
          <button
            type="button"
            onClick={onReportClick}
            className="p-1.5 rounded bg-[#1E2029] hover:bg-rose-950/50 text-zinc-400 hover:text-rose-400 border border-[#2A2D38] transition"
            title="Report inaccurate label or harmful content"
          >
            <Flag size={13} />
          </button>
        </div>
      </div>

      {/* Community Stats Bar */}
      <div>
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1.5">
          <span>Community Accuracy Consensus</span>
          <span className="font-bold text-[#F0F2F7]">{post.accuracyRate}% Correct</span>
        </div>
        <div className="w-full h-2.5 bg-[#1E2029] rounded-full overflow-hidden border border-[#2A2D38] flex">
          <div
            className="bg-gradient-to-r from-[#22C55E] to-[#00E5B4] h-full transition-all duration-700"
            style={{ width: `${post.accuracyRate}%` }}
          />
          <div
            className="bg-rose-500/60 h-full transition-all duration-700"
            style={{ width: `${100 - post.accuracyRate}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
          <span>{post.correctVotes} Spotted Correctly</span>
          <span>{post.totalVotes} Total Votes</span>
        </div>
      </div>

      {/* AI Forensic Breakdown Hint Panel */}
      <div className="p-3.5 rounded-lg bg-gradient-to-r from-[#16181F] to-[#1E2029] border border-[#00E5B4]/40 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-display font-bold text-[#00E5B4]">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>AI FORENSIC ANALYSIS</span>
          </div>

          {onRequestAiHintRefresh && (
            <button
              type="button"
              onClick={onRequestAiHintRefresh}
              disabled={isAiLoading}
              className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-[#00E5B4] transition disabled:opacity-50"
            >
              <RefreshCw size={11} className={isAiLoading ? 'animate-spin' : ''} />
              <span>{isAiLoading ? 'Analyzing...' : 'Re-analyze'}</span>
            </button>
          )}
        </div>

        <p className="text-xs text-zinc-200 leading-relaxed font-sans">
          {post.revealHint ||
            'Look for catchlight reflections in pupil centers, ear contour boundary smoothing, and unnatural ambient lighting angles along cheeklines.'}
        </p>

        {/* Forensic Tells Hotspot Badges */}
        {post.forensicTells && post.forensicTells.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#2A2D38]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-2">
              Detected Forensic Tells:
            </span>
            <div className="flex flex-wrap gap-2">
              {post.forensicTells.map((tell) => (
                <button
                  key={tell.id}
                  type="button"
                  onClick={() => setSelectedTell(selectedTell?.id === tell.id ? null : tell)}
                  className={`text-xs px-2.5 py-1 rounded-md border font-mono transition text-left ${
                    selectedTell?.id === tell.id
                      ? 'bg-[#00E5B4]/20 border-[#00E5B4] text-[#00E5B4]'
                      : 'bg-[#1E2029] border-[#2A2D38] text-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  🔍 {tell.label}
                </button>
              ))}
            </div>

            {selectedTell && (
              <div className="mt-2 p-2.5 bg-[#0E0F13] rounded border border-[#00E5B4]/30 text-xs text-zinc-300 animate-in fade-in">
                <span className="font-bold text-[#00E5B4] block mb-0.5">{selectedTell.label}</span>
                {selectedTell.description}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
