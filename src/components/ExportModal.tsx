import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Download,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Smartphone,
  Gauge,
  Clock,
  FileVideo,
} from 'lucide-react';
import type { RenderParams } from '../utils/webglRenderer';
import {
  VideoExportManager,
  type ExportProgress,
} from '../utils/videoExporter';


interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  renderParams: RenderParams;
  currentDuration: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  renderParams,
  currentDuration,
}) => {
  const [resolution, setResolution] = useState<'4k-land' | '4k-vert' | 'fhd'>('4k-land');
  const [fps, setFps] = useState<number>(30);
  const [duration, setDuration] = useState<number>(Math.min(10, Math.max(1, currentDuration)));
  const [bitrateProfile, setBitrateProfile] = useState<'master' | 'standard'>('master');

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedBlobUrl, setCompletedBlobUrl] = useState<string | null>(null);
  const [completedFilename, setCompletedFilename] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  if (!isOpen) return null;

  const getDimensions = () => {
    switch (resolution) {
      case '4k-land':
        return { width: 3840, height: 2160, label: '3840×2160 (4K UHD 16:9)' };
      case '4k-vert':
        return { width: 2160, height: 3840, label: '2160×3840 (4K Vertikal 9:16)' };
      case 'fhd':
        return { width: 1920, height: 1080, label: '1920×1080 (Full HD 16:9)' };
    }
  };

  const handleStartExport = async () => {
    setIsExporting(true);
    setErrorMsg(null);
    setProgress(null);
    setCompletedBlobUrl(null);
    setCompletedFilename(null);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const { width, height } = getDimensions();
    const targetBitrate =
      bitrateProfile === 'master'
        ? width >= 3840
          ? 40_000_000
          : 20_000_000
        : width >= 3840
        ? 25_000_000
        : 12_000_000;

    try {
      const blob = await VideoExportManager.exportToMp4({
        width,
        height,
        fps,
        duration,
        bitrate: targetBitrate,
        params: renderParams,
        signal: abortController.signal,
        onProgress: (p) => setProgress(p),
      });

      const url = URL.createObjectURL(blob);
      const filename = `AzniMotion_Stock_4K_Tmpl${(renderParams.templateIndex + 1).toString().padStart(2, '0')}_${duration}s_${Date.now()}.mp4`;

      setCompletedBlobUrl(url);
      setCompletedFilename(filename);

      // Trigger automatic download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();

      // Confetti celebration
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setErrorMsg('Ekspor dibatalkan.');
      } else {
        console.error('Export failed:', err);
        setErrorMsg(
          err.message || 'Terjadi kesalahan saat mengekspor video. Pastikan menggunakan browser berbasis Chromium.'
        );
      }
    } finally {
      setIsExporting(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancelExport = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const dims = getDimensions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-emerald-100 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-[#f9faf8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-xs">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 tracking-tight">
                Export Video 4K MP4 Microstock
              </h2>
              <p className="text-xs text-slate-500">
                Format Standar Industri Adobe Stock & Shutterstock
              </p>
            </div>
          </div>

          {!isExporting && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[75vh]">
          {/* Resolution Options */}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Monitor className="w-4 h-4 text-emerald-600" />
              Resolusi Render:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                disabled={isExporting}
                onClick={() => setResolution('4k-land')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  resolution === '4k-land'
                    ? 'bg-emerald-50/70 border-emerald-400 text-slate-800 shadow-xs ring-1 ring-emerald-400/40'
                    : 'bg-[#f9faf8] border-slate-200/90 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">4K UHD (16:9)</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 rounded font-medium">Rekomendasi</span>
                </div>
                <span className="text-xs text-slate-700 font-mono font-semibold">3840 × 2160</span>
                <span className="text-[11px] text-slate-500">Standar Utama Stock</span>
              </button>

              <button
                type="button"
                disabled={isExporting}
                onClick={() => setResolution('4k-vert')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  resolution === '4k-vert'
                    ? 'bg-emerald-50/70 border-emerald-400 text-slate-800 shadow-xs ring-1 ring-emerald-400/40'
                    : 'bg-[#f9faf8] border-slate-200/90 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-800">4K Vertikal (9:16)</span>
                  <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <span className="text-xs text-slate-700 font-mono font-semibold">2160 × 3840</span>
                <span className="text-[11px] text-slate-500">Reels & TikTok Stock</span>
              </button>

              <button
                type="button"
                disabled={isExporting}
                onClick={() => setResolution('fhd')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  resolution === 'fhd'
                    ? 'bg-emerald-50/70 border-emerald-400 text-slate-800 shadow-xs ring-1 ring-emerald-400/40'
                    : 'bg-[#f9faf8] border-slate-200/90 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/20'
                }`}
              >
                <span className="text-xs font-bold text-slate-700">Full HD (16:9)</span>
                <span className="text-xs text-slate-600 font-mono">1920 × 1080</span>
                <span className="text-[11px] text-slate-500">Render Cepat</span>
              </button>
            </div>
          </div>

          {/* Duration & FPS Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Duration */}
            <div className="bg-[#f9faf8] border border-slate-200 rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" /> Durasi Video (Maks 10s):
                </span>
                <span className="font-mono text-emerald-700 font-bold">{duration} Detik</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={0.5}
                disabled={isExporting}
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1s</span>
                <span>5s (Populer)</span>
                <span>10s (Maks)</span>
              </div>
            </div>

            {/* Framerate */}
            <div className="bg-[#f9faf8] border border-slate-200 rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-emerald-600" /> Frame Rate (FPS):
                </span>
                <span className="font-mono text-emerald-700 font-bold">{fps} FPS</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={() => setFps(30)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    fps === 30
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200 hover:text-emerald-800'
                  }`}
                >
                  30 FPS (Standar)
                </button>
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={() => setFps(60)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    fps === 60
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200 hover:text-emerald-800'
                  }`}
                >
                  60 FPS (Ultra Smooth)
                </button>
              </div>
            </div>
          </div>

          {/* Bitrate Profile */}
          <div className="bg-[#f9faf8] border border-slate-200 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-700 block">
                Bitrate Kualitas Microstock:
              </span>
              <span className="text-[11px] text-slate-500">
                {bitrateProfile === 'master'
                  ? '35-40 Mbps (Paling Direkomendasikan untuk Kurasi Microstock)'
                  : '20-25 Mbps (Ukuran File Lebih Ringan)'}
              </span>
            </div>
            <div className="flex bg-white p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                disabled={isExporting}
                onClick={() => setBitrateProfile('master')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  bitrateProfile === 'master'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ultra 4K
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={() => setBitrateProfile('standard')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  bitrateProfile === 'standard'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Standar
              </button>
            </div>
          </div>

          {/* Export Status / Progress View */}
          {isExporting && progress && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
                  <span className="font-semibold text-emerald-900">
                    {progress.stage === 'finalizing'
                      ? 'Menyusun MP4 Container...'
                      : 'Merender Frame Offline Resolusi 4K...'}
                  </span>
                </div>
                <span className="font-mono font-bold text-emerald-800">
                  {progress.percent.toFixed(1)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-150"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>

              {/* Telemetry info */}
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono text-slate-600 pt-1 border-t border-emerald-200/60">
                <div>
                  <span className="block text-slate-400 text-[10px]">Frame</span>
                  <span className="text-slate-800 font-bold">
                    {progress.currentFrame} / {progress.totalFrames}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px]">Kecepatan</span>
                  <span className="text-slate-800 font-bold">
                    {progress.renderedFps.toFixed(1)} FPS
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px]">Perkiraan Selesai</span>
                  <span className="text-slate-800 font-bold">
                    {progress.remainingTime.toFixed(0)}s
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleCancelExport}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Batalkan Ekspor
                </button>
              </div>
            </div>
          )}

          {/* Success Box */}
          {completedBlobUrl && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Video 4K Berhasil Diekspor & Terunduh Otomatis!</span>
              </div>
              <p className="text-xs text-slate-600 font-mono truncate">
                File: {completedFilename}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={completedBlobUrl}
                  download={completedFilename || 'AzniStock_4K.mp4'}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Ulang Video</span>
                </a>
              </div>
            </div>
          )}

          {/* Error message */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-[#f9faf8] flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Total Frame:{' '}
            <span className="font-mono font-bold text-slate-800">
              {Math.round(duration * fps)} Frame
            </span>{' '}
            ({dims.label})
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isExporting}
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Tutup
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={handleStartExport}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
            >
              <FileVideo className="w-4 h-4" />
              <span>Mulai Render & Export 4K MP4</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
