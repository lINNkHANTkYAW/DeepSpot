import React, { useState, useEffect } from 'react';
import { User, Badge, Post } from '../../types';
import {
  Award,
  Flame,
  Target,
  Trophy,
  MapPin,
  Edit2,
  Calendar,
  Grid,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface ProfileViewProps {
  user: User;
  onUpdateUser: (updated: Partial<User>) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateUser }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'uploads' | 'badges'>('badges');

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio || '');
  const [city, setCity] = useState(user.city || '');
  const [country, setCountry] = useState(user.country || '');

  const fetchProfileData = async () => {
    try {
      const res = await fetch('/api/profile/me');
      const data = await res.json();
      if (data.badges) setBadges(data.badges);
      if (data.uploadedPosts) setMyPosts(data.uploadedPosts);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleSaveProfile = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, bio, city, country }),
      });
      const data = await res.json();
      if (data.user) {
        onUpdateUser(data.user);
        setIsEditing(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header Card */}
      <div className="bg-[#16181F] border border-[#2A2D38] rounded-xl p-6 shadow-xl mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#00E5B4] via-[#A78BFA] to-[#F59E0B]" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-4">
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="w-20 h-20 rounded-xl object-cover border-2 border-[#00E5B4] shadow-[0_0_20px_rgba(0,229,180,0.2)]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-xl text-[#F0F2F7]">
                  {user.displayName}
                </h1>
                <span className="text-xs font-mono uppercase bg-[#00E5B4]/10 text-[#00E5B4] border border-[#00E5B4]/30 px-2 py-0.5 rounded">
                  {user.role}
                </span>
              </div>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">@{user.username}</p>
              {user.city && (
                <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1 font-mono">
                  <MapPin size={12} className="text-[#00E5B4]" />
                  {user.city}, {user.country}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E2029] hover:bg-zinc-800 border border-[#2A2D38] text-zinc-200 text-xs font-mono transition"
          >
            <Edit2 size={13} /> Edit Profile
          </button>
        </div>

        {user.bio && (
          <p className="text-xs text-zinc-300 mt-4 pt-4 border-t border-[#2A2D38] leading-relaxed">
            {user.bio}
          </p>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-[#2A2D38]">
          <div className="bg-[#0E0F13] p-3 rounded-lg border border-[#2A2D38]">
            <span className="text-[10px] font-mono text-zinc-400 uppercase block">Total Points</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-base text-[#F59E0B] mt-0.5">
              <Award size={16} />
              {user.totalPoints.toLocaleString()} PTS
            </div>
          </div>

          <div className="bg-[#0E0F13] p-3 rounded-lg border border-[#2A2D38]">
            <span className="text-[10px] font-mono text-zinc-400 uppercase block">Accuracy Rate</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-base text-[#22C55E] mt-0.5">
              <Target size={16} />
              {user.accuracy}%
            </div>
          </div>

          <div className="bg-[#0E0F13] p-3 rounded-lg border border-[#2A2D38]">
            <span className="text-[10px] font-mono text-zinc-400 uppercase block">Current Streak</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-base text-amber-400 mt-0.5">
              <Flame size={16} />
              {user.streak} Days
            </div>
          </div>

          <div className="bg-[#0E0F13] p-3 rounded-lg border border-[#2A2D38]">
            <span className="text-[10px] font-mono text-zinc-400 uppercase block">National Rank</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-base text-[#00E5B4] mt-0.5">
              <Trophy size={16} />
              #1 Myanmar
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 mb-4 border-b border-[#2A2D38] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition ${
            activeTab === 'badges'
              ? 'bg-[#1E2029] text-[#00E5B4] border border-[#00E5B4]/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Badges & Honors ({badges.filter((b) => b.unlockedAt).length}/{badges.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('uploads')}
          className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition ${
            activeTab === 'uploads'
              ? 'bg-[#1E2029] text-[#00E5B4] border border-[#00E5B4]/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          My Uploaded Challenges ({myPosts.length})
        </button>
      </div>

      {/* Badges Shelf */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in">
          {badges.map((b) => {
            const isUnlocked = Boolean(b.unlockedAt);
            return (
              <div
                key={b.id}
                className={`p-4 rounded-xl border transition relative overflow-hidden ${
                  isUnlocked
                    ? 'bg-[#16181F] border-[#00E5B4]/40 shadow-[0_0_15px_rgba(0,229,180,0.1)]'
                    : 'bg-[#0E0F13]/60 border-[#2A2D38] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">{b.icon}</span>
                  {isUnlocked ? (
                    <span className="text-[10px] font-mono bg-[#00E5B4]/20 text-[#00E5B4] px-1.5 py-0.5 rounded">
                      UNLOCKED
                    </span>
                  ) : (
                    <Lock size={14} className="text-zinc-600" />
                  )}
                </div>
                <h3 className="font-display font-bold text-xs text-[#F0F2F7]">{b.name}</h3>
                <p className="text-[11px] text-zinc-400 mt-1 leading-normal">{b.description}</p>
                <span className="text-[9px] font-mono text-zinc-500 block mt-2 pt-2 border-t border-[#2A2D38]">
                  Req: {b.condition}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Uploaded Challenges */}
      {activeTab === 'uploads' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
          {myPosts.length === 0 ? (
            <p className="text-xs text-zinc-500 col-span-2 text-center py-8">
              You haven't uploaded any deepfake challenges yet.
            </p>
          ) : (
            myPosts.map((post) => (
              <div
                key={post.id}
                className="bg-[#16181F] border border-[#2A2D38] rounded-xl p-4 flex gap-3 items-center"
              >
                <img
                  src={post.mediaUrl || post.mediaUrlA || ''}
                  alt="Post preview"
                  className="w-16 h-16 rounded-lg object-cover border border-[#2A2D38]"
                />
                <div>
                  <span className="text-[10px] font-mono text-[#00E5B4] uppercase block">
                    {post.postType} · {post.status}
                  </span>
                  <p className="text-xs font-bold text-zinc-200 line-clamp-1">{post.caption}</p>
                  <span className="text-[10px] font-mono text-zinc-400 mt-1 block">
                    {post.totalVotes} votes · {post.accuracyRate}% community accuracy
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16181F] border border-[#2A2D38] rounded-xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-display font-bold text-base text-[#F0F2F7] mb-4">Edit Profile</h3>

            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Display Name:</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#0E0F13] border border-[#2A2D38] text-xs text-zinc-200 rounded-lg p-2.5 outline-none focus:border-[#00E5B4]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Bio:</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-[#0E0F13] border border-[#2A2D38] text-xs text-zinc-200 rounded-lg p-2.5 outline-none focus:border-[#00E5B4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">City:</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#0E0F13] border border-[#2A2D38] text-xs text-zinc-200 rounded-lg p-2.5 outline-none focus:border-[#00E5B4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">Country:</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#0E0F13] border border-[#2A2D38] text-xs text-zinc-200 rounded-lg p-2.5 outline-none focus:border-[#00E5B4]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-5 py-2 text-xs font-mono font-bold bg-[#00E5B4] text-[#0E0F13] rounded-lg hover:bg-[#00E5B4]/90 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
