import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (user: { id: string; username: string; displayName: string; avatarUrl: string; email: string; role: string }, token: string) => void;
  onSwitchToSignup: () => void;
}

export function LoginPage({ onLogin, onSwitchToSignup }: LoginPageProps) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setError('Server error. Please try again later.');
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed.');
        return;
      }

      localStorage.setItem('deepspot_token', data.token);
      onLogin(data.user, data.token);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0F13] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#141416] border border-[#282830] rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF3E00] to-[#00E5B4] p-0.5 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(255,62,0,0.3)]">
            <div className="w-full h-full bg-[#0A0A0A] rounded-[8px] flex items-center justify-center">
              <span className="text-xl">🛡️</span>
            </div>
          </div>
          <h1 className="font-display font-extrabold text-2xl text-[#F5F5F5]">DeepSpot Arena</h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">Sign in to continue training</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Username or Email</label>
            <input
              type="text"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#282830] rounded-lg px-3 py-2.5 text-sm text-[#F0F2F7] placeholder:text-zinc-600 focus:outline-none focus:border-[#00E5B4] transition"
              placeholder="linn_kyaw"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#282830] rounded-lg px-3 py-2.5 text-sm text-[#F0F2F7] placeholder:text-zinc-600 focus:outline-none focus:border-[#00E5B4] transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#FF3E00] to-[#00E5B4] text-[#0E0F13] font-bold py-2.5 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500 mt-6">
          Don't have an account?{' '}
          <button type="button" onClick={onSwitchToSignup} className="text-[#00E5B4] hover:underline">
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}
