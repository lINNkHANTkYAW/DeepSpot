import React from 'react';
import { Filter, SlidersHorizontal, Image, Video, Layers, Sparkles } from 'lucide-react';

interface FeedFilterBarProps {
  mediaType: string;
  setMediaType: (val: string) => void;
  difficulty: string;
  setDifficulty: (val: string) => void;
  postType: string;
  setPostType: (val: string) => void;
  sort: string;
  setSort: (val: string) => void;
}

export const FeedFilterBar: React.FC<FeedFilterBarProps> = ({
  mediaType,
  setMediaType,
  difficulty,
  setDifficulty,
  postType,
  setPostType,
  sort,
  setSort,
}) => {
  return (
    <div className="bg-[#141416] border border-[#282830] rounded-xl p-3 sm:p-4 mb-6 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Media Type Tabs */}
        <div className="flex items-center gap-1 bg-[#0A0A0A] p-1 rounded-lg border border-[#282830]">
          <button
            type="button"
            onClick={() => setMediaType('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              mediaType === 'ALL'
                ? 'bg-[#1C1C20] text-[#00E5B4] shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Media
          </button>
          <button
            type="button"
            onClick={() => setMediaType('PHOTO')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              mediaType === 'PHOTO'
                ? 'bg-[#1C1C20] text-[#00E5B4] shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Image size={13} />
            Photos
          </button>
          <button
            type="button"
            onClick={() => setMediaType('VIDEO')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              mediaType === 'VIDEO'
                ? 'bg-[#1C1C20] text-[#00E5B4] shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Video size={13} />
            Videos
          </button>
        </div>

        {/* Challenge Format Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-zinc-400 hidden sm:inline">Format:</label>
          <select
            value={postType}
            onChange={(e) => setPostType(e.target.value)}
            className="bg-[#0A0A0A] border border-[#282830] text-xs font-mono text-zinc-200 rounded-lg px-2.5 py-1.5 focus:border-[#FF3E00] outline-none"
          >
            <option value="ALL">All Formats</option>
            <option value="TYPE_A">Single (Real/Fake)</option>
            <option value="TYPE_B">Dual (Spot Fake)</option>
          </select>

          {/* Difficulty Filter */}
          <label className="text-xs font-mono text-zinc-400 hidden sm:inline">Level:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="bg-[#0A0A0A] border border-[#282830] text-xs font-mono text-zinc-200 rounded-lg px-2.5 py-1.5 focus:border-[#FF3E00] outline-none"
          >
            <option value="ALL">All Levels</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
            <option value="EXPERT">Expert</option>
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-[#0A0A0A] border border-[#282830] text-xs font-mono text-zinc-200 rounded-lg px-2.5 py-1.5 focus:border-[#FF3E00] outline-none"
          >
            <option value="NEWEST">Newest</option>
            <option value="MOST_VOTED">Most Voted</option>
            <option value="HARDEST">Hardest</option>
          </select>
        </div>
      </div>
    </div>
  );
};
