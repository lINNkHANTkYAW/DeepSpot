import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Play, Pause, Eye } from 'lucide-react';
import { MediaType } from '../../types';

interface MediaPlayerProps {
  src: string;
  type?: MediaType;
  alt?: string;
  className?: string;
  allowZoom?: boolean;
  aspectRatio?: 'square' | 'video' | '4/5' | 'auto';
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({
  src,
  type = 'PHOTO',
  alt = 'Challenge Media',
  className = '',
  allowZoom = true,
  aspectRatio = 'auto',
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  const handleResetZoom = () => setZoomLevel(1);

  const getAspectClass = () => {
    if (aspectRatio === 'square') return 'aspect-square w-full';
    if (aspectRatio === '4/5') return 'aspect-[4/5] w-full';
    if (aspectRatio === 'video') return 'aspect-video w-full';
    return 'w-full max-h-[520px]';
  };

  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-zinc-950/80 border border-[#2A2D38] group ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {type === 'VIDEO' ? (
        <div className={`relative ${aspectRatio === 'square' ? 'aspect-square' : 'aspect-video'} w-full flex items-center justify-center bg-black`}>
          <video
            src={src}
            className="w-full h-full object-cover"
            loop
            muted
            playsInline
            controls={showControls}
          />
        </div>
      ) : (
        <div className={`relative ${getAspectClass()} flex items-center justify-center overflow-hidden bg-zinc-950`}>
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            style={{ transform: `scale(${zoomLevel})` }}
            className={`w-full h-full ${aspectRatio !== 'auto' ? 'object-cover' : 'max-h-[520px] object-cover'} transition-transform duration-300 ease-out cursor-zoom-in`}
          />

          {/* Zoom Overlay Controls */}
          {allowZoom && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-[#16181F]/90 backdrop-blur-md p-1.5 rounded-lg border border-[#2A2D38] opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 text-zinc-300 hover:text-white hover:bg-[#1E2029] rounded transition"
                title="Zoom In (Inspect micro details)"
              >
                <ZoomIn size={16} />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 text-zinc-300 hover:text-white hover:bg-[#1E2029] rounded transition"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              {zoomLevel > 1 && (
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="p-1.5 text-zinc-300 hover:text-white hover:bg-[#1E2029] rounded transition text-xs font-mono"
                  title="Reset Zoom"
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>
          )}

          {/* Forensics Inspection Mode Badge */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-zinc-400 border border-white/10 flex items-center gap-1.5">
            <Eye size={12} className="text-[#00E5B4]" />
            <span>HD Forensic Source</span>
          </div>
        </div>
      )}
    </div>
  );
};
