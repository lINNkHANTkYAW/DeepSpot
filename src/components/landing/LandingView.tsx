import React from 'react';
import { ShieldAlert, Eye, Trophy, Sparkles, CheckCircle, ArrowRight, Globe, Lock, HeartHandshake } from 'lucide-react';

interface LandingViewProps {
  onStartTraining: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStartTraining }) => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5]">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-[#282830] bg-forensic-grid">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF3E00]/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF3E00]/10 border border-[#FF3E00]/30 text-[#FF3E00] text-xs font-mono font-medium mb-6">
            <Sparkles size={14} className="animate-spin text-[#FF3E00]" />
            HUMAN DEEPFAKE DETECTION ARENA
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-[#F5F5F5] max-w-4xl mx-auto leading-tight">
            Can You Spot <br />
            <span className="text-[#00E5B4] underline decoration-[#FF3E00] decoration-4 underline-offset-8">
              The Deepfake?
            </span>
          </h1>

          <p className="text-base sm:text-xl text-zinc-300 max-w-2xl mx-auto mt-6 leading-relaxed font-sans">
            Since no AI tool detects deepfakes 100% reliably, the most resilient defense is a human brain that has seen thousands of them. DeepSpot is the gym where that brain trains.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onStartTraining}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-display font-bold text-base bg-[#FF3E00] text-black hover:bg-[#FF551A] transition shadow-[0_0_25px_rgba(255,62,0,0.35)] flex items-center justify-center gap-2 group"
            >
              <span>Start Training Now</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Sample Hero Scan Line Showcase */}
          <div className="mt-12 max-w-3xl mx-auto border border-[#282830] rounded-2xl bg-[#141416] shadow-2xl relative p-3">
            <div className="relative rounded-xl overflow-hidden h-64 sm:h-80 bg-black flex items-center justify-center border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1000"
                alt="Deepfake Challenge Sample"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-0 bottom-0 w-1.5 bg-[#00E5B4] animate-scanline shadow-[0_0_20px_#00E5B4]" />

              <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded text-xs font-mono font-semibold text-[#00E5B4] border border-[#00E5B4]/40">
                LIVE FORENSIC AUDIT
              </div>

              <div className="absolute bottom-4 right-4 bg-[#FF3D5A] text-white font-mono font-bold text-xs px-3 py-1.5 rounded shadow-xl border border-black/40">
                CONFIRMED SYNTHETIC ✗
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-16 border-b border-[#282830] bg-[#141416]/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-xs font-mono uppercase tracking-wider text-[#FF3E00] block mb-1">
              CORE METHODOLOGY
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-[#F5F5F5]">
              How DeepSpot Builds Human Immunity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0A0A0A] border border-[#282830] p-6 rounded-xl relative hover:border-[#FF3E00] transition">
              <div className="w-10 h-10 rounded-lg bg-[#FF3E00]/10 text-[#FF3E00] font-mono font-bold text-sm flex items-center justify-center mb-4">
                01
              </div>
              <h3 className="font-display font-bold text-base text-[#F5F5F5] mb-2">
                Challenge Appears
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Community-sourced photos and video clips arrive in your feed. No links, no distracting text — only raw visual media.
              </p>
            </div>

            <div className="bg-[#0A0A0A] border border-[#282830] p-6 rounded-xl relative hover:border-[#00E5B4] transition">
              <div className="w-10 h-10 rounded-lg bg-[#00E5B4]/10 text-[#00E5B4] font-mono font-bold text-sm flex items-center justify-center mb-4">
                02
              </div>
              <h3 className="font-display font-bold text-base text-[#F5F5F5] mb-2">
                Inspect & Cast Vote
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Inspect specular catchlights, ear contour blending, dermal pore patterns, and lighting angles before casting your verdict.
              </p>
            </div>

            <div className="bg-[#0A0A0A] border border-[#282830] p-6 rounded-xl relative hover:border-amber-400 transition">
              <div className="w-10 h-10 rounded-lg bg-amber-400/10 text-amber-400 font-mono font-bold text-sm flex items-center justify-center mb-4">
                03
              </div>
              <h3 className="font-display font-bold text-base text-[#F5F5F5] mb-2">
                AI Forensic Breakdown
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                The electric teal scan line sweeps across the media, revealing the ground truth, community accuracy rate, and AI forensic analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* OUR MISSION SECTION */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 bg-[#141416] border border-[#FF3E00]/40 rounded-2xl p-8 sm:p-10 shadow-2xl relative">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="p-4 rounded-xl bg-[#FF3E00]/10 text-[#FF3E00] flex items-center justify-center">
              <HeartHandshake className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xs font-mono text-[#FF3E00] uppercase tracking-wider block mb-1">
                Media & Information Literacy
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#F5F5F5] tracking-tight">
                Empowering Communities Against AI Manipulation
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 mt-2.5 leading-relaxed font-sans">
                Generative AI synthetic media is escalating faster than algorithmic detection tools can keep pace. DeepSpot equips young people and vulnerable communities with cognitive pattern recognition habits that endure across evolving generative AI architectures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#282830] py-8 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 DeepSpot — Human Deepfake Detection Gym</p>
          <p className="text-zinc-400">Human Pattern Recognition vs Synthetic Manipulation</p>
        </div>
      </footer>
    </div>
  );
};
