import React, { useState } from 'react';
import { PostType, TruthLabel, FakeSlot, MediaType } from '../../types';
import {
  Upload,
  Image,
  Video,
  Check,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface UploadWizardProps {
  onSuccess: () => void;
}

export const UploadWizard: React.FC<UploadWizardProps> = ({ onSuccess }) => {
  const [step, setStep] = useState<number>(1);

  // Form State
  const [postType, setPostType] = useState<PostType>('TYPE_A');
  const [mediaType, setMediaType] = useState<MediaType>('PHOTO');

  // Type A media
  const [mediaUrl, setMediaUrl] = useState<string>(
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800'
  );
  const [trueLabel, setTrueLabel] = useState<TruthLabel>('FAKE');

  // Type B media
  const [mediaUrlA, setMediaUrlA] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800'
  );
  const [mediaUrlB, setMediaUrlB] = useState<string>(
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800'
  );
  const [fakeSlot, setFakeSlot] = useState<FakeSlot>('SLOT_B');

  const [caption, setCaption] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('face-swap, synthetic-lighting');
  const [sourceCredit, setSourceCredit] = useState<string>('');
  const [hasConsent, setHasConsent] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMsg, setServerMsg] = useState<string>('');

  // Sample quick media selector presets
  const SAMPLE_PRESETS = [
    {
      label: 'Portrait Face Swap AI',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    },
    {
      label: 'Generative Studio Lighting',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
    },
    {
      label: 'Authentic Street Photo',
      url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800',
    },
  ];

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>, slot?: 'A' | 'B') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (postType === 'TYPE_A') {
          setMediaUrl(result);
        } else {
          if (slot === 'A') setMediaUrlA(result);
          if (slot === 'B') setMediaUrlB(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!hasConsent) return;
    setIsSubmitting(true);
    setServerMsg('');

    const tagsArr = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const body = {
      postType,
      mediaType,
      mediaUrl,
      trueLabel,
      mediaUrlA,
      mediaUrlB,
      fakeSlot,
      caption,
      tags: tagsArr,
      sourceCredit,
    };

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setServerMsg(data.message || 'Challenge uploaded and queued for moderation!');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      console.error(err);
      setServerMsg('Upload failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Step Indicator */}
      <div className="mb-6 bg-[#16181F] border border-[#2A2D38] p-4 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono text-[#00E5B4] uppercase tracking-wider block">
            Step {step} of 4
          </span>
          <h2 className="font-display font-bold text-base text-[#F0F2F7]">
            {step === 1 && 'Choose Challenge Format'}
            {step === 2 && 'Upload or Select Media'}
            {step === 3 && 'Label & Forensic Metadata'}
            {step === 4 && 'Consent & Safety Self-Certification'}
          </h2>
        </div>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-7 h-2 rounded-full transition ${
                i <= step ? 'bg-[#00E5B4]' : 'bg-[#2A2D38]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* STEP 1: Choose Format */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in">
          <p className="text-xs text-zinc-400 mb-2">
            Select the format of the deepfake detection challenge you wish to build for the community:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setPostType('TYPE_A');
                setStep(2);
              }}
              className={`p-5 rounded-xl border text-left transition hover:border-[#00E5B4] ${
                postType === 'TYPE_A'
                  ? 'bg-[#1E2029] border-[#00E5B4] shadow-[0_0_15px_rgba(0,229,180,0.15)]'
                  : 'bg-[#16181F] border-[#2A2D38]'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-[#00E5B4]/10 text-[#00E5B4] flex items-center justify-center font-bold font-mono mb-3">
                1x
              </div>
              <h3 className="font-display font-bold text-sm text-[#F0F2F7]">Single Challenge (Type A)</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Upload 1 photo or video. Community members analyze and vote: REAL or FAKE?
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setPostType('TYPE_B');
                setStep(2);
              }}
              className={`p-5 rounded-xl border text-left transition hover:border-[#A78BFA] ${
                postType === 'TYPE_B'
                  ? 'bg-[#1E2029] border-[#A78BFA] shadow-[0_0_15px_rgba(167,139,250,0.15)]'
                  : 'bg-[#16181F] border-[#2A2D38]'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-[#A78BFA]/10 text-[#A78BFA] flex items-center justify-center font-bold font-mono mb-3">
                2x
              </div>
              <h3 className="font-display font-bold text-sm text-[#F0F2F7]">Spot the Fake (Type B)</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Upload 2 side-by-side media files. Community members spot which one is synthetic.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Upload Media */}
      {step === 2 && (
        <div className="bg-[#16181F] border border-[#2A2D38] rounded-xl p-5 space-y-5 animate-in fade-in">
          {postType === 'TYPE_A' ? (
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-2">Upload Challenge Image/Video File:</label>
              <div className="border-2 border-dashed border-[#2A2D38] hover:border-[#00E5B4] rounded-xl p-6 text-center bg-[#0E0F13] transition relative">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleCustomFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-8 h-8 text-[#00E5B4] mx-auto mb-2" />
                <p className="text-xs font-semibold text-zinc-200">
                  Click or drag file here to upload
                </p>
                <p className="text-[10px] text-zinc-500 font-mono mt-1">
                  Supports JPG, PNG, WEBP, MP4
                </p>
              </div>

              {/* Sample Presets */}
              <div className="mt-4">
                <span className="text-[11px] font-mono text-zinc-400 block mb-2">Or select a preset sample:</span>
                <div className="grid grid-cols-3 gap-2">
                  {SAMPLE_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMediaUrl(p.url)}
                      className={`p-1.5 rounded border text-left transition ${
                        mediaUrl === p.url ? 'border-[#00E5B4] bg-[#00E5B4]/10' : 'border-[#2A2D38] bg-[#0E0F13]'
                      }`}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-16 object-cover rounded mb-1" />
                      <span className="text-[10px] font-mono text-zinc-300 block truncate">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A upload */}
              <div>
                <label className="block text-xs font-mono text-[#A78BFA] mb-1">Option A File:</label>
                <div className="border-2 border-dashed border-[#282830] hover:border-[#A78BFA] rounded-xl p-3 text-center bg-[#0A0A0A] relative flex flex-col items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleCustomFileUpload(e, 'A')}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div className="w-full aspect-square rounded-lg overflow-hidden bg-black mb-2 flex items-center justify-center border border-white/10">
                    <img src={mediaUrlA} alt="Option A" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">Click or drop to replace Option A</span>
                </div>
              </div>

              {/* Option B upload */}
              <div>
                <label className="block text-xs font-mono text-[#A78BFA] mb-1">Option B File:</label>
                <div className="border-2 border-dashed border-[#282830] hover:border-[#A78BFA] rounded-xl p-3 text-center bg-[#0A0A0A] relative flex flex-col items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleCustomFileUpload(e, 'B')}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div className="w-full aspect-square rounded-lg overflow-hidden bg-black mb-2 flex items-center justify-center border border-white/10">
                    <img src={mediaUrlB} alt="Option B" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">Click or drop to replace Option B</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded text-xs font-mono text-zinc-400 hover:text-zinc-200"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-5 py-2 rounded font-mono font-bold text-xs bg-[#00E5B4] text-[#0E0F13] hover:bg-[#00E5B4]/90 transition"
            >
              Next: Set Labels & Metadata
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Label & Metadata */}
      {step === 3 && (
        <div className="bg-[#16181F] border border-[#2A2D38] rounded-xl p-5 space-y-4 animate-in fade-in">
          {postType === 'TYPE_A' ? (
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-2">Ground Truth Label:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTrueLabel('REAL')}
                  className={`p-3 rounded-lg border font-mono font-bold text-xs transition ${
                    trueLabel === 'REAL'
                      ? 'bg-[#22C55E]/20 border-[#22C55E] text-[#22C55E]'
                      : 'bg-[#0E0F13] border-[#2A2D38] text-zinc-400'
                  }`}
                >
                  ✓ THIS IS REAL
                </button>
                <button
                  type="button"
                  onClick={() => setTrueLabel('FAKE')}
                  className={`p-3 rounded-lg border font-mono font-bold text-xs transition ${
                    trueLabel === 'FAKE'
                      ? 'bg-[#FF3D5A]/20 border-[#FF3D5A] text-[#FF3D5A]'
                      : 'bg-[#0E0F13] border-[#2A2D38] text-zinc-400'
                  }`}
                >
                  ✗ THIS IS FAKE
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-2">Which slot is the DEEPFAKE?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFakeSlot('SLOT_A')}
                  className={`p-3 rounded-lg border font-mono font-bold text-xs transition ${
                    fakeSlot === 'SLOT_A'
                      ? 'bg-[#A78BFA]/20 border-[#A78BFA] text-[#A78BFA]'
                      : 'bg-[#0E0F13] border-[#2A2D38] text-zinc-400'
                  }`}
                >
                  OPTION A IS FAKE
                </button>
                <button
                  type="button"
                  onClick={() => setFakeSlot('SLOT_B')}
                  className={`p-3 rounded-lg border font-mono font-bold text-xs transition ${
                    fakeSlot === 'SLOT_B'
                      ? 'bg-[#A78BFA]/20 border-[#A78BFA] text-[#A78BFA]'
                      : 'bg-[#0E0F13] border-[#2A2D38] text-zinc-400'
                  }`}
                >
                  OPTION B IS FAKE
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1">Challenge Caption / Context:</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Press conference screenshot during synthetic media audit"
              className="w-full bg-[#0E0F13] border border-[#2A2D38] text-xs text-zinc-200 rounded-lg p-2.5 outline-none focus:border-[#00E5B4]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1">Forensic Tags (comma-separated):</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="face-swap, lip-sync, voice-clone, lighting-inconsistency"
              className="w-full bg-[#0E0F13] border border-[#2A2D38] text-xs text-zinc-200 rounded-lg p-2.5 outline-none focus:border-[#00E5B4]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1">Source / Dataset Credit (optional):</label>
            <input
              type="text"
              value={sourceCredit}
              onChange={(e) => setSourceCredit(e.target.value)}
              placeholder="e.g. AI Forensics Research Dataset #2026"
              className="w-full bg-[#0E0F13] border border-[#2A2D38] text-xs text-zinc-200 rounded-lg p-2.5 outline-none focus:border-[#00E5B4]"
            />
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded text-xs font-mono text-zinc-400 hover:text-zinc-200"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-5 py-2 rounded font-mono font-bold text-xs bg-[#00E5B4] text-[#0E0F13] hover:bg-[#00E5B4]/90 transition"
            >
              Next: Safety Certification
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Consent & Safety Self-Certification */}
      {step === 4 && (
        <div className="bg-[#16181F] border border-[#2A2D38] rounded-xl p-5 space-y-5 animate-in fade-in">
          <div className="p-4 rounded-lg bg-[#0E0F13] border border-[#2A2D38] space-y-2">
            <div className="flex items-center gap-2 text-[#00E5B4] font-display font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              DeepSpot Content Policy & Safety Guidelines
            </div>
            <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-5">
              <li>No non-consensual imagery of real private individuals.</li>
              <li>No explicit, graphic, or harmful content.</li>
              <li>You self-certify that the ground truth label applied is accurate.</li>
              <li>All community uploads enter a moderation queue before going live.</li>
            </ul>
          </div>

          <label className="flex items-start gap-3 cursor-pointer p-3 bg-[#0E0F13] rounded-lg border border-[#2A2D38] hover:border-[#00E5B4] transition">
            <input
              type="checkbox"
              checked={hasConsent}
              onChange={(e) => setHasConsent(e.target.checked)}
              className="mt-1 rounded bg-zinc-900 border-zinc-700 text-[#00E5B4] focus:ring-[#00E5B4]"
            />
            <span className="text-xs text-zinc-300 leading-relaxed">
              I confirm I have the right to share this media, it contains no non-consensual imagery of private individuals, and the ground truth label is accurate.
            </span>
          </label>

          {serverMsg && (
            <div className="p-3 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <Sparkles size={14} />
              {serverMsg}
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-4 py-2 rounded text-xs font-mono text-zinc-400 hover:text-zinc-200"
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!hasConsent || isSubmitting}
              className="px-6 py-2.5 rounded-lg font-mono font-bold text-xs bg-[#00E5B4] text-[#0E0F13] hover:bg-[#00E5B4]/90 transition shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'AI Pre-screening...' : 'Submit Challenge (+15 PTS)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
