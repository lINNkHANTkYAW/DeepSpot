import React, { useState } from 'react';
import { Post, TruthLabel, VoteResult } from '../../types';
import { MediaPlayer } from '../shared/MediaPlayer';
import { DifficultyBadge } from '../shared/DifficultyBadge';
import { ScanLineAnimation } from '../shared/ScanLineAnimation';
import { RevealOverlay } from './RevealOverlay';
import { Check, X, MapPin, Tag } from 'lucide-react';

interface PostCardTypeAProps {
  post: Post;
  onVote: (postId: string, voteLabel: TruthLabel) => Promise<VoteResult>;
  onReport: (post: Post) => void;
  onRequestAiHintRefresh: (postId: string) => void;
}

export const PostCardTypeA: React.FC<PostCardTypeAProps> = ({
  post,
  onVote,
  onReport,
  onRequestAiHintRefresh,
}) => {
  const [isVoting, setIsVoting] = useState(false);
  const [showScanLine, setShowScanLine] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const hasVoted = Boolean(post.userVote);

  const handleCastVote = async (label: TruthLabel) => {
    if (hasVoted || isVoting) return;
    setIsVoting(true);
    setShowScanLine(true);
    try {
      await onVote(post.id, label);
    } catch (e) {
      console.error(e);
    } finally {
      setIsVoting(false);
    }
  };

  const handleAiRefresh = async () => {
    setIsAiLoading(true);
    await onRequestAiHintRefresh(post.id);
    setIsAiLoading(false);
  };

  return (
    <article className="bg-[#141416] border border-[#282830] rounded-2xl p-4 sm:p-5 shadow-xl transition hover:border-[#383845] relative">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={post.authorAvatar}
            alt={post.authorDisplayName}
            className="w-10 h-10 rounded-full object-cover border border-[#282830]"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-[#F5F5F5]">
                {post.authorDisplayName}
              </span>
              <span className="text-xs text-zinc-500 font-mono">@{post.authorUsername}</span>
            </div>
            {post.authorLocation && (
              <p className="text-[11px] text-zinc-400 flex items-center gap-1 font-mono">
                <MapPin size={11} className="text-[#00E5B4]" />
                {post.authorLocation}
              </p>
            )}
          </div>
        </div>

        <DifficultyBadge difficulty={post.difficulty} />
      </div>

      {/* Post Caption */}
      {post.caption && (
        <p className="text-xs sm:text-sm text-zinc-200 mb-3 font-sans leading-relaxed">
          {post.caption}
        </p>
      )}

      {/* Media Container with ScanLine Sweep */}
      <div className="relative rounded-xl overflow-hidden my-3 border border-white/10">
        {showScanLine && <ScanLineAnimation onComplete={() => setShowScanLine(false)} />}
        <MediaPlayer src={post.mediaUrl || ''} type={post.mediaType} alt="Challenge Media" />

        {/* Revealed Truth Tag Overlay after voting */}
        {hasVoted && (
          <div className="absolute top-3 right-3 z-20">
            {post.trueLabel === 'REAL' ? (
              <div className="bg-[#22C55E] text-[#0A0A0A] font-mono font-bold text-xs px-3 py-1 rounded-md shadow-lg flex items-center gap-1.5 animate-in zoom-in-75">
                <Check size={14} /> CONFIRMED REAL
              </div>
            ) : (
              <div className="bg-[#FF3D5A] text-white font-mono font-bold text-xs px-3 py-1 rounded-md shadow-lg flex items-center gap-1.5 animate-in zoom-in-75">
                <X size={14} /> CONFIRMED SYNTHETIC
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 my-2">
          {post.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-mono font-medium text-zinc-400 bg-[#0A0A0A] border border-[#282830] px-2 py-0.5 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Voting Area or Revealed State */}
      {!hasVoted ? (
        <div className="mt-4 pt-3 border-t border-[#282830]">
          <p className="font-display font-semibold text-xs text-zinc-400 mb-2.5 text-center">
            Analyze Media: Is this REAL or SYNTHETIC?
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleCastVote('REAL')}
              disabled={isVoting}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-display font-bold text-sm bg-[#1C1C20] text-[#22C55E] border border-[#22C55E]/40 hover:bg-[#22C55E]/15 hover:border-[#22C55E] transition shadow-md disabled:opacity-50"
            >
              <Check size={18} />
              REAL
            </button>

            <button
              type="button"
              onClick={() => handleCastVote('FAKE')}
              disabled={isVoting}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-display font-bold text-sm bg-[#1C1C20] text-[#FF3D5A] border border-[#FF3D5A]/40 hover:bg-[#FF3D5A]/15 hover:border-[#FF3D5A] transition shadow-md disabled:opacity-50"
            >
              <X size={18} />
              SYNTHETIC
            </button>
          </div>
        </div>
      ) : (
        <RevealOverlay
          post={post}
          userVote={post.userVote}
          onReportClick={() => onReport(post)}
          onRequestAiHintRefresh={handleAiRefresh}
          isAiLoading={isAiLoading}
        />
      )}
    </article>
  );
};
