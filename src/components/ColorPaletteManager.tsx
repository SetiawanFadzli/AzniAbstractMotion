import React from 'react';
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Palette,
  Sparkles,
} from 'lucide-react';
import { STOCK_PALETTES, type ColorPreset } from '../utils/presets';
import { generateHarmoniousPalette } from '../utils/colorUtils';


interface ColorPaletteManagerProps {
  colors: string[];
  onChangeColors: (colors: string[]) => void;
}

export const ColorPaletteManager: React.FC<ColorPaletteManagerProps> = ({
  colors,
  onChangeColors,
}) => {
  const maxColors = 10;
  const minColors = 2;

  // Add a new color
  const handleAddColor = () => {
    if (colors.length >= maxColors) return;

    // Pick a harmonious variation based on the last color
    const randomHex = generateHarmoniousPalette(3)[1];
    onChangeColors([...colors, randomHex]);
  };

  // Remove a color
  const handleRemoveColor = (index: number) => {
    if (colors.length <= minColors) return;
    const newColors = colors.filter((_, i) => i !== index);
    onChangeColors(newColors);
  };

  // Change individual color
  const handleColorChange = (index: number, newHex: string) => {
    const updated = [...colors];
    updated[index] = newHex;
    onChangeColors(updated);
  };

  // Move color left
  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    const updated = [...colors];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChangeColors(updated);
  };

  // Move color right
  const handleMoveRight = (index: number) => {
    if (index === colors.length - 1) return;
    const updated = [...colors];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChangeColors(updated);
  };

  // Apply preset
  const handleApplyPreset = (preset: ColorPreset) => {
    onChangeColors(preset.colors.slice(0, 10));
  };

  // Generate random harmonious palette
  const handleRandomize = () => {
    const count = colors.length >= 3 ? colors.length : 5;
    const randomPalette = generateHarmoniousPalette(count);
    onChangeColors(randomPalette);
  };

  // Continuous CSS gradient string for preview bar
  const gradientCss = `linear-gradient(to right, ${colors.join(', ')})`;

  return (
    <div className="bg-white rounded-2xl border border-emerald-100/90 p-5 shadow-sm flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
            <Palette className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-slate-800 tracking-tight">
            Palet Warna Abstract
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-medium">
            {colors.length}/{maxColors} Warna
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRandomize}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50/70 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-200 rounded-xl text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-95"
            title="Buat perpaduan warna baru secara acak"
          >
            <Shuffle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Harmoni Acak</span>
          </button>
        </div>
      </div>

      {/* Live Gradient Ramp Preview */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
          <span>Pratinjau Gradasi Campuran:</span>
          <span className="font-mono text-[11px] text-slate-400">
            {colors.length} Stop Warna
          </span>
        </div>
        <div
          className="h-6 w-full rounded-xl shadow-xs border border-slate-200/80 transition-all duration-300"
          style={{ background: gradientCss }}
        />
      </div>

      {/* Color Slots List */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Daftar Warna Aktif (Klik untuk ubah / geser urutan):</span>
          {colors.length >= maxColors && (
            <span className="text-emerald-700 font-medium text-[11px]">
              Maksimal 10 warna tercapai
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {colors.map((color, index) => (
            <div
              key={`color-slot-${index}`}
              className="bg-[#f9faf8] border border-slate-200/90 hover:border-emerald-300 rounded-xl p-2.5 flex flex-col gap-2 transition-all group hover:bg-emerald-50/20 shadow-xs"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-mono font-bold text-slate-700">
                  #{index + 1}
                </span>
                <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleMoveLeft(index)}
                    disabled={index === 0}
                    className="p-1 hover:text-emerald-700 disabled:opacity-20 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                    title="Geser ke kiri"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveRight(index)}
                    disabled={index === colors.length - 1}
                    className="p-1 hover:text-emerald-700 disabled:opacity-20 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                    title="Geser ke kanan"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemoveColor(index)}
                    disabled={colors.length <= minColors}
                    className="p-1 text-rose-500 hover:text-rose-700 disabled:opacity-20 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                    title="Hapus warna ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Swatch & Color input */}
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-black/10 shadow-xs shrink-0 cursor-pointer">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    className="absolute -top-3 -left-3 w-14 h-14 cursor-pointer opacity-0"
                    title="Pilih warna"
                  />
                  <div
                    className="w-full h-full pointer-events-none"
                    style={{ backgroundColor: color }}
                  />
                </div>

                <input
                  type="text"
                  value={color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  className="font-mono text-xs uppercase bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 w-full focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  maxLength={7}
                />
              </div>
            </div>
          ))}

          {/* Add color button */}
          {colors.length < maxColors && (
            <button
              onClick={handleAddColor}
              className="border-2 border-dashed border-emerald-200 hover:border-emerald-400 bg-emerald-50/20 hover:bg-emerald-50/60 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 text-emerald-700 hover:text-emerald-900 transition-all cursor-pointer min-h-[82px]"
            >
              <Plus className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-semibold">Tambah Warna</span>
            </button>
          )}
        </div>
      </div>

      {/* Preset Palettes for Microstock */}
      <div className="border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Palet Trending Microstock (1-Klik Terapkan):
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {STOCK_PALETTES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className="p-2 rounded-xl bg-white hover:bg-emerald-50/50 border border-slate-200/90 hover:border-emerald-300 text-left transition-all cursor-pointer group flex flex-col gap-1.5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-emerald-800 truncate">
                  {preset.name}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  {preset.colors.length}c
                </span>
              </div>
              <div
                className="h-3.5 w-full rounded-md shadow-xs border border-black/5"
                style={{
                  background: `linear-gradient(to right, ${preset.colors.join(', ')})`,
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
