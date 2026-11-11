import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Camera,
  Layers,
  Sparkles,
  Monitor,
  Smartphone,
  Square,
} from 'lucide-react';
import { WebGLGradientRenderer, type RenderParams } from '../utils/webglRenderer';
import { VideoExportManager } from '../utils/videoExporter';
import { MOTION_TEMPLATES } from '../utils/presets';


interface PreviewCanvasProps {
  renderParams: RenderParams;
  duration: number; // Max 10
  onSnapshotSuccess?: (filename: string) => void;
}

export type AspectRatio = '16:9' | '9:16' | '1:1';

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  renderParams,
  duration,
  onSnapshotSuccess,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<WebGLGradientRenderer | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [fps, setFps] = useState<number>(60);
  const [isSnapshotting, setIsSnapshotting] = useState<boolean>(false);

  // Keep latest renderParams in a ref for animation loop
  const paramsRef = useRef<RenderParams>(renderParams);
  paramsRef.current = renderParams;

  const durationRef = useRef<number>(duration);
  durationRef.current = duration;

  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentTimeRef = useRef<number>(currentTime);
  currentTimeRef.current = currentTime;

  // Initialize renderer
  useEffect(() => {
    if (!canvasRef.current) return;
    const renderer = new WebGLGradientRenderer(canvasRef.current);
    rendererRef.current = renderer;

    return () => {
      renderer.destroy();
      rendererRef.current = null;
    };
  }, []);

  // Animation frame loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = performance.now();
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const loop = (timestamp: number) => {
      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      // Update FPS counter every 500ms
      frameCount++;
      if (timestamp - lastFpsUpdate >= 500) {
        setFps(Math.round((frameCount / (timestamp - lastFpsUpdate)) * 1000));
        frameCount = 0;
        lastFpsUpdate = timestamp;
      }

      if (isPlayingRef.current) {
        let newTime = currentTimeRef.current + delta;
        if (newTime >= durationRef.current) {
          newTime = 0; // Loop seamless
        }
        currentTimeRef.current = newTime;
        setCurrentTime(newTime);
      }

      if (rendererRef.current && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.round(rect.width * dpr);
        const h = Math.round(rect.height * dpr);

        if (w > 0 && h > 0) {
          const currentParams = {
            ...paramsRef.current,
            time: currentTimeRef.current,
            duration: durationRef.current,
          };
          rendererRef.current.render(currentParams, w, h);
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Play / Pause toggle
  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleReset = () => {
    currentTimeRef.current = 0;
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    currentTimeRef.current = time;
    setCurrentTime(time);
  };

  // Fullscreen
  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  // 4K Snapshot
  const handleTakeSnapshot = async () => {
    setIsSnapshotting(true);
    try {
      const w = aspectRatio === '16:9' ? 3840 : aspectRatio === '9:16' ? 2160 : 3840;
      const h = aspectRatio === '16:9' ? 2160 : aspectRatio === '9:16' ? 3840 : 3840;
      const blob = await VideoExportManager.exportStillImage(
        {
          ...renderParams,
          time: currentTimeRef.current,
          duration: durationRef.current,
        },
        w,
        h
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `Azni_Stock_Gradient_${w}x${h}_${Date.now()}.png`;
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      if (onSnapshotSuccess) {
        onSnapshotSuccess(filename);
      }
    } catch (err) {
      console.error('Error taking 4K snapshot:', err);
    } finally {
      setIsSnapshotting(false);
    }
  };

  // Aspect ratio dimension classes
  const getAspectClass = () => {
    switch (aspectRatio) {
      case '16:9':
        return 'aspect-video w-full max-h-[580px]';
      case '9:16':
        return 'aspect-[9/16] h-[540px] max-w-full mx-auto';
      case '1:1':
        return 'aspect-square h-[520px] max-w-full mx-auto';
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-2xl border border-emerald-100/90 p-4 sm:p-5 flex flex-col shadow-sm relative overflow-hidden"
    >
      {/* Top viewport status bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/70 rounded-lg text-emerald-800 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono">{fps} FPS</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-lg text-slate-600 max-w-[220px]">
            <Layers className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{MOTION_TEMPLATES[renderParams.templateIndex]?.name || `Template #${renderParams.templateIndex + 1}`}</span>
          </div>

          {renderParams.seamlessLoop && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span className="font-semibold text-[11px]">Seamless Loop 100%</span>
            </div>
          )}
        </div>

        {/* Viewport Aspect switcher & tools */}
        <div className="flex items-center gap-1.5">
          <div className="flex bg-slate-100/80 p-0.5 rounded-xl border border-slate-200/70">
            <button
              onClick={() => setAspectRatio('16:9')}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 text-[11px] font-medium transition-all ${
                aspectRatio === '16:9'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="16:9 Landscape 4K (Standard Stock)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>16:9</span>
            </button>
            <button
              onClick={() => setAspectRatio('9:16')}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 text-[11px] font-medium transition-all ${
                aspectRatio === '9:16'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="9:16 Vertical 4K (Reels / TikTok Stock)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>9:16</span>
            </button>
            <button
              onClick={() => setAspectRatio('1:1')}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 text-[11px] font-medium transition-all ${
                aspectRatio === '1:1'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="1:1 Square (Social Media)"
            >
              <Square className="w-3.5 h-3.5" />
              <span>1:1</span>
            </button>
          </div>

          <button
            onClick={handleTakeSnapshot}
            disabled={isSnapshotting}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl text-slate-700 transition-all cursor-pointer text-xs font-medium disabled:opacity-50 shadow-xs"
            title="Download frame saat ini sebagai Still Foto PNG 4K UHD"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Foto 4K</span>
          </button>

          <button
            onClick={handleFullscreen}
            className="p-1.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl text-slate-600 transition-all cursor-pointer shadow-xs"
            title="Layar Penuh"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Viewport Frame */}
      <div className="relative flex-1 flex items-center justify-center bg-slate-950 rounded-xl border border-slate-800 overflow-hidden min-h-[320px] p-2 shadow-inner">
        <canvas
          ref={canvasRef}
          className={`${getAspectClass()} rounded-lg shadow-2xl object-contain transition-all`}
        />
      </div>

      {/* Playback Scrubber & Controls */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2.5">
        {/* Scrubber slider */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-slate-600 min-w-[42px]">
            {currentTime.toFixed(2)}s
          </span>
          <div className="relative flex-1 group">
            <input
              type="range"
              min={0}
              max={duration}
              step={0.02}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
            />
          </div>
          <span className="font-mono text-xs text-slate-500 min-w-[42px] text-right">
            {duration.toFixed(1)}s
          </span>
        </div>

        {/* Buttons Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm shadow-emerald-600/20"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <button
              onClick={handleReset}
              className="w-9 h-9 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 flex items-center justify-center transition-all cursor-pointer border border-slate-200 hover:border-emerald-200 shadow-xs"
              title="Kembali ke awal (0.0s)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-600">
              Resolusi Render Target: {aspectRatio === '16:9' ? '3840×2160 (4K)' : aspectRatio === '9:16' ? '2160×3840 (4K Vertikal)' : '3840×3840'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
