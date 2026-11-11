import React from 'react';
import { Video, HelpCircle, CheckCircle2, Download, Wand2 } from 'lucide-react';

interface HeaderProps {
  onOpenExport: () => void;
  onRandomize: () => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenExport,
  onRandomize,
  onOpenGuide,
}) => {
  return (
    <header className="border-b border-emerald-100/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-xs">
          <Video className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
              AzniAbstractMotion
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              4K Stock Studio
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">
            Abstract Gradient Motion Generator for Adobe Stock & Shutterstock
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden md:flex items-center gap-2 mr-2 border-r border-slate-200 pr-4 text-xs text-slate-500">
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 4K MP4 Ready
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1 text-teal-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> 10-Color Mesh
          </span>
        </div>

        <button
          onClick={onRandomize}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-emerald-800 bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-200 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
          title="Acak kombinasi warna harmonis baru"
        >
          <Wand2 className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Acak Palet</span>
        </button>

        <button
          onClick={onOpenGuide}
          className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/60 rounded-xl transition-all border border-transparent hover:border-emerald-200 cursor-pointer"
          title="Panduan Microstock"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all cursor-pointer transform active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Export 4K MP4</span>
        </button>
      </div>
    </header>
  );
};
