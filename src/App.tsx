import React, { useState, useEffect } from 'react';
import { User, NotificationItem } from './types';
import { Navbar } from './components/navbar/Navbar';
import { LandingView } from './components/landing/LandingView';
import { FeedView } from './components/feed/FeedView';
import { UploadWizard } from './components/upload/UploadWizard';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { ProfileView } from './components/profile/ProfileView';
import { ModerationView } from './components/admin/ModerationView';
import { AboutView } from './components/about/AboutView';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch (e) {
      console.error('Failed to fetch user auth state:', e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    async function init() {
      await Promise.all([fetchUserData(), fetchNotifications()]);
      setLoading(false);
    }
    init();
  }, []);

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateUser = (updated: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updated });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E0F13] flex flex-col items-center justify-center text-zinc-400 font-mono text-xs">
        <div className="w-10 h-10 border-2 border-[#00E5B4] border-t-transparent rounded-full animate-spin mb-3" />
        <span>Loading DeepSpot Arena...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0F13] text-[#F0F2F7] flex flex-col selection:bg-[#00E5B4] selection:text-[#0E0F13]">
      {/* Top Navbar */}
      {user && (
        <Navbar
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1 pb-20 md:pb-8">
        {activeTab === 'landing' && (
          <LandingView onStartTraining={() => setActiveTab('feed')} />
        )}

        {activeTab === 'feed' && (
          <FeedView onRefreshUser={fetchUserData} />
        )}

        {activeTab === 'upload' && (
          <UploadWizard onSuccess={() => setActiveTab('feed')} />
        )}

        {activeTab === 'leaderboard' && user && (
          <LeaderboardView currentUsername={user.username} />
        )}

        {activeTab === 'profile' && user && (
          <ProfileView user={user} onUpdateUser={handleUpdateUser} />
        )}

        {activeTab === 'admin' && (
          <ModerationView />
        )}

        {activeTab === 'about' && (
          <AboutView />
        )}
      </main>
    </div>
  );
}
