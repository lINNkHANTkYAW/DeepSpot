import React, { useState } from 'react';

interface SignupPageProps {
  onSignup: (user: { id: string; username: string; displayName: string; avatarUrl: string; email: string; role: string }, token: string) => void;
  onSwitchToLogin: () => void;
}

export function SignupPage({ onSignup, onSwitchToLogin }: SignupPageProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, displayName, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Signup failed.');
        return;
      }

      localStorage.setItem('deepspot_token', data.token);
      onSignup(data.user, data.token);
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
          <p className="text-xs text-zinc-400 mt-1 font-mono">Join the detection gym</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#282830] rounded-lg px-3 py-2.5 text-sm text-[#F0F2F7] placeholder:text-zinc-600 focus:outline-none focus:border-[#00E5B4] transition"
              placeholder="Detective Name"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#282830] rounded-lg px-3 py-2.5 text-sm text-[#F0F2F7] placeholder:text-zinc-600 focus:outline-none focus:border-[#00E5B4] transition"
              placeholder="detective_01"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#282830] rounded-lg px-3 py-2.5 text-sm text-[#F0F2F7] placeholder:text-zinc-600 focus:outline-none focus:border-[#00E5B4] transition"
              placeholder="you@example.com"
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
              placeholder="At least 8 characters"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#FF3E00] to-[#00E5B4] text-[#0E0F13] font-bold py-2.5 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500 mt-6">
          Already have an account?{' '}
          <button type="button" onClick={onSwitchToLogin} className="text-[#00E5B4] hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
