import React, { useState } from 'react';
import {
  ShieldAlert,
  Flame,
  Award,
  Upload,
  Trophy,
  User as UserIcon,
  Bell,
  CheckCircle,
  HelpCircle,
  Lock,
  Sparkles,
  Home,
  PlusSquare,
  BookOpen,
} from 'lucide-react';
import { User, NotificationItem } from '../../types';
import { StreakIndicator } from '../shared/StreakIndicator';

interface NavbarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  notifications,
  onMarkNotificationRead,
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#282830]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('feed')}
            className="flex items-center gap-3 text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FF3E00] to-[#00E5B4] p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(255,62,0,0.3)]">
              <div className="w-full h-full bg-[#0A0A0A] rounded-[6px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-[#FF3E00] group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <div className="font-display font-extrabold text-xl tracking-tight text-[#F5F5F5] flex items-center gap-2">
                DeepSpot
                <span className="text-[10px] font-mono font-semibold tracking-wider uppercase bg-[#FF3E00]/20 text-[#FF3E00] border border-[#FF3E00]/40 px-2 py-0.5 rounded">
                  ARENA
                </span>
              </div>
              <p className="text-[10px] font-mono tracking-wider text-zinc-400 hidden sm:block">
                Human Deepfake Detection Gym
              </p>
            </div>
          </button>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#141416] p-1 rounded-lg border border-[#282830]">
            <button
              type="button"
              onClick={() => setActiveTab('feed')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === 'feed'
                  ? 'bg-[#1C1C20] text-[#00E5B4] shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Training Feed
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === 'upload'
                  ? 'bg-[#1C1C20] text-[#00E5B4] shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Upload size={13} />
              Upload Challenge
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === 'leaderboard'
                  ? 'bg-[#1C1C20] text-[#00E5B4] shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Trophy size={13} />
              Leaderboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === 'about'
                  ? 'bg-[#1C1C20] text-[#00E5B4] shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Platform Guide
            </button>
            {user.isModerator && (
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-mono font-semibold transition ${
                  activeTab === 'admin'
                    ? 'bg-purple-950/80 text-purple-300 border border-purple-800/60'
                    : 'text-purple-400/80 hover:text-purple-300'
                }`}
              >
                Mod Queue
              </button>
            )}
          </nav>
        </div>

        {/* User Stats & Profile Controls */}
        <div className="flex items-center gap-3">
          {/* Daily Streak */}
          <StreakIndicator streak={user.streak} size="sm" />

          {/* User Points Badge */}
          <div className="flex items-center gap-1.5 bg-[#16181F] border border-[#2A2D38] px-2.5 py-1 rounded-md text-xs font-mono font-bold text-[#F0F2F7]">
            <Award className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>{user.totalPoints.toLocaleString()} PTS</span>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="p-2 text-zinc-400 hover:text-zinc-100 bg-[#16181F] hover:bg-[#1E2029] border border-[#2A2D38] rounded-md transition relative"
              title="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-[#16181F] border border-[#2A2D38] rounded-lg shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#2A2D38] mb-2">
                  <span className="font-display font-bold text-xs text-zinc-200">
                    Notifications
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {notifications.length} alerts
                  </span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-4">
                      No notifications yet.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => onMarkNotificationRead(n.id)}
                        className={`p-2 rounded text-xs transition cursor-pointer border ${
                          !n.read
                            ? 'bg-[#1E2029] border-[#00E5B4]/40 text-zinc-100'
                            : 'bg-[#16181F] border-[#2A2D38] text-zinc-400'
                        }`}
                      >
                        <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                          <Sparkles size={12} className="text-[#00E5B4]" />
                          {n.title}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 p-1 rounded-lg border transition ${
              activeTab === 'profile'
                ? 'border-[#00E5B4] bg-[#1E2029]'
                : 'border-[#2A2D38] bg-[#16181F] hover:border-zinc-500'
            }`}
          >
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="w-7 h-7 rounded-md object-cover"
            />
            <span className="text-xs font-semibold text-zinc-200 hidden sm:inline">
              @{user.username}
            </span>
          </button>
        </div>
      </div>

      {/* Fixed Mobile Bottom App Bar (Instagram / Facebook Style) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-[#282830] h-16 flex items-center justify-around px-2 shadow-[0_-5px_25px_rgba(0,0,0,0.8)]">
        <button
          type="button"
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center justify-center gap-1 w-16 py-1 transition ${
            activeTab === 'feed' ? 'text-[#00E5B4]' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Home size={20} className={activeTab === 'feed' ? 'stroke-[2.5]' : ''} />
          <span className="text-[10px] font-medium tracking-tight">Feed</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex flex-col items-center justify-center gap-1 w-16 py-1 transition ${
            activeTab === 'upload' ? 'text-[#00E5B4]' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <PlusSquare size={20} className={activeTab === 'upload' ? 'stroke-[2.5]' : ''} />
          <span className="text-[10px] font-medium tracking-tight">Create</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('leaderboard')}
          className={`flex flex-col items-center justify-center gap-1 w-16 py-1 transition ${
            activeTab === 'leaderboard' ? 'text-[#00E5B4]' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Trophy size={20} className={activeTab === 'leaderboard' ? 'stroke-[2.5]' : ''} />
          <span className="text-[10px] font-medium tracking-tight">Ranks</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('about')}
          className={`flex flex-col items-center justify-center gap-1 w-16 py-1 transition ${
            activeTab === 'about' ? 'text-[#00E5B4]' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BookOpen size={20} className={activeTab === 'about' ? 'stroke-[2.5]' : ''} />
          <span className="text-[10px] font-medium tracking-tight">Guide</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center gap-1 w-16 py-1 transition ${
            activeTab === 'profile' ? 'text-[#00E5B4]' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className={`w-6 h-6 rounded-full overflow-hidden border ${activeTab === 'profile' ? 'border-[#00E5B4] p-0.5' : 'border-zinc-500'}`}>
            <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
          </div>
          <span className="text-[10px] font-medium tracking-tight">Profile</span>
        </button>
      </nav>
    </header>
  );
};
