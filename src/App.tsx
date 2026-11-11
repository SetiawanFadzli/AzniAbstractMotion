import { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { PreviewCanvas } from './components/PreviewCanvas';
import { ColorPaletteManager } from './components/ColorPaletteManager';
import { MotionControls } from './components/MotionControls';
import { ExportModal } from './components/ExportModal';
import { GuideModal } from './components/GuideModal';

import type { RenderParams } from './utils/webglRenderer';
import { generateHarmoniousPalette } from './utils/colorUtils';
import { Sparkles } from 'lucide-react';

export function App() {
  // Initial state with top trending stock colors
  const [colors, setColors] = useState<string[]>([
    '#0f051d',
    '#5b13ec',
    '#ec138a',
    '#00f2fe',
    '#4facfe',
    '#05ffa1',
  ]);

  const [motionParams, setMotionParams] = useState<Omit<RenderParams, 'colors' | 'time' | 'duration'>>({
    templateIndex: 0, // 0: Silk Aurora Wave, 1: Organic Liquid Blobs
    speed: 1.0,
    turbulence: 1.2,
    scale: 1.0,
    angle: 35,
    grain: 0.35, // Anti-banding dither
    seamlessLoop: true,
  });

  const [duration, setDuration] = useState<number>(10); // Max 10 seconds as requested
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  const handleUpdateParams = (newParams: Partial<RenderParams>) => {
    setMotionParams((prev) => ({
      ...prev,
      ...newParams,
    }));
  };

  const handleRandomizePalette = () => {
    const randomCount = Math.floor(Math.random() * 4) + 4; // 4 to 7 colors
    const newColors = generateHarmoniousPalette(randomCount);
    setColors(newColors);
    showToast(`Palet baru digenerate (${newColors.length} warna)!`);
  };

  // Combine params for renderer
  const fullRenderParams: RenderParams = {
    ...motionParams,
    colors,
    time: 0,
    duration,
  };

  return (
    <div className="min-h-screen bg-[#f7f9f6] text-slate-800 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-lg border border-emerald-600 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        onOpenExport={() => setIsExportModalOpen(true)}
        onRandomize={handleRandomizePalette}
        onOpenGuide={() => setIsGuideModalOpen(true)}
      />

      {/* Main Studio Body */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Studio Hero Banner & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-emerald-100 rounded-2xl p-4 sm:px-6 shadow-xs">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Generator Video Motion Microstock Siap Jual
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Render grafis gradasi abstract 4K UHD (3840×2160) dengan loop mulus dan anti-banding dither untuk kurasi Adobe Stock & Shutterstock.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-[#f9faf8] border border-slate-200 text-xs text-slate-600 font-mono">
              Durasi: <strong className="text-emerald-700">{duration}s</strong> (Maks 10s)
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-[#f9faf8] border border-slate-200 text-xs text-slate-600 font-mono">
              Warna: <strong className="text-teal-700">{colors.length}</strong> (Maks 10)
            </span>
          </div>
        </div>

        {/* 2-Column Responsive Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live 4K Preview Viewport (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <PreviewCanvas
              renderParams={fullRenderParams}
              duration={duration}
              onSnapshotSuccess={(filename) =>
                showToast(`Still foto 4K berhasil disimpan: ${filename}`)
              }
            />
          </div>

          {/* Right Column: Color Palette System & Motion Template Controls (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <ColorPaletteManager
              colors={colors}
              onChangeColors={(newColors) => setColors(newColors)}
            />

            <MotionControls
              params={fullRenderParams}
              onChangeParams={handleUpdateParams}
              duration={duration}
              onChangeDuration={(newDur) => setDuration(newDur)}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-100/80 bg-white py-4 px-6 text-center text-xs text-slate-400">
        AzniAbstractMotion &copy; 2026 &bull; Dibuat khusus untuk Microstock Footage Asset Creator (Adobe Stock, Shutterstock, Pond5 & Envato).
      </footer>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        renderParams={fullRenderParams}
        currentDuration={duration}
      />

      {/* Guide Modal */}
      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
}

export default App;
