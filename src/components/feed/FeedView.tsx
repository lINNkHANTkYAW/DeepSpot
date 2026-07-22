import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Post, TruthLabel, FakeSlot, VoteResult } from '../../types';
import { PostCardTypeA } from './PostCardTypeA';
import { PostCardTypeB } from './PostCardTypeB';
import { FeedFilterBar } from './FeedFilterBar';
import { PointsToast } from '../shared/PointsToast';
import { Flag, ShieldAlert, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface FeedViewProps {
  onRefreshUser: () => void;
}

export const FeedView: React.FC<FeedViewProps> = ({ onRefreshUser }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [mediaType, setMediaType] = useState('ALL');
  const [difficulty, setDifficulty] = useState('ALL');
  const [postType, setPostType] = useState('ALL');
  const [sort, setSort] = useState('NEWEST');

  // Point Toast State
  const [toastData, setToastData] = useState<{
    isCorrect: boolean;
    points: number;
    streak: number;
  } | null>(null);

  // Report Modal State
  const [reportingPost, setReportingPost] = useState<Post | null>(null);
  const [reportReason, setReportReason] = useState<string>('WRONG_LABEL');
  const [reportNote, setReportNote] = useState<string>('');
  const [reportSuccessMsg, setReportSuccessMsg] = useState<string>('');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        mediaType,
        difficulty,
        postType,
        sort,
      });
      const res = await fetch(`/api/posts?${params.toString()}`);
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (e) {
      console.error('Failed to load posts feed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [mediaType, difficulty, postType, sort]);

  const handleVote = async (postId: string, voteLabelOrSlot: TruthLabel | FakeSlot): Promise<VoteResult> => {
    const post = posts.find((p) => p.id === postId);
    const body: any = {};

    if (post?.postType === 'TYPE_A') {
      body.voteLabel = voteLabelOrSlot;
    } else {
      body.voteSlot = voteLabelOrSlot;
    }

    const res = await fetch(`/api/posts/${postId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const result: VoteResult = await res.json();

    // Trigger celebratory confetti if correct!
    if (result.isCorrect) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#00E5B4', '#22C55E', '#A78BFA'],
      });
    }

    // Show Toast
    setToastData({
      isCorrect: result.isCorrect,
      points: result.pointsAwarded,
      streak: result.streak,
    });

    // Update post in local feed
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            totalVotes: p.totalVotes + 1,
            correctVotes: p.correctVotes + (result.isCorrect ? 1 : 0),
            accuracyRate: result.accuracyRate,
            revealHint: result.revealHint,
            userVote: {
              voteLabel: body.voteLabel,
              voteSlot: body.voteSlot,
              isCorrect: result.isCorrect,
              pointsAwarded: result.pointsAwarded,
              votedAt: new Date().toISOString(),
            },
          };
        }
        return p;
      })
    );

    // Refresh user state in navbar
    onRefreshUser();

    return result;
  };

  const handleAiHintRefresh = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/ai-hint`, { method: 'POST' });
      const data = await res.json();
      if (data.hint) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, revealHint: data.hint } : p))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const submitReport = async () => {
    if (!reportingPost) return;
    try {
      const res = await fetch(`/api/posts/${reportingPost.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason, note: reportNote }),
      });
      const data = await res.json();
      setReportSuccessMsg(data.message || 'Report submitted to moderators.');
      setTimeout(() => {
        setReportingPost(null);
        setReportSuccessMsg('');
        setReportNote('');
      }, 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Feed Filters */}
      <FeedFilterBar
        mediaType={mediaType}
        setMediaType={setMediaType}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        postType={postType}
        setPostType={setPostType}
        sort={sort}
        setSort={setSort}
      />

      {/* Posts List */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="bg-[#16181F] border border-[#2A2D38] rounded-xl p-6 animate-pulse space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800" />
                  <div className="space-y-1">
                    <div className="w-24 h-3 bg-zinc-800 rounded" />
                    <div className="w-16 h-2 bg-zinc-800 rounded" />
                  </div>
                </div>
                <div className="w-16 h-5 bg-zinc-800 rounded" />
              </div>
              <div className="w-full h-64 bg-zinc-900 rounded-lg" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-[#16181F] border border-[#2A2D38] rounded-xl p-8">
          <ShieldAlert className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
          <h3 className="font-display font-bold text-lg text-zinc-200">No Challenges Found</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
            Try adjusting your difficulty or media filter settings to view more synthetic media challenges.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) =>
            post.postType === 'TYPE_A' ? (
              <PostCardTypeA
                key={post.id}
                post={post}
                onVote={(id, label) => handleVote(id, label)}
                onReport={(p) => setReportingPost(p)}
                onRequestAiHintRefresh={handleAiHintRefresh}
              />
            ) : (
              <PostCardTypeB
                key={post.id}
                post={post}
                onVote={(id, slot) => handleVote(id, slot)}
                onReport={(p) => setReportingPost(p)}
                onRequestAiHintRefresh={handleAiHintRefresh}
              />
            )
          )}
        </div>
      )}

      {/* Floating Point Award Toast */}
      {toastData && (
        <PointsToast
          isCorrect={toastData.isCorrect}
          points={toastData.points}
          streak={toastData.streak}
          onClose={() => setToastData(null)}
        />
      )}

      {/* Report Modal */}
      {reportingPost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16181F] border border-[#2A2D38] rounded-xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-400 font-display font-bold text-lg mb-2">
              <AlertTriangle className="w-5 h-5" />
              Report Challenge
            </div>

            {reportSuccessMsg ? (
              <div className="py-6 text-center text-emerald-400 font-mono text-sm flex items-center justify-center gap-2">
                <CheckCircle2 size={18} />
                {reportSuccessMsg}
              </div>
            ) : (
              <>
                <p className="text-xs text-zinc-400 mb-4">
                  Help maintain DeepSpot standards. What issue did you spot in this post?
                </p>

                <div className="space-y-3 mb-4">
                  <label className="block text-xs font-mono text-zinc-300">Reason:</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-[#0E0F13] border border-[#2A2D38] text-xs font-mono text-zinc-200 rounded-lg p-2.5 outline-none focus:border-[#00E5B4]"
                  >
                    <option value="WRONG_LABEL">Wrong Label (Real misclassified as Fake, or vice versa)</option>
                    <option value="REAL_PERSON">Contains Real Non-Consensual Private Person</option>
                    <option value="HARMFUL_CONTENT">Harmful / Explicit Content</option>
                    <option value="SPAM">Spam or Low Quality</option>
                    <option value="OTHER">Other Issue</option>
                  </select>

                  <label className="block text-xs font-mono text-zinc-300">Notes (optional):</label>
                  <textarea
                    rows={3}
                    value={reportNote}
                    onChange={(e) => setReportNote(e.target.value)}
                    placeholder="Provide details for moderators..."
                    className="w-full bg-[#0E0F13] border border-[#2A2D38] text-xs text-zinc-200 rounded-lg p-2.5 outline-none focus:border-[#00E5B4]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReportingPost(null)}
                    className="px-4 py-2 rounded text-xs font-mono text-zinc-400 hover:text-zinc-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitReport}
                    className="px-4 py-2 rounded text-xs font-mono font-bold bg-rose-600 hover:bg-rose-500 text-white transition"
                  >
                    Submit Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
