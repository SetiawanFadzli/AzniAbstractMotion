import React from 'react';
import {
  Sliders,
  Wind,
  Layers,
  Sparkles,
  Compass,
  ZoomIn,
  Activity,
  ShieldCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { MOTION_TEMPLATES } from '../utils/presets';
import type { RenderParams } from '../utils/webglRenderer';

interface MotionControlsProps {
  params: RenderParams;
  onChangeParams: (newParams: Partial<RenderParams>) => void;
  duration: number;
  onChangeDuration: (duration: number) => void;
}

export const MotionControls: React.FC<MotionControlsProps> = ({
  params,
  onChangeParams,
  duration,
  onChangeDuration,
}) => {
  // Ensure valid template index within 0 to 99
  const currentTemplateIndex = Math.min(
    MOTION_TEMPLATES.length - 1,
    Math.max(0, params.templateIndex || 0)
  );
  const activeTemplate = MOTION_TEMPLATES[currentTemplateIndex] || MOTION_TEMPLATES[0];

  // Group templates by category for the combobox optgroups
  const categories = React.useMemo(() => {
    const map = new Map<string, typeof MOTION_TEMPLATES>();
    MOTION_TEMPLATES.forEach((tmpl) => {
      const list = map.get(tmpl.category) || [];
      list.push(tmpl);
      map.set(tmpl.category, list);
    });
    return Array.from(map.entries());
  }, []);

  const handleSelectTemplate = (newIndex: number) => {
    const tmpl = MOTION_TEMPLATES[newIndex];
    if (!tmpl) return;
    onChangeParams({
      templateIndex: newIndex,
      speed: tmpl.defaultSpeed,
      turbulence: tmpl.defaultTurbulence,
      scale: tmpl.defaultScale,
      angle: tmpl.defaultAngle,
    });
  };

  const handlePrevTemplate = () => {
    const prevIdx = (currentTemplateIndex - 1 + MOTION_TEMPLATES.length) % MOTION_TEMPLATES.length;
    handleSelectTemplate(prevIdx);
  };

  const handleNextTemplate = () => {
    const nextIdx = (currentTemplateIndex + 1) % MOTION_TEMPLATES.length;
    handleSelectTemplate(nextIdx);
  };

  return (
    <div className="bg-white rounded-2xl border border-emerald-100/90 p-5 shadow-sm flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
            <Sliders className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-slate-800 tracking-tight">
            Parameter Gerakan & Template Motion
          </h2>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-medium">
          100 Template
        </span>
      </div>

      {/* Template Selector Combobox */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs">
          <label
            htmlFor="template-select"
            className="font-semibold text-slate-700 flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Pilih Template Gerakan (100 Pilihan):</span>
          </label>
          <span className="text-[11px] text-emerald-700 font-mono font-medium">
            Template #{currentTemplateIndex + 1} dari 100
          </span>
        </div>

        {/* Combobox with Previous and Next Jump Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevTemplate}
            className="p-2.5 rounded-xl bg-[#f9faf8] hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-600 hover:text-emerald-800 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Template Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="relative flex-1">
            <select
              id="template-select"
              value={currentTemplateIndex}
              onChange={(e) => handleSelectTemplate(parseInt(e.target.value, 10))}
              className="w-full bg-[#f9faf8] hover:bg-white text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 py-2.5 pl-3 pr-8 transition-all cursor-pointer shadow-xs appearance-none"
            >
              {categories.map(([categoryName, templates]) => (
                <optgroup key={categoryName} label={categoryName} className="font-bold text-slate-700 bg-white">
                  {templates.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.index} className="font-medium text-slate-800 py-1">
                      {tmpl.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <button
            type="button"
            onClick={handleNextTemplate}
            className="p-2.5 rounded-xl bg-[#f9faf8] hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-600 hover:text-emerald-800 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Template Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Template Description Banner */}
        <div className="bg-emerald-50/50 border border-emerald-200/70 rounded-xl p-3 flex flex-col gap-1 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900">
              {activeTemplate.name}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              {activeTemplate.badge}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {activeTemplate.description}
          </p>
        </div>
      </div>

      {/* Duration Control (Max 10s as requested) */}
      <div className="bg-[#f9faf8] border border-slate-200/80 rounded-xl p-3.5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Durasi Video (Maksimal 10 Detik):</span>
          </div>
          <span className="font-mono text-xs font-bold text-emerald-700">
            {duration} Detik
          </span>
        </div>

        <div className="flex items-center gap-2">
          {[3, 5, 8, 10].map((sec) => (
            <button
              key={sec}
              onClick={() => onChangeDuration(sec)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                duration === sec
                  ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200 hover:text-emerald-800'
              }`}
            >
              {sec}s {sec === 10 ? '(Maks)' : ''}
            </button>
          ))}
        </div>

        <input
          type="range"
          min={1}
          max={10}
          step={0.5}
          value={duration}
          onChange={(e) => onChangeDuration(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Speed */}
        <div className="bg-[#f9faf8] border border-slate-200/80 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700 font-medium flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" /> Kecepatan Motion
            </span>
            <span className="font-mono text-emerald-700 font-bold">
              {params.speed.toFixed(1)}x
            </span>
          </div>
          <input
            type="range"
            min={0.2}
            max={3.0}
            step={0.1}
            value={params.speed}
            onChange={(e) => onChangeParams({ speed: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        {/* Turbulence */}
        <div className="bg-[#f9faf8] border border-slate-200/80 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700 font-medium flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-emerald-600" /> Distorsi / Turbulensi
            </span>
            <span className="font-mono text-emerald-700 font-bold">
              {params.turbulence.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min={0.2}
            max={3.0}
            step={0.1}
            value={params.turbulence}
            onChange={(e) =>
              onChangeParams({ turbulence: parseFloat(e.target.value) })
            }
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        {/* Scale */}
        <div className="bg-[#f9faf8] border border-slate-200/80 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700 font-medium flex items-center gap-1.5">
              <ZoomIn className="w-3.5 h-3.5 text-emerald-600" /> Skala / Kerapatan Gelombang
            </span>
            <span className="font-mono text-emerald-700 font-bold">
              {params.scale.toFixed(1)}x
            </span>
          </div>
          <input
            type="range"
            min={0.5}
            max={2.5}
            step={0.1}
            value={params.scale}
            onChange={(e) => onChangeParams({ scale: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        {/* Angle */}
        <div className="bg-[#f9faf8] border border-slate-200/80 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700 font-medium flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-600" /> Arah Aliran (Derajat)
            </span>
            <span className="font-mono text-emerald-700 font-bold">
              {params.angle}°
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            step={5}
            value={params.angle}
            onChange={(e) => onChangeParams({ angle: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>
      </div>

      {/* Microstock Specific Features: Anti-Banding Dither & Seamless Loop */}
      <div className="border-t border-slate-100 pt-3 flex flex-col gap-3">
        {/* Anti-Banding Dither slider */}
        <div className="bg-[#f9faf8] border border-slate-200/80 rounded-xl p-3.5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Anti-Banding Dither & Film Grain (Standar Microstock):</span>
            </div>
            <span className="font-mono text-emerald-700 font-bold">
              {Math.round(params.grain * 100)}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Mencegah garis patah (color banding) pada kompresi 8-bit MP4, menjamin persetujuan inspeksi kurator Adobe Stock & Shutterstock.
          </p>
          <input
            type="range"
            min={0.0}
            max={1.0}
            step={0.05}
            value={params.grain}
            onChange={(e) => onChangeParams({ grain: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        {/* Seamless Loop Toggle */}
        <div className="bg-[#f9faf8] border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Seamless Loop (Looped Background)</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono font-medium">
                  Sangat Diminati Pembeli
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Frame akhir tersambung sempurna ke frame awal tanpa loncatan grafis (0 seam).
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={params.seamlessLoop}
              onChange={(e) => onChangeParams({ seamlessLoop: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
};
