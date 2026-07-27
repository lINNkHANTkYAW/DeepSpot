import React, { useState, useEffect, useCallback } from 'react';
import { User, NotificationItem } from './types';
import { Navbar } from './components/navbar/Navbar';
import { LandingView } from './components/landing/LandingView';
import { FeedView } from './components/feed/FeedView';
import { UploadWizard } from './components/upload/UploadWizard';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { ProfileView } from './components/profile/ProfileView';
import { ModerationView } from './components/admin/ModerationView';
import { AboutView } from './components/about/AboutView';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('deepspot_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState<'hidden' | 'login' | 'signup'>('hidden');

  const fetchUserData = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: getAuthHeaders(),
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setUser(null);
        return;
      }
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error('Failed to fetch user auth state:', e);
      setUser(null);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        setNotifications([]);
        return;
      }
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    async function init() {
      await Promise.all([fetchUserData(), fetchNotifications()]);
      setLoading(false);
    }
    init();
  }, [fetchUserData, fetchNotifications]);

  const handleLogin = (loggedInUser: { id: string; username: string; displayName: string; avatarUrl: string; email: string; role: string }, _token: string) => {
    setUser(loggedInUser as unknown as User);
    setAuthView('hidden');
    setActiveTab('feed');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('deepspot_token');
    setUser(null);
    setActiveTab('landing');
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
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

  if (!user || authView !== 'hidden') {
    if (authView === 'signup') {
      return <SignupPage onSignup={handleLogin} onSwitchToLogin={() => setAuthView('login')} />;
    }
    if (authView === 'login') {
      return <LoginPage onLogin={handleLogin} onSwitchToSignup={() => setAuthView('signup')} />;
    }
    return (
      <div className="min-h-screen bg-[#0E0F13] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#141416] border border-[#282830] rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FF3E00] to-[#00E5B4] p-0.5 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(255,62,0,0.3)]">
            <div className="w-full h-full bg-[#0A0A0A] rounded-[10px] flex items-center justify-center text-3xl">
              🛡️
            </div>
          </div>
          <h1 className="font-display font-extrabold text-3xl text-[#F5F5F5] mb-2">DeepSpot Arena</h1>
          <p className="text-sm text-zinc-400 mb-8 font-mono">Human Deepfake Detection Gym</p>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setAuthView('login')}
              className="w-full bg-gradient-to-r from-[#FF3E00] to-[#00E5B4] text-[#0E0F13] font-bold py-2.5 rounded-lg text-sm hover:opacity-90 transition"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthView('signup')}
              className="w-full bg-[#1C1C20] border border-[#282830] text-[#F0F2F7] font-bold py-2.5 rounded-lg text-sm hover:border-zinc-500 transition"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0F13] text-[#F0F2F7] flex flex-col selection:bg-[#00E5B4] selection:text-[#0E0F13]">
      {/* Top Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onLogout={handleLogout}
      />

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

        {activeTab === 'admin' && user && user.isModerator && (
          <ModerationView />
        )}

        {activeTab === 'admin' && user && !user.isModerator && (
          <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">Access denied.</div>
        )}

        {activeTab === 'about' && (
          <AboutView />
        )}
      </main>
    </div>
  );
}
