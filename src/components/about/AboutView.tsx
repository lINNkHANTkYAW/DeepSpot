import React from 'react';
import { ShieldCheck, HeartHandshake, Award, Sparkles, BookOpen, Target, Users } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00E5B4]/10 border border-[#00E5B4]/30 text-[#00E5B4] text-xs font-mono mb-3">
          <BookOpen size={14} />
          PLATFORM ARCHITECTURE & MISSION GUIDE
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-[#F5F5F5]">
          About DeepSpot: The Gym for Human Pattern Recognition
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl mx-auto font-sans">
          Building community cognitive resilience against synthetic media and generative AI manipulation.
        </p>
      </div>

      {/* Core Thesis Card */}
      <div className="bg-[#141416] border border-[#00E5B4]/30 rounded-xl p-6 shadow-xl mb-6">
        <h2 className="font-display font-bold text-base text-[#00E5B4] mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          The Core Thesis
        </h2>
        <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans">
          "Since no AI tool can reliably detect deepfakes 100% of the time, the most resilient defense is a human brain that has seen thousands of them. DeepSpot is the gym where that brain trains."
        </p>
      </div>

      {/* Points & Difficulty Calibration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#141416] border border-[#282830] p-5 rounded-xl">
          <h3 className="font-display font-bold text-sm text-zinc-100 mb-2.5 flex items-center gap-2">
            <Award className="text-[#F59E0B]" size={18} />
            Gamification & Point Allocation
          </h3>
          <ul className="text-xs text-zinc-400 space-y-2 list-disc pl-4 font-sans">
            <li><strong>Beginner Post:</strong> +10 PTS</li>
            <li><strong>Intermediate Post:</strong> +20 PTS</li>
            <li><strong>Advanced Post:</strong> +35 PTS</li>
            <li><strong>Expert Post:</strong> +50 PTS</li>
            <li><strong>Early Detective Bonus:</strong> +5 PTS for first 20 votes</li>
            <li><strong>Streak Milestones:</strong> +25 PTS on 7-day streak</li>
          </ul>
        </div>

        <div className="bg-[#141416] border border-[#282830] p-5 rounded-xl">
          <h3 className="font-display font-bold text-sm text-zinc-100 mb-2.5 flex items-center gap-2">
            <Target className="text-[#00E5B4]" size={18} />
            Dynamic Difficulty Calibration
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed mb-2.5 font-sans">
            After a challenge receives 15+ community votes, its difficulty tier is automatically assigned based on voter accuracy:
          </p>
          <ul className="text-xs text-zinc-400 space-y-1 font-mono">
            <li>• Beginner: &gt; 80% community accuracy</li>
            <li>• Intermediate: 50–80% community accuracy</li>
            <li>• Advanced: 30–50% community accuracy</li>
            <li>• Expert: &lt; 30% community accuracy</li>
          </ul>
        </div>
      </div>

      {/* Protection of Vulnerable Populations */}
      <div className="bg-[#141416] border border-[#282830] p-6 rounded-xl mb-6">
        <h3 className="font-display font-bold text-base text-zinc-100 mb-2 flex items-center gap-2">
          <Users className="text-purple-400" size={18} />
          Protecting Elders & Vulnerable Populations
        </h3>
        <p className="text-xs text-zinc-300 leading-relaxed font-sans">
          Deepfake scams disproportionately target senior citizens and first-time internet users with fake voice calls, synthesized family video messages, and doctored news bulletins. DeepSpot serves as an accessible training tool that youth can share with elder family members to practice recognizing synthetic anomalies in a safe, interactive environment.
        </p>
      </div>

      {/* Content Moderation Rules */}
      <div className="bg-[#141416] border border-[#282830] p-6 rounded-xl">
        <h3 className="font-display font-bold text-base text-zinc-100 mb-2 flex items-center gap-2">
          <ShieldCheck className="text-emerald-400" size={18} />
          Content Moderation Policy
        </h3>
        <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-5 font-sans">
          <li>No faces of real private individuals without consent.</li>
          <li>No explicit or harmful content.</li>
          <li>All community uploads enter a PENDING state for moderation review before going live.</li>
          <li>Community reports trigger immediate safety review.</li>
        </ul>
      </div>
    </div>
  );
};
