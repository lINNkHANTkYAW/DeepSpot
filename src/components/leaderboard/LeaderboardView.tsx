import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, LeaderboardFilter } from '../../types';
import { Trophy, Globe, MapPin, Flame, Award, Users, Activity, Sparkles } from 'lucide-react';

interface LeaderboardViewProps {
  currentUsername: string;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ currentUsername }) => {
  const [scope, setScope] = useState<'global' | 'country' | 'province' | 'city'>('global');
  const [period, setPeriod] = useState<'alltime' | 'month' | 'week'>('alltime');

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 14280,
    solvedToday: 3840,
    fastestGrowingRegion: 'Southeast Asia (Myanmar & Vietnam)',
  });
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?scope=${scope}&period=${period}`);
      const data = await res.json();
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
        setUserRank(data.userRank);
        if (data.stats) setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [scope, period]);

  const top3 = leaderboard.slice(0, 3);
  const restList = leaderboard.slice(3);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Title Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5B4]/10 border border-[#00E5B4]/30 text-[#00E5B4] text-xs font-mono mb-2">
          <Trophy size={14} />
          GLOBAL DETECTIVE RANKINGS
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#F0F2F7]">
          Human Pattern Recognition Hall of Fame
        </h1>
        <p className="text-xs text-zinc-400 mt-1 max-w-lg mx-auto">
          Honoring the most resilient eyes training daily to safeguard media integrity across the world.
        </p>
      </div>

      {/* Scope & Period Filter Bar */}
      <div className="bg-[#16181F] border border-[#2A2D38] p-3 rounded-xl mb-8 flex flex-wrap items-center justify-between gap-3">
        {/* Scope Tabs */}
        <div className="flex items-center gap-1 bg-[#0E0F13] p-1 rounded-lg border border-[#2A2D38]">
          <button
            type="button"
            onClick={() => setScope('global')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition ${
              scope === 'global' ? 'bg-[#1E2029] text-[#00E5B4]' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Globe size={13} /> Global
          </button>
          <button
            type="button"
            onClick={() => setScope('country')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition ${
              scope === 'country' ? 'bg-[#1E2029] text-[#00E5B4]' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            🇲🇲 National
          </button>
          <button
            type="button"
            onClick={() => setScope('city')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition ${
              scope === 'city' ? 'bg-[#1E2029] text-[#00E5B4]' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MapPin size={13} /> City
          </button>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-[#0E0F13] p-1 rounded-lg border border-[#2A2D38]">
          <button
            type="button"
            onClick={() => setPeriod('alltime')}
            className={`px-3 py-1 rounded text-xs font-mono transition ${
              period === 'alltime' ? 'bg-[#1E2029] text-[#F0F2F7]' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            All-Time
          </button>
          <button
            type="button"
            onClick={() => setPeriod('month')}
            className={`px-3 py-1 rounded text-xs font-mono transition ${
              period === 'month' ? 'bg-[#1E2029] text-[#F0F2F7]' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            This Month
          </button>
          <button
            type="button"
            onClick={() => setPeriod('week')}
            className={`px-3 py-1 rounded text-xs font-mono transition ${
              period === 'week' ? 'bg-[#1E2029] text-[#F0F2F7]' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      {/* TOP 3 PODIUM DISPLAY */}
      {!loading && top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 items-end">
          {/* SILVER - RANK 2 */}
          <div className="bg-[#16181F] border border-[#94A3B8]/40 rounded-xl p-4 text-center relative overflow-hidden order-1 shadow-lg">
            <div className="absolute top-2 right-2 text-xl">🥈</div>
            <img
              src={top3[1].avatarUrl}
              alt={top3[1].displayName}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto mb-2 object-cover border-2 border-[#94A3B8]"
            />
            <h3 className="font-display font-bold text-xs sm:text-sm text-zinc-100 truncate">
              {top3[1].displayName}
            </h3>
            <span className="text-[10px] font-mono text-zinc-400 block mb-2">
              @{top3[1].username} · {top3[1].country}
            </span>
            <div className="bg-[#0E0F13] rounded p-1.5 border border-[#2A2D38]">
              <span className="font-mono font-bold text-sm text-[#94A3B8]">
                {top3[1].totalPoints.toLocaleString()} PTS
              </span>
              <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-center gap-1 mt-0.5">
                <span>{top3[1].accuracy}% acc</span>
                <span>🔥 {top3[1].streak}d</span>
              </div>
            </div>
          </div>

          {/* GOLD - RANK 1 */}
          <div className="bg-[#16181F] border-2 border-[#F59E0B] rounded-xl p-5 text-center relative overflow-hidden order-2 shadow-[0_0_30px_rgba(245,158,11,0.2)] transform -translate-y-2">
            <div className="absolute top-2 right-2 text-2xl animate-bounce">🥇</div>
            <img
              src={top3[0].avatarUrl}
              alt={top3[0].displayName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-2 object-cover border-2 border-[#F59E0B]"
            />
            <h3 className="font-display font-bold text-sm sm:text-base text-zinc-100 truncate">
              {top3[0].displayName}
            </h3>
            <span className="text-[10px] font-mono text-[#F59E0B] block mb-2 font-semibold">
              @{top3[0].username} · {top3[0].country}
            </span>
            <div className="bg-[#0E0F13] rounded p-2 border border-[#F59E0B]/30">
              <span className="font-mono font-bold text-base text-[#F59E0B]">
                {top3[0].totalPoints.toLocaleString()} PTS
              </span>
              <div className="text-[11px] font-mono text-zinc-300 flex items-center justify-center gap-2 mt-0.5">
                <span>{top3[0].accuracy}% acc</span>
                <span>🔥 {top3[0].streak}d</span>
              </div>
            </div>
          </div>

          {/* BRONZE - RANK 3 */}
          <div className="bg-[#16181F] border border-[#C2783C]/40 rounded-xl p-4 text-center relative overflow-hidden order-3 shadow-lg">
            <div className="absolute top-2 right-2 text-xl">🥉</div>
            <img
              src={top3[2].avatarUrl}
              alt={top3[2].displayName}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto mb-2 object-cover border-2 border-[#C2783C]"
            />
            <h3 className="font-display font-bold text-xs sm:text-sm text-zinc-100 truncate">
              {top3[2].displayName}
            </h3>
            <span className="text-[10px] font-mono text-zinc-400 block mb-2">
              @{top3[2].username} · {top3[2].country}
            </span>
            <div className="bg-[#0E0F13] rounded p-1.5 border border-[#2A2D38]">
              <span className="font-mono font-bold text-sm text-[#C2783C]">
                {top3[2].totalPoints.toLocaleString()} PTS
              </span>
              <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-center gap-1 mt-0.5">
                <span>{top3[2].accuracy}% acc</span>
                <span>🔥 {top3[2].streak}d</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RANKED TABLE (RANK 4 ONWARDS) */}
      <div className="bg-[#16181F] border border-[#2A2D38] rounded-xl overflow-hidden shadow-xl mb-8">
        <div className="p-4 border-b border-[#2A2D38] font-display font-bold text-xs uppercase tracking-wider text-zinc-400 flex items-center justify-between">
          <span>Rank & Detective</span>
          <div className="flex items-center gap-8 pr-2">
            <span>Accuracy</span>
            <span>Streak</span>
            <span>Points</span>
          </div>
        </div>

        <div className="divide-y divide-[#2A2D38]">
          {restList.map((entry) => {
            const isMe = entry.username === currentUsername;
            return (
              <div
                key={entry.id}
                className={`p-3 sm:p-4 flex items-center justify-between transition ${
                  isMe ? 'bg-[#00E5B4]/10 border-l-4 border-l-[#00E5B4]' : 'hover:bg-[#1E2029]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono font-bold text-xs w-6 text-center ${
                      isMe ? 'text-[#00E5B4]' : 'text-zinc-500'
                    }`}
                  >
                    #{entry.rank}
                  </span>
                  <img
                    src={entry.avatarUrl}
                    alt={entry.displayName}
                    className="w-8 h-8 rounded-full object-cover border border-[#2A2D38]"
                  />
                  <div>
                    <div className="font-display font-bold text-xs sm:text-sm text-zinc-100 flex items-center gap-2">
                      {entry.displayName}
                      {isMe && (
                        <span className="text-[10px] font-mono bg-[#00E5B4]/20 text-[#00E5B4] px-1.5 rounded">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">
                      @{entry.username} · {entry.country}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 font-mono text-xs text-zinc-300">
                  <span className="w-12 text-right">{entry.accuracy}%</span>
                  <span className="w-10 text-right font-bold text-amber-400">🔥 {entry.streak}</span>
                  <span className="w-20 text-right font-bold text-[#F0F2F7]">
                    {entry.totalPoints.toLocaleString()} PTS
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PLATFORM STATS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#16181F] border border-[#2A2D38] p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#00E5B4]/10 text-[#00E5B4]">
            <Users size={18} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase block">Active Detectives</span>
            <span className="font-display font-bold text-base text-zinc-100">
              {stats.totalUsers.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-[#16181F] border border-[#2A2D38] p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#22C55E]/10 text-[#22C55E]">
            <Activity size={18} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase block">Solved Today</span>
            <span className="font-display font-bold text-base text-zinc-100">
              {stats.solvedToday.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-[#16181F] border border-[#2A2D38] p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
            <Sparkles size={18} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase block">Top Growth Region</span>
            <span className="font-display font-bold text-xs text-zinc-200 truncate block">
              {stats.fastestGrowingRegion}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
