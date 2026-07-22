import React, { useState } from 'react';
import { Post, FakeSlot, VoteResult } from '../../types';
import { MediaPlayer } from '../shared/MediaPlayer';
import { DifficultyBadge } from '../shared/DifficultyBadge';
import { ScanLineAnimation } from '../shared/ScanLineAnimation';
import { RevealOverlay } from './RevealOverlay';
import { Check, X, MapPin } from 'lucide-react';

interface PostCardTypeBProps {
  post: Post;
  onVote: (postId: string, fakeSlot: FakeSlot) => Promise<VoteResult>;
  onReport: (post: Post) => void;
  onRequestAiHintRefresh: (postId: string) => void;
}

export const PostCardTypeB: React.FC<PostCardTypeBProps> = ({
  post,
  onVote,
  onReport,
  onRequestAiHintRefresh,
}) => {
  const [isVoting, setIsVoting] = useState(false);
  const [showScanLine, setShowScanLine] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const hasVoted = Boolean(post.userVote);

  const handleCastVote = async (slot: FakeSlot) => {
    if (hasVoted || isVoting) return;
    setIsVoting(true);
    setShowScanLine(true);
    try {
      await onVote(post.id, slot);
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

  const isSlotAFake = post.fakeSlot === 'SLOT_A';

  return (
    <article className="bg-[#16181F] border border-[#2A2D38] rounded-xl p-4 sm:p-5 shadow-xl transition hover:border-[#3A3D4D] relative">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={post.authorAvatar}
            alt={post.authorDisplayName}
            className="w-10 h-10 rounded-full object-cover border border-[#2A2D38]"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-[#F0F2F7]">
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

      {/* Caption */}
      {post.caption && (
        <p className="text-xs sm:text-sm text-zinc-200 mb-3 font-sans leading-relaxed">
          {post.caption}
        </p>
      )}

      {/* Dual Media Comparison Grid - Guaranteed Same Size */}
      <div className="relative my-3">
        {showScanLine && <ScanLineAnimation onComplete={() => setShowScanLine(false)} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Option A */}
          <div
            className={`relative rounded-xl overflow-hidden border p-2 flex flex-col justify-between transition ${
              hasVoted
                ? isSlotAFake
                  ? 'border-[#FF3D5A] bg-[#FF3D5A]/10'
                  : 'border-[#22C55E] bg-[#22C55E]/10'
                : 'border-[#282830] bg-[#0A0A0A]'
            }`}
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="font-mono font-bold text-xs text-[#A78BFA] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#A78BFA]" />
                OPTION A
              </span>
              {hasVoted && (
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    isSlotAFake ? 'bg-[#FF3D5A] text-white' : 'bg-[#22C55E] text-[#0A0A0A]'
                  }`}
                >
                  {isSlotAFake ? 'SYNTHETIC ✗' : 'REAL ✓'}
                </span>
              )}
            </div>

            <div className="w-full aspect-square overflow-hidden rounded-lg bg-black">
              <MediaPlayer
                src={post.mediaUrlA || ''}
                type={post.mediaTypeA}
                alt="Option A Media"
                aspectRatio="square"
              />
            </div>

            {!hasVoted && (
              <button
                type="button"
                onClick={() => handleCastVote('SLOT_A')}
                disabled={isVoting}
                className="w-full mt-2.5 py-2.5 rounded-lg font-mono font-bold text-xs bg-[#1C1C20] hover:bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/40 hover:border-[#A78BFA] transition disabled:opacity-50 shadow-sm flex items-center justify-center gap-1.5"
              >
                Pick Option A as Fake
              </button>
            )}
          </div>

          {/* Option B */}
          <div
            className={`relative rounded-xl overflow-hidden border p-2 flex flex-col justify-between transition ${
              hasVoted
                ? !isSlotAFake
                  ? 'border-[#FF3D5A] bg-[#FF3D5A]/10'
                  : 'border-[#22C55E] bg-[#22C55E]/10'
                : 'border-[#282830] bg-[#0A0A0A]'
            }`}
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="font-mono font-bold text-xs text-[#A78BFA] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#A78BFA]" />
                OPTION B
              </span>
              {hasVoted && (
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    !isSlotAFake ? 'bg-[#FF3D5A] text-white' : 'bg-[#22C55E] text-[#0A0A0A]'
                  }`}
                >
                  {!isSlotAFake ? 'SYNTHETIC ✗' : 'REAL ✓'}
                </span>
              )}
            </div>

            <div className="w-full aspect-square overflow-hidden rounded-lg bg-black">
              <MediaPlayer
                src={post.mediaUrlB || ''}
                type={post.mediaTypeB}
                alt="Option B Media"
                aspectRatio="square"
              />
            </div>

            {!hasVoted && (
              <button
                type="button"
                onClick={() => handleCastVote('SLOT_B')}
                disabled={isVoting}
                className="w-full mt-2.5 py-2.5 rounded-lg font-mono font-bold text-xs bg-[#1C1C20] hover:bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/40 hover:border-[#A78BFA] transition disabled:opacity-50 shadow-sm flex items-center justify-center gap-1.5"
              >
                Pick Option B as Fake
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 my-2">
          {post.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-mono text-zinc-400 bg-[#1E2029] border border-[#2A2D38] px-2 py-0.5 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Reveal Analysis */}
      {hasVoted && (
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
