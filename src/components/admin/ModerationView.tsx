import React, { useState, useEffect } from 'react';
import { Post, Report } from '../../types';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export const ModerationView: React.FC = () => {
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'reports'>('pending');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [modRes, repRes] = await Promise.all([
        fetch('/api/admin/moderation/queue'),
        fetch('/api/admin/reports'),
      ]);
      const modData = await modRes.json();
      const repData = await repRes.json();

      if (modData.pendingPosts) setPendingPosts(modData.pendingPosts);
      if (repData.reports) setReports(repData.reports);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleActionPost = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      await fetch(`/api/admin/moderation/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      setPendingPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-purple-950/80 border border-purple-800/60 text-purple-400 text-xs font-mono mb-2">
            <ShieldCheck size={14} /> MODERATOR DESK
          </div>
          <h1 className="font-display font-bold text-2xl text-[#F0F2F7]">
            Content Safety & Label Moderation Queue
          </h1>
        </div>

        <button
          type="button"
          onClick={fetchData}
          className="p-2 rounded bg-[#16181F] border border-[#2A2D38] text-zinc-400 hover:text-zinc-100"
          title="Refresh Queue"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-[#2A2D38] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition ${
            activeTab === 'pending'
              ? 'bg-[#1E2029] text-purple-400 border border-purple-800/60'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Pending Review ({pendingPosts.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition ${
            activeTab === 'reports'
              ? 'bg-[#1E2029] text-purple-400 border border-purple-800/60'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Community Reports ({reports.length})
        </button>
      </div>

      {/* Pending Posts */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingPosts.length === 0 ? (
            <div className="text-center py-12 bg-[#16181F] border border-[#2A2D38] rounded-xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs text-zinc-400">All pending submissions cleared! Queue is empty.</p>
            </div>
          ) : (
            pendingPosts.map((post) => (
              <div
                key={post.id}
                className="bg-[#16181F] border border-[#2A2D38] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={post.mediaUrl || post.mediaUrlA || ''}
                    alt="Submission Preview"
                    className="w-20 h-20 rounded-lg object-cover border border-[#2A2D38]"
                  />
                  <div>
                    <span className="text-[10px] font-mono text-purple-400 uppercase block font-bold">
                      {post.postType} · Uploader: @{post.authorUsername}
                    </span>
                    <p className="text-xs font-bold text-zinc-200 mt-0.5">{post.caption}</p>
                    <p className="text-[11px] text-zinc-400 font-mono mt-1">
                      Assigned Label: <span className="text-[#00E5B4]">{post.trueLabel || post.fakeSlot}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleActionPost(post.id, 'APPROVE')}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded font-mono font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={14} /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleActionPost(post.id, 'REJECT')}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded font-mono font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white transition flex items-center justify-center gap-1.5"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-8">No community reports submitted.</p>
          ) : (
            reports.map((r) => (
              <div
                key={r.id}
                className="bg-[#16181F] border border-[#2A2D38] p-4 rounded-xl flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono text-rose-400 font-bold uppercase block">
                    Reason: {r.reason}
                  </span>
                  <p className="text-xs text-zinc-200 mt-0.5">{r.postCaption || `Post #${r.postId}`}</p>
                  {r.note && <p className="text-[11px] text-zinc-400 mt-1 italic">"{r.note}"</p>}
                </div>
                <span className="text-[10px] font-mono bg-[#1E2029] text-zinc-400 px-2 py-1 rounded">
                  {r.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
